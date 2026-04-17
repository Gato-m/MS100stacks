import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import VietaIcon from "@/assets/images/vieta.svg";
import { ContentSectionBlock } from "@/components/content-section-block";
import {
  FESTIVAL_HEADER_HORIZONTAL_PADDING,
  FESTIVAL_HEADER_MAX_WIDTH,
  FestivalHeader,
} from "@/components/festival-header";
import { FESTIVAL_DATES } from "@/components/home/data";
import { InfoSection } from "@/components/home/info-section";
import { MapSection } from "@/components/home/map-section";
import { ProgramSection } from "@/components/home/program-section";
import { FestivalDate, MapCategory, Section } from "@/components/home/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const DATE_PILL_GAP = Spacing.two;

export default function HomeScreen() {
  const [activeSection, setActiveSection] = React.useState<Section>("program");
  const [activeDate, setActiveDate] = React.useState<FestivalDate>(
    FESTIVAL_DATES[0],
  );
  const [activeMapCategory, setActiveMapCategory] =
    React.useState<MapCategory>("Pasākumi");
  const theme = useTheme();

  const openDetails = () => router.push("/event-details");
  const openAbout = () => router.push("/about");
  const openMapSection = () => setActiveSection("map");

  const sections: Section[] = ["program", "map", "info"];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <FestivalHeader />
        <ContentSectionBlock>
          {activeSection === "program" && (
            <View style={styles.datePillRow}>
              {FESTIVAL_DATES.map((date) => {
                const isActiveDate = activeDate === date;

                return (
                  <Pressable
                    key={date}
                    onPress={() => setActiveDate(date)}
                    style={styles.datePillPressable}
                  >
                    <ThemedView
                      type={isActiveDate ? "accent" : "lightGray"}
                      style={styles.datePill}
                    >
                      <ThemedText
                        type="smallBold"
                        style={styles.pillLabelLarge}
                        themeColor={isActiveDate ? "white" : "textSecondary"}
                      >
                        {date}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </View>
          )}

          {activeSection === "map" && (
            <MapSection
              activeMapCategory={activeMapCategory}
              setActiveMapCategory={setActiveMapCategory}
              showMap={false}
            />
          )}
        </ContentSectionBlock>

        {activeSection === "map" && (
          <ThemedView
            style={[
              styles.headerCard,
              activeSection === "map" && styles.headerCardMap,
            ]}
            type="backgroundElement"
          >
            <MapSection
              activeMapCategory={activeMapCategory}
              setActiveMapCategory={setActiveMapCategory}
              showCategories={false}
            />
          </ThemedView>
        )}

        {activeSection !== "map" && (
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentArea}
            showsVerticalScrollIndicator={false}
          >
            {activeSection === "program" && (
              <ProgramSection
                activeDate={activeDate}
                onOpenDetails={openDetails}
                onOpenMap={openMapSection}
              />
            )}
            {activeSection === "info" && (
              <InfoSection onOpenAbout={openAbout} />
            )}
          </ScrollView>
        )}

        <View style={styles.iconNavContainer}>
          {sections.map((section) => {
            const isActive = activeSection === section;
            const tintColor = isActive ? theme.white : theme.textSecondary;

            return (
              <Pressable
                key={section}
                onPress={() => setActiveSection(section)}
                style={styles.iconNavPressable}
              >
                <View
                  style={[
                    styles.iconNavItem,
                    {
                      backgroundColor: isActive
                        ? theme.accent
                        : theme.lightGray,
                    },
                  ]}
                >
                  {section === "program" && (
                    <SymbolView
                      name={{
                        ios: "calendar",
                        android: "event",
                        web: "event",
                      }}
                      size={32}
                      tintColor={tintColor}
                    />
                  )}
                  {section === "map" && (
                    <Image
                      source={VietaIcon}
                      contentFit="contain"
                      style={[styles.mapNavIcon, { tintColor }]}
                    />
                  )}
                  {section === "info" && (
                    <SymbolView
                      name={{
                        ios: "info.circle",
                        android: "info",
                        web: "info",
                      }}
                      size={32}
                      tintColor={tintColor}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    paddingTop: Spacing.four,
    paddingHorizontal: FESTIVAL_HEADER_HORIZONTAL_PADDING,
    gap: Spacing.three,
    paddingBottom: Spacing.four,
    maxWidth: FESTIVAL_HEADER_MAX_WIDTH,
    width: "100%",
    alignSelf: "center",
  },
  contentScroll: {
    flex: 1,
    marginTop: 0,
    paddingTop: 0,
  },
  headerCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  headerCardMap: {
    flex: 1,
    marginBottom: Spacing.four,
  },
  datePillRow: {
    flexDirection: "row",
    gap: DATE_PILL_GAP,
    marginTop: 0,
  },
  datePillPressable: {
    flex: 1,
  },
  datePill: {
    borderRadius: Spacing.four,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  pillLabelLarge: {
    fontSize: 16,
    lineHeight: 20,
  },
  iconNavContainer: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.five + 15,
    flexDirection: "row",
    gap: Spacing.one,
    position: "absolute",
    left: FESTIVAL_HEADER_HORIZONTAL_PADDING,
    right: FESTIVAL_HEADER_HORIZONTAL_PADDING,
    bottom: Spacing.five,
    zIndex: 20,
  },
  iconNavPressable: {
    flex: 1,
    alignItems: "center",
  },
  iconNavItem: {
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22.5,
  },
  mapNavIcon: {
    width: 32,
    height: 32,
  },
  contentArea: {
    paddingTop: 0,
    paddingBottom: Spacing.six + Spacing.five,
  },
});
