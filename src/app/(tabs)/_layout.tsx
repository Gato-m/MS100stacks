import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform } from "react-native";
import { useTheme } from "../../design/ThemeProvider";

function TabIcon({
  active,
  ios,
  android,
}: {
  active: boolean;
  ios: string;
  android: string;
}) {
  const { theme } = useTheme();
  return (
    <SymbolView
      size={22}
      weight="semibold"
      tintColor={active ? theme.colors.text : theme.colors.textSecondary}
      name={{ ios, android, web: android }}
    />
  );
}

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 86 : 68,
          paddingTop: 8,
          paddingHorizontal: "15%",
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Programma",
          tabBarIcon: ({ focused }) => (
            <TabIcon active={focused} ios="calendar" android="calendar_month" />
          ),
        }}
      />
      <Tabs.Screen
        name="karte"
        options={{
          title: "Karte",
          tabBarIcon: ({ focused }) => (
            <TabIcon active={focused} ios="map" android="map" />
          ),
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: "Info",
          tabBarIcon: ({ focused }) => (
            <TabIcon active={focused} ios="info.circle" android="info" />
          ),
        }}
      />
    </Tabs>
  );
}
