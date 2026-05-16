import { useTheme } from "@/design/ThemeProvider";
import { Image } from "expo-image";
import React from "react";
import {
  ImageStyle,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

type TopBackgroundImageProps = {
  style?: StyleProp<ImageStyle>;
};

export function TopBackgroundImage({ style }: TopBackgroundImageProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  return (
    <Image
      source={require("../../assets/images/Bg_top.png")}
      contentFit="contain"
      style={[
        styles.image,
        {
          width,
          left: -theme.spacing.three,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    position: "absolute",
    top: 0,
    height: 240,
    transform: [{ translateX: -3 }, { translateY: -35 }, { scale: 1.7 }],
  },
});
