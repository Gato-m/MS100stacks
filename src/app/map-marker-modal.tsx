import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/design/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function MapMarkerModalScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { markerLabel } = useLocalSearchParams<{ markerLabel?: string }>();

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.content,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.closeButton,
            {
              backgroundColor: theme.colors.lightGray,
              marginTop: theme.spacing.two,
              marginRight: theme.spacing.five,
            },
          ]}
          hitSlop={8}
        >
          <SymbolView
            size={20}
            weight="semibold"
            tintColor={theme.colors.text}
            name={{ ios: "xmark", android: "close", web: "close" }}
          />
        </Pressable>

        <View
          style={[styles.modalHandleWrap, { marginTop: theme.spacing.three }]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.dragHandle,
              { backgroundColor: theme.colors.textSecondary },
            ]}
          />
        </View>

        <View
          style={[
            styles.bodyContent,
            {
              marginTop: theme.spacing.five,
            },
          ]}
        >
          <ThemedText variant="body" style={styles.eyebrow}>
            {markerLabel ?? "Map marker"}
          </ThemedText>
          <ThemedText variant="bigTitle" style={styles.title}>
            Map modal content
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  modalHandleWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  dragHandle: {
    width: 46,
    height: 5,
    borderRadius: 999,
    opacity: 0.32,
  },
  bodyContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  eyebrow: {
    marginBottom: 8,
    opacity: 0.72,
  },
  title: {
    marginBottom: 12,
  },
});
