import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type AnimatedEntryProps = {
  children: React.ReactNode;
  index?: number;
  staggerDelay?: number;
};

export function AnimatedEntry({
  children,
  index = 0,
  staggerDelay = 70,
}: AnimatedEntryProps) {
  const translateY = useSharedValue(48);
  const opacity = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      translateY.value = 48;
      opacity.value = 0;
      const delay = index * staggerDelay;
      translateY.value = withDelay(
        delay,
        withSpring(0, { damping: 16, stiffness: 100, mass: 0.8 }),
      );
      opacity.value = withDelay(delay, withTiming(1, { duration: 250 }));

      return () => {
        cancelAnimation(translateY);
        cancelAnimation(opacity);
      };
    }, [index, staggerDelay]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
