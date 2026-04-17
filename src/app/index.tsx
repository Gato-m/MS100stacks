import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Section = "program" | "map" | "info";
type FestivalDate = "12. jūlijs" | "13. jūlijs" | "14. jūlijs";
type MapCategory =
  | "Pasākumi"
  | "Koncerti"
  | "Izstādes"
  | "Bērniem"
  | "Sports"
  | "Kafejnīcas"
  | "Satiksmes ierobežojumi";

const SECTION_LABELS: Record<Section, string> = {
  program: "Programma",
  map: "Karte",
  info: "Info",
};

const SEGMENT_PADDING = Spacing.one;
const SEGMENT_GAP = Spacing.one;
const FESTIVAL_DATES: FestivalDate[] = [
  "12. jūlijs",
  "13. jūlijs",
  "14. jūlijs",
];
const MAP_CATEGORIES: MapCategory[] = [
  "Pasākumi",
  "Koncerti",
  "Izstādes",
  "Bērniem",
  "Sports",
  "Kafejnīcas",
  "Satiksmes ierobežojumi",
];

const PROGRAM_EVENTS: Record<
  FestivalDate,
  Array<{ time: string; title: string; stage: string }>
> = {
  "12. jūlijs": [
    {
      time: "13:00",
      title: "Atklāšanas gājiens",
      stage: "Brīvības laukums",
    },
    {
      time: "16:00",
      title: "Jauno grupu skatuve",
      stage: "Mazo skatuvju parks",
    },
    {
      time: "20:30",
      title: "Vakara koncerts",
      stage: "Lielā skatuve",
    },
  ],
  "13. jūlijs": [
    {
      time: "12:30",
      title: "Ģimeņu radošās darbnīcas",
      stage: "Bērnu zona",
    },
    {
      time: "17:00",
      title: "Ielu teātra uzvedums",
      stage: "Vecpilsētas ielas",
    },
    {
      time: "21:00",
      title: "DJ nakts sets",
      stage: "Elektronikas skatuve",
    },
  ],
  "14. jūlijs": [
    {
      time: "14:00",
      title: "Koru sadziedāšanās",
      stage: "Parka estrāde",
    },
    {
      time: "18:30",
      title: "Pilsētas stāstu performance",
      stage: "Mazais amfiteātris",
    },
    {
      time: "22:00",
      title: "Noslēguma gaismu šovs",
      stage: "Centra parks",
    },
  ],
};

export default function HomeScreen() {
  const [activeSection, setActiveSection] = React.useState<Section>("program");
  const [activeDate, setActiveDate] = React.useState<FestivalDate>(
    FESTIVAL_DATES[0],
  );
  const [activeMapCategory, setActiveMapCategory] = React.useState<MapCategory>(
    MAP_CATEGORIES[0],
  );
  const [segmentWidth, setSegmentWidth] = React.useState(0);
  const pillX = useSharedValue(0);
  const theme = useTheme();

  const openDetails = () => router.push("/event-details");
  const openAbout = () => router.push("/about");

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
                      <ThemedView
                        type={isActiveDate ? "accent" : "backgroundSelected"}
                        style={styles.datePill}
                      >
                        <ThemedText
                          type="smallBold"
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
              <View style={styles.mapHeaderSection}>
                <View style={styles.mapCategoryRow}>
                  {MAP_CATEGORIES.map((category) => {
                    const isActiveCategory = activeMapCategory === category;

                    return (
                      <Pressable
                        key={category}
                        onPress={() => setActiveMapCategory(category)}
                        style={styles.mapCategoryPressable}
                      >
                        <ThemedView
                          type={
                            isActiveCategory ? "accent" : "backgroundSelected"
                          }
                          style={styles.mapCategoryPill}
                        >
                          <ThemedText
                            type="smallBold"
                            themeColor={
                              isActiveCategory ? "white" : "textSecondary"
                            }
                          >
                            {category}
                          </ThemedText>
                        </ThemedView>
                      </Pressable>
                    );
                  })}
                </View>

                <ThemedView type="backgroundSelected" style={styles.fakeMap}>
                  <ThemedText type="small">
                    Karte tiks pieslegta ar realiem koordinatu datiem
                  </ThemedText>
                </ThemedView>
              </View>
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
              />
            )}
            {activeSection === "info" && (
              <InfoSection onOpenAbout={openAbout} />
            )}
          </ScrollView>
        )}

        <ThemedView
          type="backgroundElement"
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
                <View style={styles.segmentButton}>
                  <ThemedText
                    type="smallBold"
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

function ProgramSection({
  activeDate,
  onOpenDetails,
}: {
  activeDate: FestivalDate;
  onOpenDetails: () => void;
}) {
  const dayEvents = PROGRAM_EVENTS[activeDate];

  return (
    <View style={styles.programList}>
      {dayEvents.map((event) => (
        <EventCard
          key={`${activeDate}-${event.time}-${event.title}`}
          time={event.time}
          title={event.title}
          stage={event.stage}
          onPress={onOpenDetails}
        />
      ))}
    </View>
  );
}

function MapSection() {
  return null;
}

function InfoSection({ onOpenAbout }: { onOpenAbout: () => void }) {
  return (
    <View style={styles.sectionWrapper}>
      <ThemedView type="backgroundElement" style={styles.infoCard}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Pilsētas svētki 2026
        </ThemedText>
        <ThemedText type="subtitle">Rīgas Festivals</ThemedText>
        <ThemedText themeColor="textSecondary">
          12-14 jūlijs | Centra parks un vecpilsēta
        </ThemedText>
        <ThemedText style={styles.infoText} type="smallBold">
          Noderiga informacija
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Darba laiks: 12:00-23:30
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Atbalsts: +371 2000 0000
        </ThemedText>
        <ThemedText themeColor="textSecondary">Ieeja: bezmaksas</ThemedText>
        <Pressable onPress={onOpenAbout} style={styles.infoAction}>
          <ThemedText type="linkPrimary">Par pasakumu</ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  );
}

function EventCard({
  time,
  title,
  stage,
  onPress,
}: {
  time: string;
  title: string;
  stage: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView type="backgroundElement" style={styles.eventCard}>
        <View style={styles.eventMetaRow}>
          <ThemedView type="accent" style={styles.eventTimePill}>
            <ThemedText type="smallBold" themeColor="white">
              {time}
            </ThemedText>
          </ThemedView>
          <ThemedText style={styles.eventStageText} themeColor="textSecondary">
            {stage}
          </ThemedText>
        </View>
        <ThemedText style={styles.eventTitle}>{title}</ThemedText>
      </ThemedView>
    </Pressable>
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
    flexWrap: "wrap",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  datePillPressable: {
    alignSelf: "flex-start",
  },
  datePill: {
    borderRadius: Spacing.four,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  mapCategoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  mapCategoryPressable: {
    alignSelf: "flex-start",
  },
  mapCategoryPill: {
    borderRadius: Spacing.four,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  mapHeaderSection: {
    marginTop: Spacing.two,
    gap: Spacing.two,
    flex: 1,
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
    paddingVertical: Spacing.two,
  },
  contentArea: {
    paddingBottom: Spacing.six + Spacing.five,
  },
  sectionWrapper: {
    gap: Spacing.three,
  },
  programList: {
    gap: 0,
  },
  rowHeader: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventCard: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: Spacing.two,
  },
  eventTimePill: {
    borderRadius: Spacing.four,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    marginRight: Spacing.two,
  },
  eventStageText: {
    flexShrink: 1,
    textAlign: "right",
    fontSize: 14,
    lineHeight: 18,
  },
  eventTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 600,
  },
  mapCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  fakeMap: {
    flex: 1,
    minHeight: 220,
    borderRadius: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
  infoCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  infoAction: {
    marginTop: Spacing.two,
  },
  infoText: {
    marginTop: Spacing.three,
  },
});
