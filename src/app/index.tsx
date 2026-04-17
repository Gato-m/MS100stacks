import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { FESTIVAL_DATES, SECTION_LABELS } from "@/components/home/data";
import { InfoSection } from "@/components/home/info-section";
import { MapSection } from "@/components/home/map-section";
import { ProgramSection } from "@/components/home/program-section";
import { FestivalDate, MapCategory, Section } from "@/components/home/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const SEGMENT_PADDING = Spacing.one;
const SEGMENT_GAP = Spacing.one;
const DATE_PILL_GAP = Spacing.two;

export default function HomeScreen() {
  const [activeSection, setActiveSection] = React.useState<Section>("program");
  const [activeDate, setActiveDate] = React.useState<FestivalDate>(
    FESTIVAL_DATES[0],
  );
  const [activeMapCategory, setActiveMapCategory] =
    React.useState<MapCategory>("Pasākumi");
  const [segmentWidth, setSegmentWidth] = React.useState(0);
  const pillX = useSharedValue(0);
  const theme = useTheme();

  const openDetails = () => router.push("/event-details");
  const openAbout = () => router.push("/about");
  const openMapSection = () => setActiveSection("map");

  const sections: Section[] = ["program", "map", "info"];
  const selectedIndex = sections.indexOf(activeSection);

  React.useEffect(() => {
    if (!segmentWidth) {
      return;
    }

    pillX.value = withSpring(selectedIndex * (segmentWidth + SEGMENT_GAP), {
      damping: 18,
      stiffness: 260,
      mass: 0.5,
    });
  }, [pillX, segmentWidth, selectedIndex]);

  const pillAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: pillX.value }],
    };
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        {activeSection !== "info" && (
          <ThemedView
            style={[
              styles.headerCard,
              activeSection === "map" && styles.headerCardMap,
            ]}
            type="backgroundElement"
          >
            <ThemedText type="smallBold" themeColor="textSecondary">
              Pilsētas svētki 2026
            </ThemedText>
            <ThemedText type="subtitle">Rīgas Festivals</ThemedText>

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
                      <ThemedView type={isActiveDate ? "accent" : "lightGray"} style={styles.datePill}>
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
              />
            )}
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

        <ThemedView
          type="lightGray"
          style={styles.segmentContainer}
          onLayout={(event) => {
            const totalWidth = event.nativeEvent.layout.width;
            const available =
              totalWidth -
              SEGMENT_PADDING * 2 -
              SEGMENT_GAP * (sections.length - 1);
            setSegmentWidth(available / sections.length);
          }}
        >
          {segmentWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.segmentHighlight,
                {
                  width: segmentWidth,
                  backgroundColor: theme.accent,
                },
                pillAnimatedStyle,
              ]}
            />
          )}
          {sections.map((section) => {
            const isActive = activeSection === section;

            return (
              <Pressable
                key={section}
                onPress={() => setActiveSection(section)}
                style={styles.segmentPressable}
              >
                <View
                  style={[
                    styles.segmentButton,
                    {
                      backgroundColor: isActive
                        ? "transparent"
                        : theme.lightGray,
                    },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={styles.pillLabelLarge}
                    themeColor={isActive ? "white" : "textSecondary"}
                  >
                    {SECTION_LABELS[section]}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </ThemedView>
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
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.four,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  contentScroll: {
    flex: 1,
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
    marginTop: Spacing.two,
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
  segmentContainer: {
    borderRadius: Spacing.five,
    padding: SEGMENT_PADDING,
    flexDirection: "row",
    gap: SEGMENT_GAP,
    position: "absolute",
    left: Spacing.four,
    right: Spacing.four,
    bottom: Spacing.four,
    zIndex: 20,
  },
  segmentHighlight: {
    position: "absolute",
    top: SEGMENT_PADDING,
    left: SEGMENT_PADDING,
    bottom: SEGMENT_PADDING,
    borderRadius: Spacing.five,
  },
  segmentPressable: {
    flex: 1,
    zIndex: 1,
  },
  segmentButton: {
    borderRadius: Spacing.five,
    alignItems: "center",
    paddingVertical: Spacing.two + Spacing.half,
  },
  contentArea: {
    paddingBottom: Spacing.six + Spacing.five,
  },
});
