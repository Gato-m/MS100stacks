import { Spacing } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

type ContentSectionBlockProps = {
  children?: React.ReactNode;
};

export function ContentSectionBlock({ children }: ContentSectionBlockProps) {
  return <View style={styles.block}>{children}</View>;
}

const styles = StyleSheet.create({
  block: {
    borderWidth: 1,
    borderColor: "red",
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
});
