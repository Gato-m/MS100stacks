import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { MAP_CATEGORIES } from "@/components/home/data";
import { MapCategory } from "@/components/home/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

type MapSectionProps = {
  activeMapCategory: MapCategory;
  setActiveMapCategory: (category: MapCategory) => void;
  showCategories?: boolean;
  showMap?: boolean;
};

export function MapSection({
  activeMapCategory,
  setActiveMapCategory,
  showCategories = true,
  showMap = true,
}: MapSectionProps) {
  const isCategoriesOnly = showCategories && !showMap;

  return (
    <View
      style={[
        styles.mapHeaderSection,
        isCategoriesOnly && styles.mapHeaderSectionCompact,
      ]}
    >
      {showCategories && (
        <View style={styles.mapCategoryRow}>
          {MAP_CATEGORIES.map((category) => {
            const isActiveCategory = activeMapCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() => setActiveMapCategory(category)}
                style={styles.mapCategoryPressable}
              >
                <ThemedView
                  type={isActiveCategory ? "accent" : "lightGray"}
                  style={styles.mapCategoryPill}
                >
                  <ThemedText
                    type="smallBold"
                    style={styles.categoryPillLabel}
                    themeColor={isActiveCategory ? "white" : "textSecondary"}
                  >
                    {category}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      )}

      {showMap && (
        <ThemedView type="backgroundSelected" style={styles.fakeMap}>
          <ThemedText type="small">
            Karte tiks pieslegta ar realiem koordinatu datiem
          </ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapHeaderSection: {
    marginTop: 0,
    gap: Spacing.two,
    flex: 1,
    marginBottom: Spacing.three,
  },
  mapHeaderSectionCompact: {
    flex: 0,
    marginBottom: 0,
  },
  mapCategoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    rowGap: Spacing.two + 2,
    marginTop: 0,
    marginBottom: Spacing.two,
  },
  mapCategoryPressable: {
    alignSelf: "flex-start",
    zIndex: 1,
  },
  mapCategoryPill: {
    borderRadius: Spacing.four,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  categoryPillLabel: {
    fontSize: 16,
    lineHeight: 20,
  },
  fakeMap: {
    flex: 1,
    borderRadius: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
  },
});
