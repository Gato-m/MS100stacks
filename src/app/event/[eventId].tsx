import { Pill } from "@/components/Pill";
import { ThemedText } from "@/components/ThemedText";
import { MarkerIcon } from "@/components/icons/MarkerIcon";
import { useTheme } from "@/design/ThemeProvider";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import eventsData from "../../../lib/events2026.json";

type EventItem = {
  eventId: string;
  date?: string;
  time: string;
  title?: string;
  place?: string;
  addInfo?: string[];
};

type PlaceItem = {
  id: string;
  place: string;
  img?: string;
};

const PLACE_IMAGE_BY_FILE: Record<string, any> = {
  "biblio.png": require("../../../assets/images/biblio.png"),
  "estrade.png": require("../../../assets/images/estrade.png"),
  "priezhubaskets.png": require("../../../assets/images/priezhubaskets.png"),
  "izstades.png": require("../../../assets/images/izstades.png"),
  "gimnazija.png": require("../../../assets/images/gimnazija.png"),
  "fest.png": require("../../../assets/images/fest.png"),
  "tirgus.png": require("../../../assets/images/tirgus.png"),
  "vide.png": require("../../../assets/images/vide.png"),
  "vides-izstades.png": require("../../../assets/images/vides-izstades.png"),
  "blaumanja.png": require("../../../assets/images/blaumanja.png"),
  "moto.png": require("../../../assets/images/moto.png"),
  "madona.png": require("../../../assets/images/madona.png"),
  "madona-skolas.png": require("../../../assets/images/madona-skolas.png"),
  "kartingi.png": require("../../../assets/images/kartingi.png"),
  "streetfood.png": require("../../../assets/images/streetfood.png"),
};

const PLACE_NAME_ALIASES: Record<string, string> = {
  biblioteka: "madonas novada biblioteka",
  "izstazu zales": "madonas novadpetniecibas un makslas muzejs",
  "madonas gimnazija": "madonas valsts gimnazija",
};

function normalize(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function canonicalizePlaceName(value?: string) {
  const normalized = normalize(value);
  if (!normalized) return "";

  if (
    normalized.includes("saieta laukums") ||
    normalized.includes("streetfood skatuve")
  ) {
    return "saieta laukums";
  }

  return PLACE_NAME_ALIASES[normalized] ?? normalized;
}

function getPlaceImage(placeName?: string): number | null {
  // Vietas attēlu ņem no events2026.json unikālajām vietām
  const events = eventsData as EventItem[];
  const placeKey = canonicalizePlaceName(placeName);
  if (!placeKey) return null;
  const matchedEvent = events.find(
    (item) => canonicalizePlaceName(item.place) === placeKey && item.img,
  );
  const file = matchedEvent?.img;
  if (!file || !file.toLowerCase().endsWith(".png")) {
    return null;
  }
  return PLACE_IMAGE_BY_FILE[file] ?? null;
}

export default function EventModalScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();

  const event = useMemo(() => {
    const events = eventsData as EventItem[];
    return events.find((item) => item.eventId === eventId) ?? null;
  }, [eventId]);

  const placeImage = useMemo(
    () => (event ? getPlaceImage(event.place) : null),
    [event],
  );

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      {event ? (
        <View
          style={[
            styles.content,
            {
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.closeButton,
              {
                backgroundColor: theme.colors.lightGray,
                marginTop: theme.spacing.two,
                marginRight: theme.spacing.five,
              },
            ]}
            hitSlop={8}
          >
            <SymbolView
              size={20}
              weight="semibold"
              tintColor={theme.colors.text}
              name={{ ios: "xmark", android: "close", web: "close" }}
            />
          </Pressable>

          {placeImage ? (
            <View style={[styles.heroImageWrap]}>
              <View
                style={[
                  styles.modalHandleWrap,
                  { marginTop: theme.spacing.three },
                ]}
                pointerEvents="none"
              >
                <View
                  style={[
                    styles.dragHandle,
                    { backgroundColor: theme.colors.textSecondary },
                  ]}
                />
              </View>
              <Image
                source={placeImage}
                contentFit="cover"
                style={styles.heroImage}
              />
            </View>
          ) : (
            <View
              style={[
                styles.modalHandleWrap,
                { marginTop: theme.spacing.three },
              ]}
              pointerEvents="none"
            >
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: theme.colors.textSecondary },
                ]}
              />
            </View>
          )}

          <View
            style={[
              styles.bodyContent,
              {
                marginTop: theme.spacing.five,
              },
              !placeImage && { paddingTop: theme.spacing.five * 3 },
            ]}
          >
            <View style={styles.metaRow}>
              <View style={styles.leftColumn}>
                <Pill variant="time">{event.time}</Pill>
                <ThemedText variant="body" style={styles.placeText}>
                  {event.place}
                </ThemedText>
              </View>
              <Pressable
                onPress={() =>
                  router.replace({
                    pathname: "/(tabs)/karte",
                    params: { focusEventId: event.eventId },
                  } as never)
                }
                style={styles.mapLink}
                hitSlop={8}
              >
                <MarkerIcon
                  size={styles.mapIcon.height}
                  color={theme.colors.darkRed}
                />
              </Pressable>
            </View>

            <ThemedText variant="bigTitle" color="accent2" style={styles.title}>
              {event.title}
            </ThemedText>

            <ScrollView
              style={styles.additionalInfoScroll}
              contentContainerStyle={styles.additionalInfoContent}
              showsVerticalScrollIndicator={false}
            >
              {(event.addInfo ?? []).map((info, index) => (
                <ThemedText
                  key={`${event.eventId}-info-${index}`}
                  variant="body"
                  style={styles.infoText}
                >
                  {info}
                </ThemedText>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <ThemedText variant="body">
            Pasākuma informācija nav atrasta.
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  modalHandleWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
    marginBottom: 8,
  },
  dragHandle: {
    width: 46,
    height: 5,
    borderRadius: 999,
    opacity: 0.32,
  },
  content: {
    flex: 1,
    overflow: "hidden",
  },
  heroImageWrap: {
    position: "relative",
    width: "100%",
  },
  heroImage: {
    width: "100%",
    minHeight: 300,
    height: 300,
  },
  bodyContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    minWidth: 0,
    marginBottom: 12,
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  placeText: {
    minWidth: 0,
    flexShrink: 1,
    marginBottom: 0,
  },
  mapLink: {
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 4,
    marginLeft: 12,
  },
  mapIcon: {
    width: 40,
    height: 40,
    tintColor: "#be0a0a",
    marginRight: 10,
    marginTop: -5,
  },
  title: {
    minWidth: 0,
    flexShrink: 1,
    marginBottom: 12,
  },
  additionalInfoScroll: {
    flex: 1,
  },
  additionalInfoContent: {
    paddingBottom: 12,
  },
  infoText: {
    marginBottom: 0,
  },
});
