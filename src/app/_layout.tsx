import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="event-details"
          options={{ presentation: "modal", title: "Notikums" }}
        />
        <Stack.Screen
          name="filter"
          options={{ presentation: "modal", title: "Filtri" }}
        />
        <Stack.Screen
          name="about"
          options={{ presentation: "modal", title: "Par pasakumu" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
