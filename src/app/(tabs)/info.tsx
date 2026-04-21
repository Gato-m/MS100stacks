import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import infoData from "../../../lib/infoText.json";

type InfoSection = {
  title: string;
  paragraphs: string[];
};

const typedInfoData = infoData as { infoSections: InfoSection[] };

export default function InfoScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.content, isTablet && styles.contentTablet]}>
        <Text style={styles.eyebrow}>Par lietotni</Text>
        <Text style={styles.title}>Info</Text>
        <Text style={styles.description}>
          Šeit vari ievietot praktisko informāciju, kontaktus, darba laikus un
          citus lietotnei svarīgus skaidrojumus.
        </Text>

        <View style={styles.sectionsContainer}>
          <View style={styles.sectionCard}>
            {typedInfoData.infoSections.map((section: InfoSection) => (
              <View key={section.title} style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.paragraphs.map((paragraph: string, index: number) => (
                  <Text
                    key={`${section.title}-${index}`}
                    style={styles.paragraph}
                  >
                    {paragraph}
                  </Text>
                ))}
              </View>
            ))}
          </View>
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
    lineHeight: 24,
    color: "#374151",
    marginBottom: -4,
  },
});
