import {
  FestivalDate,
  MapCategory,
  ProgramEvent,
  Section,
} from "@/components/home/types";

export const SECTION_LABELS: Record<Section, string> = {
  program: "Programma",
  map: "Karte",
  info: "Info",
};

export const FESTIVAL_DATES: FestivalDate[] = [
  "12. jūlijs",
  "13. jūlijs",
  "14. jūlijs",
];

export const MAP_CATEGORIES: MapCategory[] = [
  "Pasākumi",
  "Koncerti",
  "Izstādes",
  "Bērniem",
  "Sports",
  "Kafejnīcas",
  "Satiksmes ierobežojumi",
];

export const PROGRAM_EVENTS: Record<FestivalDate, ProgramEvent[]> = {
  "12. jūlijs": [
    {
      time: "13:00",
      title: "Atklāšanas gājiens",
      stage: "Brīvības laukums",
    },
    {
      time: "16:00",
      title: "Jauno grupu skatuve",
      stage: "Mazo skatuvju parks",
    },
    {
      time: "20:30",
      title: "Vakara koncerts",
      stage: "Lielā skatuve",
    },
  ],
  "13. jūlijs": [
    {
      time: "12:30",
      title: "Ģimeņu radošās darbnīcas",
      stage: "Bērnu zona",
    },
    {
      time: "17:00",
      title: "Ielu teātra uzvedums",
      stage: "Vecpilsētas ielas",
    },
    {
      time: "21:00",
      title: "DJ nakts sets",
      stage: "Elektronikas skatuve",
    },
  ],
  "14. jūlijs": [
    {
      time: "14:00",
      title: "Koru sadziedāšanās",
      stage: "Parka estrāde",
    },
    {
      time: "18:30",
      title: "Pilsētas stāstu performance",
      stage: "Mazais amfiteātris",
    },
    {
      time: "22:00",
      title: "Noslēguma gaismu šovs",
      stage: "Centra parks",
    },
  ],
};
