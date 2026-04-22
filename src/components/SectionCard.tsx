import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

import { useTheme } from "@/design/ThemeProvider";

type SectionCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionCard({ children, style }: SectionCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.backgroundElement,
          borderRadius: theme.spacing.three,
          paddingHorizontal: 0,
          paddingVertical: theme.spacing.three,
          borderWidth: 1,
          borderColor: theme.colors.backgroundSelected,
          gap: theme.spacing.two,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
