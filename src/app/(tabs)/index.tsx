import { Pill } from "@/components/Pill";
import { SectionCard } from "@/components/SectionCard";
import { SectionContainer } from "@/components/SectionContainer";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/design/ThemeProvider";
import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import eventsData from "../../../lib/events.json";

type EventItem = {
  eventId: string;
  date: string;
  time: string;
  title: string;
  place: string;
  addInfo: string[];
};

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

export default function ProgrammaScreen() {
  const { theme } = useTheme();
  const events = (eventsData as { events: EventItem[] }).events;
  const availableDates = useMemo(
    () => [...new Set(events.map((event: EventItem) => event.date))],
    [events],
  );
  const [selectedDate, setSelectedDate] = useState(availableDates[0] ?? "");
  const filteredEvents = useMemo(
    () => events.filter((event: EventItem) => event.date === selectedDate),
    [events, selectedDate],
  );

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <SectionContainer fromScreenTop>
        <ThemedText variant="eyebrow" color="textSecondary">
          Programma
        </ThemedText>
        <ThemedText variant="bigTitle">Programma</ThemedText>
        <ThemedText variant="body" color="textSecondary">
          Šeit vari lasīt informāciju par pasākuma norises vietām un pasākuma
          programmu .
        </ThemedText>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing.two,
          }}
        >
          {availableDates.map((date) => (
            <Pill
              key={date}
              variant="date"
              onPress={() => setSelectedDate(date)}
              selected={selectedDate === date}
            >
              {formatDateLatvian(date)}
            </Pill>
          ))}
        </View>
      </SectionContainer>

      <SectionContainer>
        {filteredEvents.map((event: EventItem) => (
          <SectionCard key={event.eventId}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: theme.spacing.two,
              }}
            >
              <Pill variant="time">{event.time}</Pill>
            </View>
            <ThemedText variant="body" color="textSecondary">
              {event.place}
            </ThemedText>
            <ThemedText variant="subTitle">{event.title}</ThemedText>
            {event.addInfo.map((info: string, index: number) => (
              <ThemedText
                key={`${event.eventId}-${index}`}
                variant="body"
                color="textSecondary"
              >
                {info}
              </ThemedText>
            ))}
          </SectionCard>
        ))}
      </SectionContainer>
    </ScrollView>
  );
}
