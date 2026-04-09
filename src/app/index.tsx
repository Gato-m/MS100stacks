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

const SECTION_LABELS: Record<Section, string> = {
  program: "Programma",
  map: "Karte",
  info: "Info",
};

const SEGMENT_PADDING = Spacing.one;
const SEGMENT_GAP = Spacing.one;

export default function HomeScreen() {
  const [activeSection, setActiveSection] = React.useState<Section>("program");
  const [segmentWidth, setSegmentWidth] = React.useState(0);
  const pillX = useSharedValue(0);
  const theme = useTheme();

  const openDetails = () => router.push("/event-details");
  const openFilter = () => router.push("/filter");
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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.headerCard} type="backgroundElement">
          <ThemedText type="smallBold" themeColor="textSecondary">
            City Festival 2026
          </ThemedText>
          <ThemedText type="subtitle">Rigas Vasaras Festivals</ThemedText>
          <ThemedText themeColor="textSecondary">
            12-14 juls | Centra parks un vecpilseta
          </ThemedText>
        </ThemedView>

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
                  backgroundColor: theme.backgroundSelected,
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
                    themeColor={isActive ? "text" : "textSecondary"}
                  >
                    {SECTION_LABELS[section]}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </ThemedView>

        <ScrollView
          contentContainerStyle={styles.contentArea}
          showsVerticalScrollIndicator={false}
        >
          {activeSection === "program" && (
            <ProgramSection
              onOpenDetails={openDetails}
              onOpenFilter={openFilter}
            />
          )}
          {activeSection === "map" && <MapSection />}
          {activeSection === "info" && <InfoSection onOpenAbout={openAbout} />}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function ProgramSection({
  onOpenDetails,
  onOpenFilter,
}: {
  onOpenDetails: () => void;
  onOpenFilter: () => void;
}) {
  return (
    <View style={styles.sectionWrapper}>
      <ThemedView type="backgroundElement" style={styles.rowHeader}>
        <ThemedText type="smallBold">Sodienas programma</ThemedText>
        <Pressable onPress={onOpenFilter}>
          <ThemedText type="linkPrimary">Filtri</ThemedText>
        </Pressable>
      </ThemedView>

      <EventCard
        time="14:00"
        title="Ielas muzikas parade"
        stage="Brivibas laukums"
        onPress={onOpenDetails}
      />
      <EventCard
        time="16:30"
        title="Pilssetas stastu skatuve"
        stage="Mazais amfiteatris"
        onPress={onOpenDetails}
      />
      <EventCard
        time="20:00"
        title="Vakara koncerts"
        stage="Liela skatuve"
        onPress={onOpenDetails}
      />
    </View>
  );
}

function MapSection() {
  return (
    <View style={styles.sectionWrapper}>
      <ThemedView type="backgroundElement" style={styles.mapCard}>
        <ThemedText type="smallBold">Interaktiva karte</ThemedText>
        <ThemedText themeColor="textSecondary">
          Skatuves, edinasanas zonas un WC punkti vienuviet.
        </ThemedText>
        <ThemedView type="backgroundSelected" style={styles.fakeMap}>
          <ThemedText type="small">
            Karte tiks pieslegta ar realiem koordinatu datiem
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </View>
  );
}

function InfoSection({ onOpenAbout }: { onOpenAbout: () => void }) {
  return (
    <View style={styles.sectionWrapper}>
      <ThemedView type="backgroundElement" style={styles.infoCard}>
        <ThemedText type="smallBold">Noderiga informacija</ThemedText>
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
        <ThemedText type="smallBold">{time}</ThemedText>
        <ThemedText>{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {stage}
        </ThemedText>
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
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.three,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  headerCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  segmentContainer: {
    borderRadius: Spacing.five,
    padding: SEGMENT_PADDING,
    flexDirection: "row",
    gap: SEGMENT_GAP,
    position: "relative",
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
    paddingBottom: Spacing.four,
  },
  sectionWrapper: {
    gap: Spacing.three,
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
    padding: Spacing.three,
    gap: Spacing.one,
  },
  mapCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  fakeMap: {
    minHeight: 220,
    borderRadius: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.three,
  },
  infoCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  infoAction: {
    marginTop: Spacing.two,
  },
});
