import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function KarteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Navigācija</Text>
      <Text style={styles.title}>Karte</Text>
      <Text style={styles.description}>
        Šeit vari pieslēgt kartes skatu, marķierus un filtrus. Maršrutu
        struktūra jau ir gatava atsevišķai kartes cilnei.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 24,
    paddingTop: 72,
    gap: 12,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#1D4ED8",
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
