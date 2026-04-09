import { Stack } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export default function EventDetailsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: "Notikums" }} />
      <View style={styles.content}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Vakara koncerts</ThemedText>
          <ThemedText themeColor="textSecondary">20:00 - 22:00</ThemedText>
          <ThemedText themeColor="textSecondary">Liela skatuve</ThemedText>
          <ThemedText>
            Dziva muzika, viesmakslinieki un festivals nosleguma gaismas sovs.
          </ThemedText>
          <Pressable style={styles.tag}>
            <ThemedText type="small">Pievienot favoritiem</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: Spacing.four,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  tag: {
    marginTop: Spacing.one,
  },
});
