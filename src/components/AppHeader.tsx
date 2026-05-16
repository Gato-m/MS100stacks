import { SectionContainer } from "@/components/SectionContainer";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/design/ThemeProvider";
import { ThemeColor } from "@/design/tokens";
import { Image } from "expo-image";
import React from "react";
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";

type AppHeaderProps = {
  eyebrow: string;
  title: string;
  titleColor?: ThemeColor;
  style?: StyleProp<ViewStyle>;
} & Pick<ViewProps, "onLayout">;

export function AppHeader({
  eyebrow,
  title,
  titleColor = "text",
  style,
  onLayout,
}: AppHeaderProps) {
  const { theme } = useTheme();
  const logoSource =
    theme.name === "dark"
      ? require("../../assets/images/Mlogo_white.svg")
      : require("../../assets/images/Mlogo.svg");

  return (
    <SectionContainer fromScreenTop style={style} onLayout={onLayout}>
      <View style={styles.row}>
        <View style={styles.textBlock}>
          <ThemedText variant="eyebrow" color="textSecondary">
            {eyebrow}
          </ThemedText>
          <ThemedText variant="bigTitle" color={titleColor}>
            {title}
          </ThemedText>
        </View>
        <Image
          source={logoSource}
          contentFit="contain"
          style={styles.logo}
        />
      </View>
    </SectionContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    position: "relative",
    minHeight: 65,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    paddingRight: 100,
  },
  logo: {
    position: "absolute",
    top: -17,
    right: 0,
    width: 88,
    height: 88,
  },
});
