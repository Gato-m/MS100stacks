import React from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/design/ThemeProvider";

export type PillVariant = "date" | "time" | "category";

type PillProps = {
  variant: PillVariant;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  selected?: boolean;
};

export function Pill({
  variant,
  children,
  style,
  onPress,
  selected = true,
}: PillProps) {
  const { theme } = useTheme();

  const isCategory = variant === "category";
  const isInactiveDate = variant === "date" && !selected;
  const content = (
    <View
      style={[
        {
          backgroundColor: isInactiveDate
            ? theme.colors.lightGray
            : theme.colors.darkRed,
          borderRadius: 999,
          paddingHorizontal: theme.spacing.three,
          paddingVertical: theme.spacing.one * 1.5,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <ThemedText
        variant="body"
        color={isInactiveDate ? "darkRed" : "white"}
        style={{
          fontSize: 14,
          lineHeight: 18,
          fontWeight: "700",
          marginBottom: 0,
          textTransform: isCategory ? "uppercase" : "none",
          letterSpacing: isCategory ? 0.4 : 0,
        }}
      >
        {children}
      </ThemedText>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} style={{ alignSelf: "flex-start" }}>
      {content}
    </Pressable>
  );
}
