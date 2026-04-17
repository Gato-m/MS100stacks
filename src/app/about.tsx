import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ContentSectionBlock } from "@/components/content-section-block";
import {
  FESTIVAL_HEADER_HORIZONTAL_PADDING,
  FESTIVAL_HEADER_MAX_WIDTH,
  FestivalHeader,
} from "@/components/festival-header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: "Par pasakumu" }} />
      <FestivalHeader />
      <ContentSectionBlock />
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
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    paddingHorizontal: FESTIVAL_HEADER_HORIZONTAL_PADDING,
    maxWidth: FESTIVAL_HEADER_MAX_WIDTH,
    width: "100%",
    alignSelf: "center",
    gap: Spacing.three,
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
});
