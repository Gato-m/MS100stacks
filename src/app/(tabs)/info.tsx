import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function InfoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Par lietotni</Text>
      <Text style={styles.title}>Info</Text>
      <Text style={styles.description}>
        Šeit vari ievietot praktisko informāciju, kontaktus, darba laikus un
        citus lietotnei svarīgus skaidrojumus.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 24,
    paddingTop: 72,
    gap: 12,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#15803D",
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
});
