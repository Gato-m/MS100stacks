import { SectionCard } from "@/components/SectionCard";
import { SectionContainer } from "@/components/SectionContainer";
import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { ScrollView } from "react-native";

import infoTextData from "../../../lib/infoText.json";

type InfoSection = {
  title: string;
  paragraphs: string[];
};

export default function InfoScreen() {
  const sections = (infoTextData as { infoSections: InfoSection[] })
    .infoSections;

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <SectionContainer fromScreenTop>
        <ThemedText variant="eyebrow" color="textSecondary">
          Info
        </ThemedText>
        <ThemedText variant="bigTitle">Svarīga informācija</ThemedText>
        <ThemedText variant="body" color="textSecondary">
          Svarīgas vadlīnijas un praktiska informācija pasākuma apmeklētājiem.
        </ThemedText>
      </SectionContainer>

      <SectionContainer>
        {sections.map((section: InfoSection, sectionIndex: number) => (
          <SectionCard key={`${section.title}-${sectionIndex}`}>
            <ThemedText variant="subTitle">{section.title}</ThemedText>
            {section.paragraphs.map(
              (paragraph: string, paragraphIndex: number) => (
                <ThemedText
                  key={`${section.title}-${paragraphIndex}`}
                  variant="body"
                  color="textSecondary"
                >
                  {paragraph}
                </ThemedText>
              ),
            )}
          </SectionCard>
        ))}
      </SectionContainer>
    </ScrollView>
  );
}
