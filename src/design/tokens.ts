// src/design/tokens.ts
import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#f0f0f300",
    backgroundSelected: "#e2e2e200",
    textSecondary: "#3b3b3b",
    accent: "red",
    darkRed: "#d0311c",
    green: "#069044",
    blue: "#114b8e",
    lightGray: "#dad9d9",
    white: "#ffffff",
    darkGray: "#5e5e5e",
    accent2: "#d0311c",
    gradientDark: "#3a435b",
  },
  dark: {
    text: "#262626",
    background: "#151C28",
    backgroundElement: "#1b1b1c00",
    backgroundSelected: "#2e313500",
    textSecondary: "#ecebeb",
    accent: "#ed2727",
    darkRed: "#d0311c",
    green: "#069044",
    blue: "#114b8e",
    lightGray: "#dcdbdb",
    darkGray: "#5e5e5e",
    white: "#ffffff",
    accent2: "#d0311c",
    gradientDark: "#272d3eff",
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
  ScreenTopToFirstComponent: Platform.select({ ios: 80, android: 74 }) ?? 24,
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
    fontSize: 20,
    lineHeight: 30,
    fontWeight: Platform.select({ ios: "600", android: "800" }) ?? "700",
  },
  eyebrow: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: Platform.select({ ios: "600", android: "800" }) ?? "700",
    marginVertical: 5,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: -3,
    fontWeight: Platform.select({ ios: "600", android: "600" }) ?? "500",
  },
} as const;

export type TextVariantName = keyof typeof TextVariants;

export const TextVariantColors = {
  light: {
    bigTitle: "text",
    title: "text",
    eyebrow: "text",
    subTitle: "text",
    body: "textSecondary",
  } as Record<TextVariantName, ThemeColor>,
  dark: {
    bigTitle: "text",
    title: "textSecondary",
    eyebrow: "text",
    subTitle: "textSecondary",
    body: "text",
  } as Record<TextVariantName, ThemeColor>,
} as const;
