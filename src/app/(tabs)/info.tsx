import { AnimatedEntry } from "@/components/AnimatedEntry";
import { AppHeader } from "@/components/AppHeader";
import { SectionCard } from "@/components/SectionCard";
import { SectionContainer } from "@/components/SectionContainer";
import { ThemedText } from "@/components/ThemedText";
import { TopBackgroundImage } from "@/components/TopBackgroundImage";
import { useTheme } from "@/design/ThemeProvider";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  useFocusEffect,
  useNavigation,
  useScrollToTop,
} from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import infoTextData from "../../../lib/infoText.json";

type InfoSection = {
  title: string;
  paragraphs: string[];
};

export default function InfoScreen() {
  const { theme } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollTopOffset =
    theme.layout.ScreenTopToFirstComponent + headerHeight + theme.spacing.three;
  const sections = (infoTextData as { infoSections: InfoSection[] })
    .infoSections;

  // Ref for scroll-to-top
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: false });
      }
    }, []),
  );
  return (
    <View style={styles.container}>
      <TopBackgroundImage />
      <AppHeader
        eyebrow="INFO"
        title="Svarīgi"
        titleColor={theme.name === "dark" ? "textSecondary" : "text"}
        style={styles.headerContainer}
        onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
      />

      <View
        style={[
          styles.scrollClip,
          { marginTop: scrollTopOffset, marginBottom: tabBarHeight },
        ]}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={{
            paddingBottom: tabBarHeight + theme.spacing.three,
          }}
          showsVerticalScrollIndicator={false}
        >
          <SectionContainer>
            {sections.map((section: InfoSection, sectionIndex: number) => (
              <AnimatedEntry
                key={`${section.title}-${sectionIndex}`}
                index={sectionIndex}
              >
                <SectionCard>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: theme.spacing.two,
                    }}
                  >
                    <Image
                      source={require("../../../assets/icons/info.svg")}
                      contentFit="contain"
                      style={{
                        width: 30,
                        height: 30,
                        tintColor: theme.colors.darkRed,
                        flexShrink: 0,
                        marginTop: 0,
                      }}
                    />
                    <ThemedText
                      variant="subTitle"
                      color="textSecondary"
                      style={styles.sectionTitle}
                    >
                      {section.title}
                    </ThemedText>
                  </View>
                  {section.paragraphs.map(
                    (paragraph: string, paragraphIndex: number) => (
                      <ThemedText
                        key={`${section.title}-${paragraphIndex}`}
                        variant="body"
                        color={theme.name === "dark" ? "white" : "text"}
                        style={
                          paragraphIndex > 0
                            ? { marginTop: theme.spacing.two }
                            : undefined
                        }
                      >
                        {paragraph}
                      </ThemedText>
                    ),
                  )}
                </SectionCard>
              </AnimatedEntry>
            ))}
          </SectionContainer>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerContainer: {
    position: "absolute",
    zIndex: 20,
    marginBottom: 0,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollClip: {
    flex: 1,
    overflow: "hidden",
  },
  sectionTitle: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    marginBottom: 15,
    marginRight: 20,
  },
});
