import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Pressable, View } from "react-native";

type KarteControlsPillsProps = {
  theme: any;
  styles: any;
  height: number;
  isTablet: boolean;
  showTrafficRestrictions: boolean;
  showTerritoryData: boolean;
  selectedEventCategory: string;
  onFitAllEvents: () => void;
  onSelectCategory: (category: any) => void;
  onTerritoryToggle: () => void;
  onTrafficToggle: () => void;
};

export function KarteControlsPills({
  theme,
  styles,
  height,
  isTablet,
  showTrafficRestrictions,
  showTerritoryData,
  selectedEventCategory,
  onFitAllEvents,
  onSelectCategory,
  onTerritoryToggle,
  onTrafficToggle,
}: KarteControlsPillsProps) {
  const pills = [
    {
      key: "all",
      label: "Vietas",
      onPress: onFitAllEvents,
      active:
        !showTrafficRestrictions &&
        !showTerritoryData &&
        selectedEventCategory === "all",
    },
    {
      key: "concerts",
      label: "Koncerti",
      onPress: () => onSelectCategory("concerts"),
      active:
        !showTrafficRestrictions &&
        !showTerritoryData &&
        selectedEventCategory === "concerts",
    },
    {
      key: "exhibitions",
      label: "Izstādes",
      onPress: () => onSelectCategory("exhibitions"),
      active:
        !showTrafficRestrictions &&
        !showTerritoryData &&
        selectedEventCategory === "exhibitions",
    },
    {
      key: "kids",
      label: "Bērniem",
      onPress: () => onSelectCategory("kids"),
      active:
        !showTrafficRestrictions &&
        !showTerritoryData &&
        selectedEventCategory === "kids",
    },
    {
      key: "sports",
      label: "Sports",
      onPress: () => onSelectCategory("sports"),
      active:
        !showTrafficRestrictions &&
        !showTerritoryData &&
        selectedEventCategory === "sports",
    },
    {
      key: "moto",
      label: "Moto",
      onPress: () => onSelectCategory("moto"),
      active:
        !showTrafficRestrictions &&
        !showTerritoryData &&
        selectedEventCategory === "moto",
    },
    {
      key: "streetFood",
      label: "StreetFood",
      onPress: () => onSelectCategory("streetFood"),
      active:
        !showTrafficRestrictions &&
        !showTerritoryData &&
        selectedEventCategory === "streetFood",
    },
    {
      key: "territory",
      label: "Viesiem",
      onPress: onTerritoryToggle,
      active: showTerritoryData,
    },
    {
      key: "traffic",
      label: "Satiksmes ierobežojumi",
      onPress: onTrafficToggle,
      active: showTrafficRestrictions,
    },
  ];

  return (
    <View
      style={[
        styles.controlsPillsRow,
        {
          left: theme.spacing.three,
          right: theme.spacing.three,
          top: Math.max(
            theme.layout.ScreenTopToFirstComponent + 54,
            height * 0.16,
          ),
          marginHorizontal: theme.spacing.two,
          marginTop: theme.spacing.three,
          gap: theme.spacing.two,
          flexWrap: isTablet ? "nowrap" : "wrap",
        },
      ]}
    >
      {pills.map((pill) => (
        <Pressable
          key={pill.key}
          onPress={pill.onPress}
          style={[
            styles.controlPill,
            {
              backgroundColor: pill.active
                ? theme.colors.accent2
                : theme.colors.lightGray,
              borderWidth: pill.active ? 0 : 0.5,
              borderColor: pill.active ? "transparent" : "darkgray",
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={pill.label}
        >
          <ThemedText
            variant="body"
            color={pill.active ? "white" : "text"}
            style={styles.controlPillText}
          >
            {pill.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}
