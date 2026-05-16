import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../../design/ThemeProvider";

export default function TabsLayout() {
  const { theme, toggle } = useTheme();
  const isDark = theme.name === "dark";
  const activeTabBackgroundColor = isDark
    ? theme.colors.accent
    : theme.colors.accent2;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.white,
          tabBarInactiveTintColor: theme.colors.text,
          tabBarShowLabel: false,
          sceneStyle: {
            backgroundColor: "transparent",
          },
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            overflow: "visible",
            height: Platform.OS === "ios" ? 92 : 94,
            paddingTop: 18,
            paddingHorizontal: "15%",
            paddingBottom: Platform.OS === "ios" ? 24 : 10,
          },
          tabBarBackground: () => (
            <Image
              source={require("../../../assets/images/Bg_bottom.png")}
              contentFit="contain"
              contentPosition="left bottom"
              style={styles.tabBarBackgroundImage}
            />
          ),
        }}
        initialRouteName="index"
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Programma",
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.tabIconButton,
                  {
                    backgroundColor: focused
                      ? activeTabBackgroundColor
                      : theme.colors.lightGray,
                  },
                ]}
              >
                <Image
                  source={require("../../../assets/icons/kalendar.svg")}
                  contentFit="contain"
                  style={[
                    styles.tabIconImage,
                    {
                      tintColor: focused
                        ? theme.colors.white
                        : theme.colors.text,
                    },
                  ]}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="karte"
          options={{
            title: "Karte",
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.tabIconButton,
                  {
                    backgroundColor: focused
                      ? activeTabBackgroundColor
                      : theme.colors.lightGray,
                  },
                ]}
              >
                <Image
                  source={require("../../../assets/icons/vieta.svg")}
                  contentFit="contain"
                  style={[
                    styles.tabIconImage,
                    {
                      tintColor: focused
                        ? theme.colors.white
                        : theme.colors.text,
                    },
                  ]}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="info"
          options={{
            title: "Info",
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.tabIconButton,
                  {
                    backgroundColor: focused
                      ? activeTabBackgroundColor
                      : theme.colors.lightGray,
                  },
                ]}
              >
                <Image
                  source={require("../../../assets/icons/info.svg")}
                  contentFit="contain"
                  style={[
                    styles.tabIconImage,
                    {
                      tintColor: focused
                        ? theme.colors.white
                        : theme.colors.text,
                    },
                  ]}
                />
              </View>
            ),
          }}
        />
      </Tabs>

      <Pressable
        onPress={toggle}
        style={[
          styles.themeToggle,
          {
            backgroundColor: theme.colors.lightGray,
            borderColor: "#bdbdbd",
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          isDark ? "Pārslēgt uz gaišo tēmu" : "Pārslēgt uz tumšo tēmu"
        }
      >
        <SymbolView
          size={18}
          weight="semibold"
          tintColor={theme.colors.text}
          name={{
            ios: isDark ? "sun.max.fill" : "moon.fill",
            android: isDark ? "wb_sunny" : "dark_mode",
            web: isDark ? "wb_sunny" : "dark_mode",
          }}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabIconButton: {
    width: 48,
    height: 48,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconImage: {
    width: 26,
    height: 26,
  },
  tabBarBackgroundImage: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: 220,
    transform: [{ translateX: -10 }, { translateY: 85 }, { scale: 1.5 }],
  },
  themeToggle: {
    position: "absolute",
    left: 18,
    bottom: Platform.OS === "ios" ? 102 : 84,
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111827",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
