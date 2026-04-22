// src/design/theme.ts
import { ColorSchemeName } from "react-native";
import {
  Colors,
  Fonts,
  Layout,
  Spacing,
  TextVariants,
  ThemeColor,
} from "./tokens";

export type ThemeName = "light" | "dark";
export type ThemeMode = "light" | "dark" | "system";

export type Theme = {
  name: ThemeName;
  mode: ThemeMode;
  colors: Record<ThemeColor, string>;
  fonts: typeof Fonts;
  spacing: typeof Spacing;
  layout: typeof Layout;
  text: typeof TextVariants;
};

export const lightTheme: Theme = {
  name: "light",
  mode: "light",
  colors: Colors.light,
  fonts: Fonts,
  spacing: Spacing,
  layout: Layout,
  text: TextVariants,
};

export const darkTheme: Theme = {
  name: "dark",
  mode: "dark",
  colors: Colors.dark,
  fonts: Fonts,
  spacing: Spacing,
  layout: Layout,
  text: TextVariants,
};

/**
 * Deterministisks theme resolveris:
 * - ievade: ThemeMode + systemColorScheme
 * - izvade: Theme (light/dark)
 */
export function resolveTheme(
  mode: ThemeMode,
  systemColorScheme: ColorSchemeName,
): Theme {
  if (mode === "light") return { ...lightTheme, mode };
  if (mode === "dark") return { ...darkTheme, mode };

  // mode === "system"
  const effective: ThemeName = systemColorScheme === "dark" ? "dark" : "light";
  return effective === "dark"
    ? { ...darkTheme, mode: "system" }
    : { ...lightTheme, mode: "system" };
}

/**
 * Helper tipam drošai krāsu atslēgu lietošanai
 */
export function getThemeColor(theme: Theme, key: ThemeColor) {
  return theme.colors[key];
}
