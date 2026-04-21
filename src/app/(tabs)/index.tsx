import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import eventsData from "../../../lib/events.json";

type EventItem = {
  eventId: string;
  date: string;
  time: string;
  title: string;
  place: string;
  addInfo: string[];
};

export default function ProgrammaScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const events = (eventsData as { events: EventItem[] }).events;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.content, isTablet && styles.contentTablet]}>
        <Text style={styles.eyebrow}>Programma</Text>
        <Text style={styles.title}>Programma</Text>
        <Text style={styles.description}>
          Šeit vari lasīt informāciju par pasākuma norises vietām un pasākuma
          programmu .
        </Text>

        <View style={styles.sectionsContainer}>
          {events.map((event: EventItem) => (
            <View key={event.eventId} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{event.title}</Text>
              <Text style={styles.paragraph}>
                {event.date} • {event.time}
              </Text>
              <Text style={styles.paragraph}>{event.place}</Text>
              {event.addInfo.map((info: string, index: number) => (
                <Text
                  key={`${event.eventId}-${index}`}
                  style={styles.paragraph}
                >
                  {info}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  contentContainer: {
    paddingBottom: "5%",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 72,
    gap: 12,
  },
  contentTablet: {
    width: "90%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: "10%",
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#939393",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#111827",
  },
  description: {
    fontSize: 17,
    lineHeight: 26,
    color: "#374151",
    maxWidth: 520,
  },
  sectionsContainer: {
    marginTop: 8,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: "#ffffff00",
    borderRadius: 14,
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
    color: "#111827",
  },
  sectionBlock: {
    gap: 8,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    marginBottom: -4,
    lineHeight: 22,
    color: "#374151",
  },
});
