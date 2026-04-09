import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: "Par pasakumu" }} />
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Par City Festival</ThemedText>
        <ThemedText themeColor="textSecondary">
          Tris dienu pilsetas festivals ar muziku, kulinariju, nodarbibam
          berniem un vakara koncertiem.
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Organizators: City Culture Foundation
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Atbalsts: info@cityfestival.lv
        </ThemedText>
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
    padding: Spacing.four,
    gap: Spacing.two,
  },
});
