import { Image } from "expo-image";
import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from "react-native";

import VietaIcon from "@/assets/images/vieta.svg";
import { PROGRAM_EVENTS } from "@/components/home/data";
import { FestivalDate } from "@/components/home/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ProgramSectionProps = {
  activeDate: FestivalDate;
  onOpenDetails: () => void;
  onOpenMap: () => void;
};

type EventCardProps = {
  time: string;
  title: string;
  stage: string;
  onPress: () => void;
  onOpenMap: () => void;
};

export function ProgramSection({
  activeDate,
  onOpenDetails,
  onOpenMap,
}: ProgramSectionProps) {
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
          onOpenMap={onOpenMap}
        />
      ))}
    </View>
  );
}

function EventCard({ time, title, stage, onPress, onOpenMap }: EventCardProps) {
  const theme = useTheme();

  const handleMapPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onOpenMap();
  };

  return (
    <Pressable onPress={onPress}>
      <ThemedView type="backgroundElement" style={styles.eventCard}>
        <View style={styles.eventCardRow}>
          <View style={styles.eventMainColumn}>
            <View style={styles.eventMetaRow}>
              <ThemedView type="accent" style={styles.eventTimePill}>
                <ThemedText type="smallBold" themeColor="white">
                  {time}
                </ThemedText>
              </ThemedView>
              <ThemedText
                style={styles.eventStageText}
                themeColor="textSecondary"
              >
                {stage}
              </ThemedText>
            </View>
            <ThemedText style={styles.eventTitle}>{title}</ThemedText>
          </View>

          <Pressable
            onPress={handleMapPress}
            hitSlop={10}
            style={styles.mapIconButton}
          >
            <Image
              source={VietaIcon}
              style={styles.mapIcon}
              contentFit="contain"
              tintColor={theme.accent}
            />
          </Pressable>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  programList: {
    gap: 0,
  },
  eventCard: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.one,
  },
  eventCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  eventMainColumn: {
    flex: 1,
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
    textAlign: "left",
    fontSize: 14,
    lineHeight: 18,
  },
  mapIconButton: {
    marginTop: Spacing.half,
    padding: Spacing.half,
  },
  mapIcon: {
    width: 36,
    height: 36,
  },
  eventTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 600,
  },
});
