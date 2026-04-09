import { Stack } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

type Filter = "all" | "music" | "family" | "food";

const options: Filter[] = ["all", "music", "family", "food"];
const labels: Record<Filter, string> = {
  all: "Visi",
  music: "Muzika",
  family: "Gimenem",
  food: "Edinashana",
};

export default function FilterScreen() {
  const [selected, setSelected] = React.useState<Filter>("all");

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: "Filtri" }} />
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Izvelies kategoriju</ThemedText>
        <View style={styles.grid}>
          {options.map((option) => {
            const active = option === selected;
            return (
              <Pressable
                key={option}
                onPress={() => setSelected(option)}
                style={styles.optionPressable}
              >
                <ThemedView
                  type={active ? "backgroundSelected" : "backgroundElement"}
                  style={styles.option}
                >
                  <ThemedText
                    type="small"
                    themeColor={active ? "text" : "textSecondary"}
                  >
                    {labels[option]}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: Spacing.four,
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  optionPressable: {
    width: "48%",
  },
  option: {
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    alignItems: "center",
  },
});
