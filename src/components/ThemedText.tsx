import React from "react";
import { Text, TextProps } from "react-native";

import { useTheme } from "@/design/ThemeProvider";
import { TextVariantName } from "@/design/tokens";

type Props = TextProps & {
  variant?: TextVariantName;
  color?: keyof ReturnType<typeof useTheme>["theme"]["colors"];
};

export function ThemedText({
  variant = "body",
  color = "text",
  style,
  children,
  ...rest
}: Props) {
  const { theme } = useTheme();

  const variantStyle = theme.text[variant];

  return (
    <Text
      {...rest}
      style={[
        {
          color: theme.colors[color],
          fontFamily: theme.fonts.sans,
        },
        variantStyle,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
