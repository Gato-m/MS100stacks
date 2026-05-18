import { AnimatedEntry } from "@/components/AnimatedEntry";
import { DatePillSelector } from "@/components/DatePillSelector";
import { Pill } from "@/components/Pill";
import { SectionCard } from "@/components/SectionCard";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/design/ThemeProvider";
import {
  cancelScheduledReminder,
  ensureReminderPermissions,
  scheduleEventReminder,
} from "@/lib/eventNotifications";
import { Image } from "expo-image";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { SymbolView } from "expo-symbols";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import events2026 from "../../lib/events2026.json";

const PLACE_IMAGE_BY_FILE: Record<string, any> = {
  "biblio.png": require("../../assets/images/biblio.png"),
  "estrade.png": require("../../assets/images/estrade.png"),
  "priezhubaskets.png": require("../../assets/images/priezhubaskets.png"),
  "izstades.png": require("../../assets/images/izstades.png"),
  "gimnazija.png": require("../../assets/images/gimnazija.png"),
  "fest.png": require("../../assets/images/fest.png"),
  "tirgus.png": require("../../assets/images/tirgus.png"),
  "vide.png": require("../../assets/images/vide.png"),
  "vides-izstades.png": require("../../assets/images/vides-izstades.png"),
  "blaumanja.png": require("../../assets/images/blaumanja.png"),
  "moto.png": require("../../assets/images/moto.png"),
  "madona.png": require("../../assets/images/madona.png"),
  "madona-skolas.png": require("../../assets/images/madona-skolas.png"),
  "kartingi.png": require("../../assets/images/kartingi.png"),
  "stienis.png": require("../../assets/images/stienis.png"),
  "streetfood.png": require("../../assets/images/streetfood.png"),
  "priezhukalns.png": require("../../assets/images/priezhukalns.png"),
};

type PlaceJsonItem = {
  id: string;
  place: string;
  img?: string;
  latLong?: [number, number];
};

type EventItem = {
  eventId: string;
  date: string;
  time: string;
  title?: string;
  place?: string;
  categorie?: string;
};

type ReminderNotificationData = {
  eventId?: string;
  minutesBefore?: number;
};

const REMINDER_OPTIONS = [
  { minutesBefore: 15, label: "15 min pirms sākuma" },
  { minutesBefore: 30, label: "30 minutes pirms sākuma" },
] as const;

type PlaceData = {
  eventId?: string;
  id?: string;
  latLong?: [number, number];
  place?: string;
  name?: string;
  title?: string;
  description?: string;
};

type EventPlaceModalProps = {
  visible: boolean;
  onClose: () => void;
  place: PlaceData | null;
  selectedEventCategory?:
    | "all"
    | "concerts"
    | "exhibitions"
    | "kids"
    | "sports"
    | "moto"
    | "streetFood";
};

function matchesEventCategory(
  event: EventItem,
  category:
    | "all"
    | "concerts"
    | "exhibitions"
    | "kids"
    | "sports"
    | "moto"
    | "streetFood",
): boolean {
  if (category === "all") return true;

  const byCategorie = categoryFromEvent(event);
  if (byCategorie) return byCategorie === category;

  const h = `${event.title ?? ""} ${event.place ?? ""}`.toLowerCase();
  switch (category) {
    case "concerts":
      return (
        h.includes("koncert") ||
        h.includes("grupa") ||
        h.includes("mūzik") ||
        h.includes("dzies")
      );
    case "exhibitions":
      return h.includes("izstād") || h.includes("ekspozī");
    case "kids":
      return (
        h.includes("bērn") ||
        h.includes("ģimen") ||
        h.includes("klaun") ||
        h.includes("atrakc")
      );
    case "sports":
      return (
        h.includes("sport") ||
        h.includes("čempion") ||
        h.includes("topbumba") ||
        h.includes("spiešan")
      );
    case "moto":
      return (
        h.includes("moto") || h.includes("motocikl") || h.includes("karting")
      );
    case "streetFood":
      return h.includes("streetfood") || h.includes("street food");
    default:
      return true;
  }
}

const STORE_URLS = {
  google: Platform.select({
    ios: "https://apps.apple.com/app/id585027354",
    android:
      "https://play.google.com/store/apps/details?id=com.google.android.apps.maps",
    default: "https://www.google.com/maps",
  }),
  waze: Platform.select({
    ios: "https://apps.apple.com/app/id323229106",
    android: "https://play.google.com/store/apps/details?id=com.waze",
    default: "https://www.waze.com/apps",
  }),
} as const;

const MONTHS_LV = [
  "janvāris",
  "februāris",
  "marts",
  "aprīlis",
  "maijs",
  "jūnijs",
  "jūlijs",
  "augusts",
  "septembris",
  "oktobris",
  "novembris",
  "decembris",
] as const;

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

function normalizeCategory(value?: string) {
  return normalize(value).replace(/[\s_-]+/g, "");
}

function categoryFromEvent(
  event: EventItem,
):
  | "concerts"
  | "exhibitions"
  | "kids"
  | "sports"
  | "moto"
  | "streetFood"
  | null {
  const raw = normalizeCategory(event.categorie);
  if (!raw) return null;

  if (raw === "koncerts" || raw === "koncerti") return "concerts";
  if (raw === "izstades" || raw === "izstade") return "exhibitions";
  if (raw.startsWith("bern")) return "kids";
  if (raw === "sports") return "sports";
  if (raw === "moto" || raw === "motobrauciens") return "moto";
  if (raw === "ediens" || raw === "streetfood") return "streetFood";
  return null;
}

function formatDateLatvian(dateString: string) {
  const [year, month, day] = dateString.split("-");
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const parsedDay = Number(day);

  if (
    !Number.isInteger(parsedYear) ||
    !Number.isInteger(parsedMonth) ||
    !Number.isInteger(parsedDay) ||
    parsedMonth < 1 ||
    parsedMonth > 12
  ) {
    return dateString;
  }

  return `${parsedDay}. ${MONTHS_LV[parsedMonth - 1]}`;
}

export default function EventPlaceModal({
  visible,
  onClose,
  place,
  selectedEventCategory = "all",
}: EventPlaceModalProps) {
  const { theme } = useTheme();
  const screenHeight = Dimensions.get("window").height;

  const [isRouteSheetVisible, setIsRouteSheetVisible] = useState(false);
  const [isRouteSheetMounted, setIsRouteSheetMounted] = useState(false);
  const [activeReminderEvent, setActiveReminderEvent] =
    useState<EventItem | null>(null);
  const [isReminderSheetVisible, setIsReminderSheetVisible] = useState(false);
  const [isReminderSheetMounted, setIsReminderSheetMounted] = useState(false);
  const [selectedReminderMinutes, setSelectedReminderMinutes] = useState<
    number[]
  >([]);
  const [scheduledReminderIds, setScheduledReminderIds] = useState<
    Record<string, Record<number, string>>
  >({});
  const [imageAspectRatio, setImageAspectRatio] = useState(16 / 9);
  const routeSheetTranslateY = useRef(new Animated.Value(screenHeight)).current;
  const routeSheetBackdropOpacity = useRef(new Animated.Value(0)).current;
  const reminderSheetTranslateY = useRef(
    new Animated.Value(screenHeight),
  ).current;
  const reminderSheetBackdropOpacity = useRef(new Animated.Value(0)).current;
  const activeReminderEventIdRef = useRef<string | null>(null);

  const resolvePlaceImage = useCallback(
    (placeData: PlaceData | null) => {
      if (!placeData) {
        return undefined;
      }

      if (placeData.eventId === "evt-019") {
        return PLACE_IMAGE_BY_FILE["moto.png"];
      }

      const placeKey = canonicalizePlaceName(placeData.place || placeData.name);
      if (selectedEventCategory === "sports" && placeKey) {
        const hasMotoRideEvent = (events2026 as EventItem[]).some(
          (event) =>
            canonicalizePlaceName(event.place) === placeKey &&
            normalize(event.title).includes("motociklu brauciens pilseta"),
        );

        if (hasMotoRideEvent) {
          return PLACE_IMAGE_BY_FILE["moto.png"];
        }
      }

      // Meklē attēlu pēc event datiem (jau iepriekš ieviests)
      // ...existing code...
    },
    [selectedEventCategory],
  );

  const eventsRaw = events2026 as EventItem[];
  const selectedPlaceName = place?.place || place?.name || "";
  const selectedPlaceKey = canonicalizePlaceName(selectedPlaceName);
  const destinationCoords = useMemo(() => {
    let found;
    if (place?.id) {
      found = eventsRaw.find(
        (ev) => ev.id === place.id && ev.latLong && Array.isArray(ev.latLong),
      );
    }
    if (!found && selectedPlaceKey) {
      found = eventsRaw.find(
        (ev) =>
          canonicalizePlaceName(ev.place) === selectedPlaceKey &&
          ev.latLong &&
          Array.isArray(ev.latLong),
      );
    }
    return found?.latLong && found.latLong.length === 2
      ? found.latLong
      : place?.latLong && place.latLong.length === 2
        ? place.latLong
        : null;
  }, [place?.id, place?.latLong, selectedPlaceKey]);

  const placeEvents = useMemo(() => {
    const placeMatchedEvents = eventsRaw.filter(
      (event) => canonicalizePlaceName(event.place) === selectedPlaceKey,
    );

    if (selectedEventCategory === "all") {
      return placeMatchedEvents;
    }

    return placeMatchedEvents.filter((event) =>
      matchesEventCategory(event, selectedEventCategory),
    );
  }, [eventsRaw, selectedPlaceKey, selectedEventCategory]);

  const weekLongEvents = useMemo(
    () => placeEvents.filter((event) => event.date === "Visu nedēļu"),
    [placeEvents],
  );

  const datedEvents = useMemo(
    () => placeEvents.filter((event) => event.date !== "Visu nedēļu"),
    [placeEvents],
  );

  const availableDates = useMemo(() => {
    return Array.from(new Set(datedEvents.map((event) => event.date))).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [datedEvents]);

  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (availableDates.length === 0) {
      setSelectedDate("");
      return;
    }

    setSelectedDate(availableDates[0]);
  }, [availableDates, selectedPlaceKey]);

  const imageSource = useMemo(() => {
    if (selectedEventCategory === "sports") {
      if (selectedDate === "2026-06-05") {
        return PLACE_IMAGE_BY_FILE["priezhubaskets.png"];
      }
      if (selectedDate === "2026-06-06") {
        return PLACE_IMAGE_BY_FILE["stienis.png"];
      }
    }

    return resolvePlaceImage(place);
  }, [place, selectedDate, selectedEventCategory, resolvePlaceImage]);

  const filteredPlaceEvents = useMemo(() => {
    if (!selectedDate) {
      return weekLongEvents;
    }

    const eventsForDate = datedEvents.filter(
      (event) => event.date === selectedDate,
    );

    return [...weekLongEvents, ...eventsForDate];
  }, [datedEvents, selectedDate, weekLongEvents]);

  useEffect(() => {
    activeReminderEventIdRef.current = activeReminderEvent?.eventId ?? null;
  }, [activeReminderEvent?.eventId]);

  const clearFiredReminder = useCallback(
    (eventId: string, minutesBefore: number) => {
      setScheduledReminderIds((previous) => {
        const eventReminders = { ...(previous[eventId] ?? {}) };
        if (!eventReminders[minutesBefore]) {
          return previous;
        }

        delete eventReminders[minutesBefore];
        if (Object.keys(eventReminders).length === 0) {
          const updated = { ...previous };
          delete updated[eventId];
          return updated;
        }
        return { ...previous, [eventId]: eventReminders };
      });

      if (activeReminderEventIdRef.current === eventId) {
        setSelectedReminderMinutes((previous) =>
          previous.filter((value) => value !== minutesBefore),
        );
      }
    },
    [],
  );

  useEffect(() => {
    if (isRouteSheetVisible) {
      setIsRouteSheetMounted(true);
    }
  }, [isRouteSheetVisible]);

  useEffect(() => {
    if (isReminderSheetVisible) {
      setIsReminderSheetMounted(true);
    }
  }, [isReminderSheetVisible]);

  useEffect(() => {
    if (!isRouteSheetMounted) {
      return;
    }

    if (isRouteSheetVisible) {
      routeSheetTranslateY.setValue(screenHeight);
      routeSheetBackdropOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(routeSheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          mass: 0.5,
        }),
        Animated.timing(routeSheetBackdropOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(routeSheetTranslateY, {
        toValue: screenHeight,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(routeSheetBackdropOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsRouteSheetMounted(false);
      }
    });
  }, [
    isRouteSheetMounted,
    isRouteSheetVisible,
    routeSheetBackdropOpacity,
    routeSheetTranslateY,
    screenHeight,
  ]);

  useEffect(() => {
    if (!isReminderSheetMounted) {
      return;
    }

    if (isReminderSheetVisible) {
      reminderSheetTranslateY.setValue(screenHeight);
      reminderSheetBackdropOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(reminderSheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          mass: 0.5,
        }),
        Animated.timing(reminderSheetBackdropOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(reminderSheetTranslateY, {
        toValue: screenHeight,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(reminderSheetBackdropOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsReminderSheetMounted(false);
      }
    });
  }, [
    isReminderSheetMounted,
    isReminderSheetVisible,
    reminderSheetBackdropOpacity,
    reminderSheetTranslateY,
    screenHeight,
  ]);

  useEffect(() => {
    const handleNotification = (notification: Notifications.Notification) => {
      const data = notification.request.content
        .data as ReminderNotificationData;
      const eventId = typeof data?.eventId === "string" ? data.eventId : null;
      const minutesBefore =
        typeof data?.minutesBefore === "number" ? data.minutesBefore : null;

      if (!eventId || minutesBefore == null) {
        return;
      }

      clearFiredReminder(eventId, minutesBefore);
    };

    const receivedSubscription =
      Notifications.addNotificationReceivedListener(handleNotification);
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotification(response.notification);
      });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [clearFiredReminder]);

  const closeRouteSheet = useCallback(() => {
    setIsRouteSheetVisible(false);
  }, []);

  const openReminderSheet = useCallback(
    (event: EventItem) => {
      if (event.date === "Visu nedēļu") {
        return;
      }

      setActiveReminderEvent(event);
      setIsReminderSheetVisible(true);
      setSelectedReminderMinutes(
        Object.keys(scheduledReminderIds[event.eventId] ?? {}).map(Number),
      );
    },
    [scheduledReminderIds],
  );

  const closeReminderSheet = useCallback(() => {
    setIsReminderSheetVisible(false);
    setActiveReminderEvent(null);
    setSelectedReminderMinutes([]);
  }, []);

  const toggleReminder = useCallback(
    async (minutesBefore: number) => {
      if (!activeReminderEvent) {
        return;
      }

      const existingNotificationId =
        scheduledReminderIds[activeReminderEvent.eventId]?.[minutesBefore];

      if (existingNotificationId) {
        await cancelScheduledReminder(existingNotificationId);
        setScheduledReminderIds((previous) => {
          const eventReminders = {
            ...(previous[activeReminderEvent.eventId] ?? {}),
          };
          delete eventReminders[minutesBefore];

          if (Object.keys(eventReminders).length === 0) {
            const next = { ...previous };
            delete next[activeReminderEvent.eventId];
            return next;
          }

          return {
            ...previous,
            [activeReminderEvent.eventId]: eventReminders,
          };
        });
        setSelectedReminderMinutes((previous) =>
          previous.filter((value) => value !== minutesBefore),
        );
        return;
      }

      const hasPermission = await ensureReminderPermissions();
      if (!hasPermission) {
        Alert.alert(
          "Atgādinājumi nav atļauti",
          "Lai saņemtu atgādinājumus, lūdzu atļaujiet paziņojumus ierīces iestatījumos.",
        );
        return;
      }

      if (!activeReminderEvent.title || !activeReminderEvent.place) {
        Alert.alert(
          "Atgādinājumu nevar ieplānot",
          "Pasākumam trūkst nepieciešamie dati atgādinājuma izveidei.",
        );
        return;
      }

      const scheduledId = await scheduleEventReminder(
        {
          eventId: activeReminderEvent.eventId,
          date: activeReminderEvent.date,
          time: activeReminderEvent.time,
          title: activeReminderEvent.title,
          place: activeReminderEvent.place,
        },
        minutesBefore,
      );

      if (!scheduledId) {
        Alert.alert(
          "Atgādinājumu nevar ieplānot",
          "Šim pasākumam atgādinājumu vairs nevar ieplānot, jo sākuma laiks jau ir pagājis vai datums nav derīgs.",
        );
        return;
      }

      setScheduledReminderIds((previous) => ({
        ...previous,
        [activeReminderEvent.eventId]: {
          ...(previous[activeReminderEvent.eventId] ?? {}),
          [minutesBefore]: scheduledId,
        },
      }));
      setSelectedReminderMinutes((previous) =>
        previous.includes(minutesBefore)
          ? previous
          : [...previous, minutesBefore].sort((left, right) => left - right),
      );
    },
    [activeReminderEvent, scheduledReminderIds],
  );

  const handleCloseModal = useCallback(() => {
    closeRouteSheet();
    closeReminderSheet();
    onClose();
  }, [closeReminderSheet, closeRouteSheet, onClose]);

  const openDirections = useCallback(
    async (provider: "google" | "waze") => {
      if (!destinationCoords) {
        Alert.alert("Nav galamērķa", "Šai vietai nav pieejamas koordinātas.");
        return;
      }

      const [destLat, destLng] = destinationCoords;
      const destinationCoordsPair = `${destLat},${destLng}`;
      let originCoordsPair: string | null = null;

      if (provider === "google") {
        try {
          const permission = await Location.requestForegroundPermissionsAsync();
          if (permission.status === "granted") {
            const currentPosition = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            originCoordsPair = `${currentPosition.coords.latitude},${currentPosition.coords.longitude}`;
          }
        } catch {
          originCoordsPair = null;
        }
      }

      const appUrl =
        provider === "google"
          ? originCoordsPair
            ? `comgooglemaps://?saddr=${originCoordsPair}&daddr=${destinationCoordsPair}&directionsmode=driving`
            : `comgooglemaps://?daddr=${destinationCoordsPair}&directionsmode=driving`
          : `waze://?ll=${destinationCoordsPair}&navigate=yes`;

      try {
        await Linking.openURL(appUrl);
        closeRouteSheet();
        return;
      } catch {
        // App is not installed or URL scheme can't be handled.
      }

      const storeUrl = STORE_URLS[provider];
      const storeLabel = Platform.OS === "ios" ? "App Store" : "Google Play";

      Alert.alert(
        "Neizdevās atvērt karti",
        provider === "google"
          ? "Google Maps nav pieejama ierīcē. Vai atvērt App Store/Google Play?"
          : "Waze nav pieejama ierīcē. Vai atvērt App Store/Google Play?",
        [
          {
            text: "Atcelt",
            style: "cancel",
          },
          {
            text: `Atvērt ${storeLabel}`,
            onPress: () => {
              if (storeUrl) {
                void Linking.openURL(storeUrl);
              }
            },
          },
        ],
      );
    },
    [closeRouteSheet, destinationCoords],
  );

  const openApplePoint = useCallback(async () => {
    if (!destinationCoords) {
      Alert.alert("Nav galamērķa", "Šai vietai nav pieejamas koordinātas.");
      return;
    }

    const [destLat, destLng] = destinationCoords;
    const destinationCoordsPair = `${destLat},${destLng}`;
    const destinationLabel = encodeURIComponent(
      place?.place || place?.name || "Galamērķis",
    );

    let originCoordsPair: string | null = null;

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status === "granted") {
        const currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        originCoordsPair = `${currentPosition.coords.latitude},${currentPosition.coords.longitude}`;
      }
    } catch {
      originCoordsPair = null;
    }

    const urls = [
      ...(originCoordsPair
        ? [
            `maps://?saddr=${originCoordsPair}&daddr=${destinationCoordsPair}&dirflg=d`,
            `http://maps.apple.com/?saddr=${originCoordsPair}&daddr=${destinationCoordsPair}&dirflg=d`,
          ]
        : []),
      `maps://?saddr=Current%20Location&daddr=${destinationCoordsPair}&dirflg=d`,
      `http://maps.apple.com/?saddr=Current%20Location&daddr=${destinationCoordsPair}&dirflg=d`,
      `maps://?ll=${destinationCoordsPair}&q=${destinationLabel}`,
      `http://maps.apple.com/?ll=${destinationCoordsPair}&q=${destinationLabel}`,
    ];

    for (const url of urls) {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        continue;
      }

      await Linking.openURL(url);
      closeRouteSheet();
      return;
    }

    Alert.alert(
      "Neizdevās atvērt karti",
      "Lūdzu, pārbaudiet vai Apple Maps ir pieejama ierīcē.",
    );
  }, [closeRouteSheet, destinationCoords, place?.name, place?.place]);

  return (
    <Modal
      visible={visible}
      onRequestClose={handleCloseModal}
      presentationStyle="pageSheet"
      animationType="slide"
    >
      <View
        style={[styles.modalRoot, { backgroundColor: theme.colors.background }]}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.background,
              borderTopWidth: 14,
              borderTopColor:
                theme.name === "dark"
                  ? theme.colors.background
                  : theme.colors.darkGray,
            },
          ]}
        >
          {imageSource ? (
            <View style={styles.imageWrap}>
              <Image
                source={imageSource}
                style={[styles.image, { aspectRatio: imageAspectRatio }]}
                contentFit="contain"
                onLoad={(event) => {
                  const source = event.source;
                  if (!source?.width || !source?.height) return;
                  setImageAspectRatio(source.width / source.height);
                }}
              />
              <Pressable style={styles.closeButton} onPress={handleCloseModal}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.headerNoImage}>
              <Pressable style={styles.closeButton} onPress={handleCloseModal}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>
          )}

          <View
            style={[
              styles.placeRouteRow,
              imageSource ? styles.placeRouteRowOverlay : null,
            ]}
          >
            <ThemedText
              variant="bigTitle"
              color="accent2"
              style={styles.title}
              numberOfLines={3}
            >
              {place?.place || place?.name}
            </ThemedText>
            <Pressable
              onPress={() => setIsRouteSheetVisible(true)}
              style={[
                styles.routeButton,
                {
                  backgroundColor: theme.colors.accent2,
                  paddingHorizontal: theme.spacing.three,
                  paddingVertical: theme.spacing.one * 2,
                  borderWidth: 1,
                  borderColor:
                    theme.name === "dark"
                      ? theme.colors.darkGray
                      : theme.colors.lightGray,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Atvērt maršruta izvēlni"
            >
              <ThemedText
                variant="body"
                color="white"
                style={styles.routeButtonText}
              >
                ↗ Maršruts
              </ThemedText>
            </Pressable>
          </View>

          {availableDates.length > 0 ? (
            <DatePillSelector
              dates={availableDates}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              formatDate={formatDateLatvian}
            />
          ) : null}

          <ScrollView
            style={styles.eventsScroll}
            contentContainerStyle={styles.eventsContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredPlaceEvents.length === 0 ? (
              <ThemedText
                variant="body"
                color="textSecondary"
                style={styles.emptyText}
              >
                Šajā datumā šai vietai nav pasākumu.
              </ThemedText>
            ) : (
              filteredPlaceEvents.map((event, index) => {
                const isReminderAllowed = event.date !== "Visu nedēļu";
                const hasScheduledReminder =
                  Object.keys(scheduledReminderIds[event.eventId] ?? {})
                    .length > 0;

                return (
                  <AnimatedEntry key={event.eventId} index={index}>
                    <SectionCard style={styles.sectionCard}>
                      <View style={styles.cardRow}>
                        <View style={styles.leftColumn}>
                          <View style={styles.metaRow}>
                            <Pill
                              variant="time"
                              style={{ alignSelf: "center" }}
                            >
                              {event.time}
                            </Pill>
                            <ThemedText
                              variant="body"
                              color={
                                theme.name === "dark"
                                  ? "lightGray"
                                  : "textSecondary"
                              }
                              style={styles.placeText}
                            >
                              {event.place}
                            </ThemedText>
                          </View>
                        </View>
                        {isReminderAllowed ? (
                          <Pressable
                            onPress={() => {
                              openReminderSheet(event);
                            }}
                            style={styles.clockColumn}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel={`Iestatīt atgādinājumu pasākumam ${event.title ?? "Pasākums"}`}
                          >
                            <View
                              style={[
                                styles.eventReminderIconWrap,
                                hasScheduledReminder && {
                                  backgroundColor: theme.colors.darkRed,
                                },
                              ]}
                            >
                              <Image
                                source={require("../../assets/icons/clock.svg")}
                                contentFit="contain"
                                style={[
                                  styles.clockIcon,
                                  {
                                    tintColor: hasScheduledReminder
                                      ? theme.colors.white
                                      : theme.colors.darkRed,
                                  },
                                ]}
                              />
                            </View>
                          </Pressable>
                        ) : null}
                      </View>
                      <View style={styles.cardRowTitle}>
                        <ThemedText
                          variant="subTitle"
                          color={theme.name === "dark" ? "lightGray" : "text"}
                          style={styles.sectionTitle}
                        >
                          {event.title || "Pasākums"}
                        </ThemedText>
                      </View>
                    </SectionCard>
                  </AnimatedEntry>
                );
              })
            )}
          </ScrollView>
        </View>

        {isRouteSheetMounted ? (
          <View style={styles.sheetOverlay}>
            <Animated.View
              style={[
                styles.sheetBackdrop,
                { opacity: routeSheetBackdropOpacity },
              ]}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={closeRouteSheet}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.routeSheet,
                {
                  backgroundColor: theme.colors.background,
                  borderColor:
                    theme.name === "dark"
                      ? theme.colors.darkGray
                      : theme.colors.lightGray,
                  borderTopWidth: 3,
                  borderTopColor:
                    theme.name === "dark"
                      ? theme.colors.darkGray
                      : theme.colors.lightGray,
                  transform: [{ translateY: routeSheetTranslateY }],
                },
              ]}
            >
              <View
                style={[
                  styles.routeSheetHandle,
                  { backgroundColor: theme.colors.darkGray },
                ]}
              />

              <Pressable
                onPress={closeRouteSheet}
                style={[
                  styles.routeSheetCloseButton,
                  { backgroundColor: theme.colors.lightGray },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Aizvērt maršruta izvēlni"
                hitSlop={8}
              >
                <Text style={styles.routeSheetCloseText}>✕</Text>
              </Pressable>

              <ThemedText
                variant="subTitle"
                color={theme.name === "dark" ? "darkGray" : "text"}
                style={styles.routeSheetTitle}
              >
                Parādīt maršrutu lietotnē
              </ThemedText>

              <View style={styles.routeOptionsList}>
                <Pressable
                  style={[
                    styles.routeOptionRow,
                    {
                      borderColor:
                        theme.name === "dark"
                          ? theme.colors.darkGray
                          : theme.colors.lightGray,
                    },
                  ]}
                  onPress={() => {
                    void openDirections("google");
                  }}
                >
                  <ThemedText
                    variant="subTitle"
                    color="accent2"
                    style={styles.routeOptionText}
                  >
                    Google map
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.routeOptionRow,
                    {
                      borderColor:
                        theme.name === "dark"
                          ? theme.colors.darkGray
                          : theme.colors.lightGray,
                    },
                  ]}
                  onPress={() => {
                    void openApplePoint();
                  }}
                >
                  <ThemedText
                    variant="subTitle"
                    color="accent2"
                    style={styles.routeOptionText}
                  >
                    Apple map
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.routeOptionRow,
                    {
                      borderColor:
                        theme.name === "dark"
                          ? theme.colors.darkGray
                          : theme.colors.lightGray,
                    },
                  ]}
                  onPress={() => {
                    void openDirections("waze");
                  }}
                >
                  <ThemedText
                    variant="subTitle"
                    color="accent2"
                    style={styles.routeOptionText}
                  >
                    Waze
                  </ThemedText>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        ) : null}

        {isReminderSheetMounted ? (
          <View style={styles.sheetOverlay}>
            <Animated.View
              style={[
                styles.sheetBackdrop,
                { opacity: reminderSheetBackdropOpacity },
              ]}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={closeReminderSheet}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.reminderSheet,
                {
                  backgroundColor: theme.colors.background,
                  borderColor:
                    theme.name === "dark"
                      ? theme.colors.lightGray
                      : theme.colors.lightGray,
                  transform: [{ translateY: reminderSheetTranslateY }],
                },
              ]}
            >
              <View
                style={[
                  styles.reminderSheetHandle,
                  { backgroundColor: theme.colors.darkGray },
                ]}
              />

              <Pressable
                onPress={closeReminderSheet}
                style={[
                  styles.reminderSheetCloseButton,
                  { backgroundColor: theme.colors.lightGray },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Aizvērt atgādinājuma izvēlni"
                hitSlop={8}
              >
                <SymbolView
                  size={18}
                  weight="semibold"
                  tintColor={theme.colors.text}
                  name={{ ios: "xmark", android: "close", web: "close" }}
                />
              </Pressable>

              <ThemedText
                variant="subTitle"
                color={theme.name === "dark" ? "textSecondary" : "text"}
                style={styles.reminderSheetTitle}
              >
                Vai vēlaties saņemt atgādinājumu par pasākuma sākumu?
              </ThemedText>

              <View style={styles.reminderOptionsList}>
                {REMINDER_OPTIONS.map((option) => {
                  const isSelected = selectedReminderMinutes.includes(
                    option.minutesBefore,
                  );

                  return (
                    <Pressable
                      key={option.minutesBefore}
                      onPress={() => {
                        void toggleReminder(option.minutesBefore);
                      }}
                      style={[
                        styles.reminderOptionRow,
                        {
                          borderColor:
                            theme.name === "dark"
                              ? theme.colors.lightGray
                              : theme.colors.lightGray,
                        },
                      ]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={option.label}
                    >
                      <View
                        style={[
                          styles.reminderOptionIconWrap,
                          isSelected && {
                            backgroundColor: theme.colors.darkRed,
                          },
                        ]}
                      >
                        <Image
                          source={require("../../assets/icons/clock.svg")}
                          contentFit="contain"
                          style={[
                            styles.reminderOptionIcon,
                            {
                              tintColor: isSelected
                                ? theme.colors.white
                                : theme.name === "dark"
                                  ? theme.colors.lightGray
                                  : theme.colors.darkRed,
                            },
                          ]}
                        />
                      </View>
                      <ThemedText
                        variant="body"
                        color={theme.name === "dark" ? "textSecondary" : "text"}
                        style={styles.reminderOptionText}
                      >
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  container: {
    height: "90%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "stretch",
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  imageWrap: {
    marginTop: -24,
    marginLeft: -24,
    marginRight: -24,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
  },
  headerNoImage: {
    marginTop: -24,
    marginLeft: -24,
    marginRight: -24,
    marginBottom: 16,
    height: 56,
    position: "relative",
    backgroundColor: "transparent",
  },
  handle: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    alignSelf: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  closeText: {
    fontSize: 24,
    color: "#888",
  },
  title: {
    marginTop: 8,
    marginBottom: 18,
    textAlign: "left",
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    marginRight: 12,
    fontSize: 24,
    lineHeight: 28,
  },
  placeRouteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  placeRouteRowOverlay: {
    marginTop: -110,
    zIndex: 20,
    position: "relative",
  },
  routeButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    marginTop: 10,
    marginBottom: 10,
  },
  routeButtonText: {
    marginBottom: 0,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  eventsScroll: {
    flex: 1,
  },
  eventsContent: {
    paddingBottom: 28,
  },
  emptyText: {
    marginTop: 8,
  },
  sectionCard: {
    marginTop: 4,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    marginTop: 7,
  },
  placeText: {
    marginLeft: 10,
    marginBottom: 0,
    fontSize: 13,
    flexShrink: 1,
  },
  clockColumn: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    alignSelf: "stretch",
    flexShrink: 0,
    width: 32,
    marginLeft: 4,
    marginRight: -4,
  },
  eventReminderIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  clockIcon: {
    width: 24,
    height: 24,
  },
  cardRowTitle: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  sectionTitle: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 100,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },
  routeSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  routeSheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 18,
  },
  routeSheetCloseButton: {
    position: "absolute",
    top: 14,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  routeSheetCloseText: {
    fontSize: 20,
    color: "#6b7280",
  },
  routeSheetTitle: {
    marginBottom: 14,
    marginRight: 52,
  },
  routeOptionsList: {
    borderRadius: 18,
    gap: 12,
    overflow: "hidden",

    marginBottom: 7,
  },
  routeOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
    borderColor: "#8b8b8b",
  },
  routeOptionText: {
    marginBottom: 0,
    marginTop: 0,
    marginVertical: 0,
  },
  reminderSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  reminderSheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 18,
  },
  reminderSheetCloseButton: {
    position: "absolute",
    top: 14,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderSheetTitle: {
    marginBottom: 18,
    marginRight: 52,
  },
  reminderOptionsList: {
    gap: 12,
  },
  reminderOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  reminderOptionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  reminderOptionIcon: {
    width: 24,
    height: 24,
  },
  reminderOptionText: {
    marginLeft: 14,
    marginBottom: 0,
    flex: 1,
  },
  routeCancelButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
});
