import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProgrammaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>M100stacks</Text>
      <Text style={styles.title}>Programma</Text>
      <Text style={styles.description}>
        Šī ir sākuma cilne. Šeit vari ievietot dienas programmu, notikumus un
        detalizētu saturu.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 24,
    paddingTop: 72,
    gap: 12,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#C2410C",
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
