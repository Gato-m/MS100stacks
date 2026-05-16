import { ThemedText } from "@/components/ThemedText";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

type LegendItem = {
  icon: any;
  label: string;
  arrow?: boolean;
};

type KarteLegendSheetProps = {
  isVisible: boolean;
  theme: any;
  styles: any;
  tabBarHeight: number;
  backdropOpacity: Animated.Value;
  translateY: Animated.Value;
  onClose: () => void;
  legendItems: LegendItem[];
};

export function KarteLegendSheet({
  isVisible,
  theme,
  styles,
  tabBarHeight,
  backdropOpacity,
  translateY,
  onClose,
  legendItems,
}: KarteLegendSheetProps) {
  if (!isVisible) return null;

  return (
    <>
      <Animated.View
        style={[styles.legendBackdrop, { opacity: backdropOpacity }]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Aizvērt kartes paskaidrojumu"
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.legendSheet,
          {
            backgroundColor: theme.colors.background,
            borderColor:
              theme.name === "dark"
                ? theme.colors.darkGray
                : theme.colors.lightGray,
            borderTopColor:
              theme.name === "dark"
                ? theme.colors.darkGray
                : theme.colors.lightGray,
            paddingBottom: tabBarHeight + theme.spacing.three,
            transform: [{ translateY }],
          },
        ]}
      >
        <View
          style={[styles.legendHandleWrap, { marginTop: theme.spacing.two }]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.dragHandle,
              { backgroundColor: theme.colors.textSecondary },
            ]}
          />
        </View>
        <Pressable
          onPress={onClose}
          style={[
            styles.legendCloseButton,
            { backgroundColor: theme.colors.lightGray },
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Aizvērt kartes paskaidrojumu"
        >
          <SymbolView
            size={20}
            weight="semibold"
            tintColor={theme.colors.text}
            name={{ ios: "xmark", android: "close", web: "close" }}
          />
        </Pressable>
        <ThemedText
          variant="subTitle"
          color={theme.name === "dark" ? "darkGray" : "text"}
          style={styles.legendTitle}
        >
          Kartes skaidrojums
        </ThemedText>
        <View style={[styles.legendList, { gap: theme.spacing.two }]}>
          {legendItems.map(({ icon, label, arrow }) => (
            <View key={label} style={styles.legendRow}>
              <Image
                source={icon}
                contentFit="contain"
                style={[
                  styles.legendIcon,
                  arrow ? styles.legendArrowIcon : undefined,
                  { marginRight: theme.spacing.two },
                ]}
              />
              <ThemedText
                variant="body"
                color={theme.name === "dark" ? "darkGray" : "text"}
                style={styles.legendText}
              >
                {label}
              </ThemedText>
            </View>
          ))}
        </View>
      </Animated.View>
    </>
  );
}
