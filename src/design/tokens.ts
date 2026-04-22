// src/design/tokens.ts
import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#f0f0f300",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#525252",
    accent: "red",
    darkRed: "#be0a0a",
    lightGray: "#eaeaea",
    white: "#ffffff",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#21222500",
    backgroundSelected: "#2E3135",
    textSecondary: "#525252",
    accent: "red",
    darkRed: "#be0a0a",
    lightGray: "#e2e1e1",
    white: "#ffffff",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
})!;

export type FontFamilyName = keyof typeof Fonts;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export type SpacingKey = keyof typeof Spacing;

export const Layout = {
  BottomTabInset: Platform.select({ ios: 50, android: 80 }) ?? 0,
  ScreenTopToFirstComponent: Platform.select({ ios: 44, android: 44 }) ?? 24,
  MaxContentWidth: 900,
} as const;

////text styles

export const TextVariants = {
  bigTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
  },
  eyebrow: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "700",
    marginVertical: 5,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    marginBottom: -3,
  },
} as const;

export type TextVariantName = keyof typeof TextVariants;
