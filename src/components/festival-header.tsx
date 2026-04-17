import { Image } from "expo-image";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import MLogo from "@/assets/images/Mlogo.svg";
import { ThemedText } from "@/components/themed-text";
import { MaxContentWidth, Spacing } from "@/constants/theme";

export const FESTIVAL_HEADER_HORIZONTAL_PADDING = Spacing.two;
export const FESTIVAL_HEADER_MAX_WIDTH = MaxContentWidth;

type FestivalHeaderProps = {
  style?: StyleProp<ViewStyle>;
};

export function FestivalHeader({ style }: FestivalHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <ThemedText style={styles.title}>Pilsētas svētki</ThemedText>
      <Image source={MLogo} contentFit="contain" style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    width: "95%",
    maxWidth: FESTIVAL_HEADER_MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: FESTIVAL_HEADER_HORIZONTAL_PADDING,
    marginTop: -Spacing.four,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700",
    flexShrink: 1,
    marginTop: Spacing.four,
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 5,
  },
});
