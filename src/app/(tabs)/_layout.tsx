import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform } from "react-native";

function TabIcon({
  active,
  ios,
  android,
}: {
  active: boolean;
  ios: string;
  android: string;
}) {
  return (
    <SymbolView
      size={22}
      weight="semibold"
      tintColor={active ? "#0F172A" : "#64748B"}
      name={{ ios, android, web: android }}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0F172A",
        tabBarInactiveTintColor: "#64748B",
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
