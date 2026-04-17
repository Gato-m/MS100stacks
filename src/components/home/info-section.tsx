import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

type InfoSectionProps = {
  onOpenAbout: () => void;
};

export function InfoSection({ onOpenAbout }: InfoSectionProps) {
  return (
    <View style={styles.sectionWrapper}>
      <ThemedView type="backgroundElement" style={styles.infoCard}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Pilsētas svētki 2026
        </ThemedText>
        <ThemedText type="subtitle">Rīgas Festivals</ThemedText>
        <ThemedText themeColor="textSecondary">
          12-14 jūlijs | Centra parks un vecpilsēta
        </ThemedText>
        <ThemedText style={styles.infoText} type="smallBold">
          Noderiga informacija
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Darba laiks: 12:00-23:30
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Atbalsts: +371 2000 0000
        </ThemedText>
        <ThemedText themeColor="textSecondary">Ieeja: bezmaksas</ThemedText>
        <Pressable onPress={onOpenAbout} style={styles.infoAction}>
          <ThemedText type="linkPrimary">Par pasakumu</ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrapper: {
    gap: Spacing.three,
  },
  infoCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  infoAction: {
    marginTop: Spacing.two,
  },
  infoText: {
    marginTop: Spacing.three,
  },
});
