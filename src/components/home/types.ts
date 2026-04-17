export type Section = "program" | "map" | "info";

export type FestivalDate = "12. jūlijs" | "13. jūlijs" | "14. jūlijs";

export type MapCategory =
  | "Pasākumi"
  | "Koncerti"
  | "Izstādes"
  | "Bērniem"
  | "Sports"
  | "Kafejnīcas"
  | "Satiksmes ierobežojumi";

export type ProgramEvent = {
  time: string;
  title: string;
  stage: string;
};
