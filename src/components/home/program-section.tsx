import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { PROGRAM_EVENTS } from "@/components/home/data";
import { FestivalDate } from "@/components/home/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

type ProgramSectionProps = {
  activeDate: FestivalDate;
  onOpenDetails: () => void;
};

type EventCardProps = {
  time: string;
  title: string;
  stage: string;
  onPress: () => void;
};

export function ProgramSection({
  activeDate,
  onOpenDetails,
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
        />
      ))}
    </View>
  );
}

function EventCard({ time, title, stage, onPress }: EventCardProps) {
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
  programList: {
    gap: 0,
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
});
