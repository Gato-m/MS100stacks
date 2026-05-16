import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/design/ThemeProvider";
import React, { useCallback, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type Layout = { x: number; y: number; width: number; height: number };

const SPRING = { damping: 18, stiffness: 130, mass: 0.7 };

type Props = {
  dates: string[];
  selectedDate: string;
  onSelect: (date: string) => void;
  formatDate: (date: string) => string;
  rowGap?: number;
  columnGap?: number;
};

export function DatePillSelector({
  dates,
  selectedDate,
  onSelect,
  formatDate,
  rowGap,
  columnGap,
}: Props) {
  const { theme } = useTheme();
  const layoutsRef = useRef<Record<string, Layout>>({});
  const [allMeasured, setAllMeasured] = useState(false);

  const sliderX = useSharedValue(0);
  const sliderY = useSharedValue(0);
  const sliderW = useSharedValue(0);
  const sliderH = useSharedValue(0);

  const moveTo = useCallback(
    (date: string, animated: boolean) => {
      const l = layoutsRef.current[date];
      if (!l) return;
      if (animated) {
        sliderX.value = withSpring(l.x, SPRING);
        sliderY.value = withSpring(l.y, SPRING);
        sliderW.value = withSpring(l.width, SPRING);
        sliderH.value = withSpring(l.height, SPRING);
      } else {
        sliderX.value = l.x;
        sliderY.value = l.y;
        sliderW.value = l.width;
        sliderH.value = l.height;
      }
    },
    [sliderH, sliderW, sliderX, sliderY],
  );

  const handleLayout = useCallback(
    (date: string, layout: Layout) => {
      layoutsRef.current[date] = layout;
      if (Object.keys(layoutsRef.current).length >= dates.length) {
        // Snap to initial position without animation so the
        // transition from static darkRed bg to transparent is seamless
        moveTo(selectedDate, false);
        setAllMeasured(true);
      }
    },
    [dates.length, selectedDate, moveTo],
  );

  // Animate slider when selectedDate changes after measurement
  const prevSelectedRef = useRef(selectedDate);
  if (allMeasured && prevSelectedRef.current !== selectedDate) {
    prevSelectedRef.current = selectedDate;
    moveTo(selectedDate, true);
  }

  const sliderStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    top: sliderY.value,
    transform: [{ translateX: sliderX.value }],
    width: sliderW.value,
    height: sliderH.value,
    backgroundColor: theme.colors.darkRed,
    borderRadius: 999,
    zIndex: 2,
  }));

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: rowGap ?? theme.spacing.two,
        columnGap: columnGap ?? theme.spacing.two,
        position: "relative",
        marginBottom: theme.spacing.three,
      }}
    >
      {allMeasured &&
        dates.map((date) => {
          const layout = layoutsRef.current[date];
          if (!layout) return null;

          return (
            <View
              key={`bg-${date}`}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: layout.x,
                top: layout.y,
                width: layout.width,
                height: layout.height,
                borderRadius: 999,
                backgroundColor: theme.colors.lightGray,
                zIndex: 1,
              }}
            />
          );
        })}

      {dates.map((date) => {
        const isSelected = date === selectedDate;
        return (
          <Pressable
            key={date}
            onLayout={(e) => handleLayout(date, e.nativeEvent.layout)}
            onPress={() => onSelect(date)}
            style={{
              position: "relative",
              borderRadius: 999,
              paddingHorizontal: theme.spacing.three,
              paddingVertical: theme.spacing.one * 2,
              backgroundColor: allMeasured
                ? "transparent"
                : isSelected
                  ? theme.colors.darkRed
                  : theme.colors.lightGray,
              zIndex: 3,
            }}
          >
            <View style={{ position: "relative" }}>
              <ThemedText
                variant="body"
                color={isSelected ? "white" : "darkRed"}
                style={{
                  fontSize: 14,
                  lineHeight: 18,
                  fontWeight: "700",
                  marginBottom: 0,
                  textAlignVertical: "center",
                }}
              >
                {formatDate(date)}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}

      {allMeasured && (
        <Animated.View pointerEvents="none" style={sliderStyle} />
      )}
    </View>
  );
}
