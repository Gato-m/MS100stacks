import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ImageBackground
          source={require("../../assets/images/Bg.png")}
          resizeMode="cover"
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <Stack screenOptions={{ contentStyle: styles.stackContent }}>
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
        </ImageBackground>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    left: -45,
    right: -135,
    transform: [{ translateX: 45 }, { scale: 1.2 }],
  },
  stackContent: {
    backgroundColor: "transparent",
  },
});
