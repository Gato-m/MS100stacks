// Vietu nosaukumu pārrakstīšanas vārdnīca (ja nepieciešams)
// @ts-nocheck
import { AppHeader } from "@/components/AppHeader";
import { KarteControlsPills } from "@/components/map/KarteControlsPills";
import { KarteEventMarkersLayer } from "@/components/map/KarteEventMarkersLayer";
import { KarteLegendSheet } from "@/components/map/KarteLegendSheet";
import { ThemedText } from "@/components/ThemedText";
import { TopBackgroundImage } from "@/components/TopBackgroundImage";
import { useTheme } from "@/design/ThemeProvider";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import EventPlaceModal from "@/components/EventPlaceModal";
import Constants from "expo-constants";
import events2026raw from "../../../lib/events2026.json";
import placesData from "../../../lib/places2026.json";
import satiksmeData from "../../../lib/satiksme.json";

function buildTrafficSignPillOffsets(
  data: any,
): Record<string, [number, number]> {
  const offsets: Record<string, [number, number]> = {};
  if (data?.no_entry_signs?.length) {
    for (const sign of data.no_entry_signs) {
      offsets[sign.id] = [28, -32];
    }
  }
  return offsets;
}

function buildEntryPillOffsets(data: any): Record<string, [number, number]> {
  const offsets: Record<string, [number, number]> = {};
  if (data?.entry?.length) {
    for (const ep of data.entry) {
      let offset: [number, number] = [48, -16];
      if (ep.streetName === "Tirgus iela" && ep.id === "entry-1") {
        offset = [13, -26];
      } else if (ep.streetName === "Valmieras iela" && ep.id === "entry-2") {
        offset = [38, -26];
      } else if (ep.streetName === "Blaumaņa iela" && ep.id === "entry-4") {
        offset = [33, -41];
      } else if (ep.streetName === "Tirgus iela" && ep.id === "entry-3") {
        offset = [43, 20];
      } else if (ep.streetName === "Vaijes iela") {
        offset = [38, -41];
      }
      offsets[ep.id] = offset;
    }

    if (
      data.staffEntry &&
      (data.staffEntry.streetName === "Vaijes iela" ||
        data.staffEntry.name === "Vaijes iela")
    ) {
      offsets[data.staffEntry.id] = [6, -41];
    }
  }
  return offsets;
}

const PLACE_LABEL_OVERRIDES: Record<string, string> = {
  "Madonas novadpētniecības un mākslas muzejs":
    "Madonas novadpētniecības\nun mākslas muzejs",
};

const PLACE_NAME_ALIASES: Record<string, string> = {
  biblioteka: "madonas novada biblioteka",
  "izstazu zales": "madonas novadpetniecibas un makslas muzejs",
  "madonas gimnazija": "madonas valsts gimnazija",
};

const MAPTILER_KEY = Constants.expoConfig?.extra?.MAPTILER_API_KEY;
const MAPTILER_STYLE_URL_LIGHT = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
  : null;
const DETAIL_OVERLAY_ZOOM_EPSILON = 0.05;
const PLACE_PILLS_ZOOM_DELTA = 0.12;
const FALLBACK_RASTER_STYLE_LIGHT = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-raster",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
} as const;
const FALLBACK_RASTER_STYLE_DARK = {
  version: 8,
  sources: {
    cartoDark: {
      type: "raster",
      tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [
    {
      id: "carto-dark-base",
      type: "background",
      paint: {
        "background-color": "#02265b",
      },
    },
    {
      id: "carto-dark-raster",
      type: "raster",
      source: "cartoDark",
      minzoom: 0,
      maxzoom: 19,
      paint: {
        "raster-opacity": 0.72,
        "raster-hue-rotate": 214,
        "raster-brightness-min": 0.1,
        "raster-brightness-max": 2,
        "raster-contrast": 0.01,
        "raster-saturation": 0.06,
      },
    },
  ],
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type LngLatPoint = [number, number];

type EventCategory =
  | "all"
  | "concerts"
  | "exhibitions"
  | "kids"
  | "sports"
  | "moto"
  | "streetFood";
const ENTRY_PILL_OFFSETS = buildEntryPillOffsets(satiksmeData);
const TRAFFIC_SIGN_PILL_OFFSETS = buildTrafficSignPillOffsets(satiksmeData);

const vietaIconLight = require("../../../assets/icons/vieta_light.png");
const vietaIconDark = require("../../../assets/icons/vieta_dark.png");
const stopSignIcon = require("../../../assets/icons/stop.png");
const wcIcon = require("../../../assets/icons/wc.png");
const medicineIcon = require("../../../assets/icons/med.png");
const greenArrowIcon = require("../../../assets/icons/green_arrow.png");
const blueArrowIcon = require("../../../assets/icons/blue_arrow.png");

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Nodrošina, ka koordinātas ir [longitude, latitude]
function latLngToLngLat(pair: [number, number]): [number, number] {
  return [pair[1], pair[0]];
}

function getBoundsFromPoints(
  points: LngLatPoint[],
): [number, number, number, number] {
  if (!points.length)
    return [
      FALLBACK_CENTER[0],
      FALLBACK_CENTER[1],
      FALLBACK_CENTER[0],
      FALLBACK_CENTER[1],
    ];
  const lngs = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  return [
    Math.min(...lngs),
    Math.min(...lats),
    Math.max(...lngs),
    Math.max(...lats),
  ];
}

function getBoundsCenter(
  bounds: [number, number, number, number],
): [number, number] {
  return [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2];
}

function createBoundsFromCenterAndSpan(
  center: [number, number],
  lngSpan: number,
  latSpan: number,
): [number, number, number, number] {
  return [
    center[0] - lngSpan / 2,
    center[1] - latSpan / 2,
    center[0] + lngSpan / 2,
    center[1] + latSpan / 2,
  ];
}

function isLatLngPair(pair: any): pair is [number, number] {
  return (
    Array.isArray(pair) &&
    pair.length === 2 &&
    pair.every((n) => typeof n === "number")
  );
}

function formatPlaceLabel(place: string): string {
  const trimmed = place.trim();
  if (PLACE_LABEL_OVERRIDES[trimmed]) return PLACE_LABEL_OVERRIDES[trimmed];
  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += 2)
    lines.push(words.slice(i, i + 2).join(" "));
  return lines.join("\n");
}

function normalize(value?: string): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function canonicalizePlaceName(value?: string): string {
  const normalized = normalize(value);
  if (!normalized) return "";

  if (
    normalized.includes("saieta laukums") ||
    normalized.includes("streetfood skatuve")
  ) {
    return "saieta laukums";
  }

  return PLACE_NAME_ALIASES[normalized] ?? normalized;
}

function normalizeCategory(value?: string): string {
  return normalize(value).replace(/[\s_-]+/g, "");
}

function extractZoomLevel(regionEvent: any): number | null {
  const candidates = [
    regionEvent?.properties?.zoomLevel,
    regionEvent?.properties?.zoom,
    regionEvent?.properties?.cameraZoom,
    regionEvent?.properties?.scaleZoom,
    regionEvent?.nativeEvent?.properties?.zoomLevel,
    regionEvent?.nativeEvent?.properties?.zoom,
    regionEvent?.nativeEvent?.zoomLevel,
    regionEvent?.nativeEvent?.zoom,
    regionEvent?.zoomLevel,
    regionEvent?.zoom,
    regionEvent?.payload?.zoomLevel,
    regionEvent?.payload?.zoom,
  ];

  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}

function categoryFromEvent(event: any): EventCategory | null {
  const raw = normalizeCategory(event?.categorie);
  if (!raw) return null;

  if (raw === "koncerts" || raw === "koncerti") return "concerts";
  if (raw === "izstades" || raw === "izstade") return "exhibitions";
  if (raw.startsWith("bern")) return "kids";
  if (raw === "sports") return "sports";
  if (raw === "moto" || raw === "motobrauciens") return "moto";
  if (raw === "ediens" || raw === "streetfood") return "streetFood";
  return null;
}

function matchesEventCategory(event: any, category: EventCategory): boolean {
  if (category === "all") return true;

  const byCategorie = categoryFromEvent(event);
  if (byCategorie) return byCategorie === category;

  const h = `${event.title ?? ""} ${event.place ?? ""}`.toLowerCase();
  switch (category) {
    case "concerts":
      return (
        h.includes("koncert") ||
        h.includes("grupa") ||
        h.includes("mūzik") ||
        h.includes("dzies")
      );
    case "exhibitions":
      return h.includes("izstād") || h.includes("ekspozī");
    case "kids":
      return (
        h.includes("bērn") ||
        h.includes("ģimen") ||
        h.includes("klaun") ||
        h.includes("atrakc")
      );
    case "sports":
      return (
        h.includes("sport") ||
        h.includes("čempion") ||
        h.includes("topbumba") ||
        h.includes("spiešan")
      );
    case "moto":
      return (
        h.includes("moto") || h.includes("motocikl") || h.includes("karting")
      );
    case "streetFood":
      return h.includes("streetfood") || h.includes("street food");
    default:
      return true;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KarteScreen() {
  const { theme } = useTheme();
  const isDarkTheme = theme.name === "dark";
  const vietaIcon = isDarkTheme ? vietaIconDark : vietaIconLight;
  const fallbackMapStyle = isDarkTheme
    ? FALLBACK_RASTER_STYLE_DARK
    : FALLBACK_RASTER_STYLE_LIGHT;
  const preferredMapStyle = useMemo(
    () =>
      isDarkTheme
        ? fallbackMapStyle
        : (MAPTILER_STYLE_URL_LIGHT ?? fallbackMapStyle),
    [fallbackMapStyle, isDarkTheme],
  );
  const tabBarHeight = useBottomTabBarHeight();
  const { focusEventId } = useLocalSearchParams<{ focusEventId?: string }>();
  const { width, height } = useWindowDimensions();

  const [maplibre, setMaplibre] = useState<MapLibreModule | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isMapUnavailable, setIsMapUnavailable] = useState(false);
  const [showTrafficRestrictions, setShowTrafficRestrictions] = useState(false);
  const [showTerritoryData, setShowTerritoryData] = useState(false);
  const [isLegendSheetVisible, setIsLegendSheetVisible] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedEventCategory, setSelectedEventCategory] =
    useState<EventCategory>("all");
  const [currentMapStyle, setCurrentMapStyle] = useState(preferredMapStyle);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number | null>(null);
  const [modeInitialZoom, setModeInitialZoom] = useState<number | null>(null);
  const [allPlacesInitialZoom, setAllPlacesInitialZoom] = useState<
    number | null
  >(null);

  const cameraRef = useRef<MapLibreCameraRef | null>(null);
  const hasAutoCenteredAllPlacesRef = useRef(false);
  const legendSheetTranslateY = useRef(new Animated.Value(340)).current;
  const legendSheetBackdropOpacity = useRef(new Animated.Value(0)).current;

  const allPlaces = placesData as {
    id: string;
    place: string;
    latLong?: [number, number];
    img?: string;
  }[];

  const placeByCanonicalName = useMemo(() => {
    const lookup = new Map<string, (typeof allPlaces)[number]>();
    for (const p of allPlaces) {
      lookup.set(canonicalizePlaceName(p.place), p);
    }
    return lookup;
  }, [allPlaces]);

  const eventsRaw = events2026raw as any[];
  const events = useMemo(
    () =>
      eventsRaw.map((event) => {
        const matchedPlace = placeByCanonicalName.get(
          canonicalizePlaceName(event.place),
        );
        const sourceLatLong =
          matchedPlace?.latLong && matchedPlace.latLong.length === 2
            ? matchedPlace.latLong
            : Array.isArray(event.latLong) && event.latLong.length === 2
              ? event.latLong
              : null;

        if (sourceLatLong) {
          const [lat, lng] = sourceLatLong;
          return {
            ...event,
            id: matchedPlace?.id ?? event.id,
            place: matchedPlace?.place ?? event.place,
            img: matchedPlace?.img ?? event.img,
            latLong: sourceLatLong,
            lat,
            long: lng,
            lngLat: latLngToLngLat(sourceLatLong),
          };
        }
        return { ...event, lat: null, long: null, lngLat: null };
      }),
    [eventsRaw, placeByCanonicalName],
  );

  const trafficData = satiksmeData as {
    no_entry_signs: TrafficSignItem[];
    entry: TerritoryPointItem[];
    wc: TerritoryPointItem;
    medicine: TerritoryPointItem;
    staffEntry: TerritoryPointItem;
    restricted_area: RestrictedArea;
  };

  useEffect(() => {
    let isMounted = true;
    setIsMapLoading(true);
    setIsMapUnavailable(false);
    if (Platform.OS === "web") {
      setMaplibre(null);
      setIsMapLoading(false);
      setIsMapUnavailable(true);
      return () => {
        isMounted = false;
      };
    }
    import("@maplibre/maplibre-react-native")
      .then((m) => {
        if (isMounted) {
          setMaplibre(m as MapLibreModule);
          setIsMapLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMaplibre(null);
          setIsMapLoading(false);
          setIsMapUnavailable(true);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentMapStyle(preferredMapStyle);
  }, [preferredMapStyle]);

  useEffect(() => {
    setIsMapReady(false);
  }, [maplibre]);

  const validEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          Array.isArray(e.lngLat) &&
          e.lngLat.length === 2 &&
          e.lngLat.every(Number.isFinite),
      ),
    [events],
  );
  const focusedEvent = useMemo(
    () =>
      validEvents.find(
        (e) =>
          e.eventId === focusEventId &&
          Array.isArray(e.lngLat) &&
          e.lngLat.length === 2,
      ),
    [validEvents, focusEventId],
  );

  const mapCenter = useMemo<[number, number]>(() => {
    if (focusedEvent && Array.isArray(focusedEvent.lngLat))
      return focusedEvent.lngLat;
    const coords = validEvents
      .map((e) => e.lngLat)
      .filter(Boolean) as LngLatPoint[];
    if (!coords.length) return FALLBACK_CENTER;
    const t = coords.reduce(
      (acc, lngLat) => {
        acc.lng += lngLat[0];
        acc.lat += lngLat[1];
        return acc;
      },
      { lat: 0, lng: 0 },
    );
    return [t.lng / coords.length, t.lat / coords.length];
  }, [validEvents, focusedEvent]);

  const mapZoom = focusedEvent ? 16.8 : 12.5;
  const isTablet = width >= 768;

  const focusPadding = useMemo(
    () => ({
      top: Math.max(120, height * 0.17),
      right: width * (isTablet ? 0.2 : 0.1),
      bottom: Math.max(150, height * 0.2),
      left: width * (isTablet ? 0.2 : 0.05),
      duration: 850,
    }),
    [height, isTablet, width],
  );

  const loweredCenterPadding = useMemo(
    () => ({ ...focusPadding, top: focusPadding.top + height * 0.2 }),
    [focusPadding, height],
  );
  const overlayModePadding = useMemo(() => {
    const side = Math.max(width * (isTablet ? 0.2 : 0.12), 52);
    return {
      ...loweredCenterPadding,
      // Keep overlays clear of the pills row while preserving horizontal centering.
      top: Math.max(height * 0.45, 230),
      left: side,
      right: side,
      bottom: Math.max(height * 0.18, 110),
    };
  }, [height, isTablet, loweredCenterPadding, width]);
  const categoryFocusPadding = useMemo(() => {
    const marginTop = Math.max(height * 0.4, 160);
    const marginSide = Math.max(width * 0.18, 60);
    const marginBottom = Math.max(height * 0.18, 100);
    return {
      ...loweredCenterPadding,
      top: marginTop,
      left: marginSide,
      right: marginSide,
      bottom: marginBottom,
    };
  }, [loweredCenterPadding, height, width]);
  const allPlacesFocusPadding = useMemo(() => {
    const vertical = Math.max(height * 0.24, 130);
    const horizontal = Math.max(width * (isTablet ? 0.16 : 0.08), 42);
    return {
      top: vertical,
      bottom: vertical,
      left: horizontal,
      right: horizontal,
      duration: 900,
    };
  }, [height, isTablet, width]);
  const allEventsBounds = useMemo(
    () =>
      getBoundsFromPoints(
        validEvents.map((e) => [e.long, e.lat] as LngLatPoint),
      ),
    [validEvents],
  );
  const baseVisibleEvents = useMemo(() => validEvents, [validEvents]);
  const categoryFilteredEvents = useMemo(() => {
    if (selectedEventCategory === "all") return baseVisibleEvents;
    return baseVisibleEvents.filter((e) =>
      matchesEventCategory(e, selectedEventCategory),
    );
  }, [baseVisibleEvents, selectedEventCategory]);

  const uniqueCategoryFilteredEvents = useMemo(() => {
    const seen = new Set<string>();
    return categoryFilteredEvents.filter((event) => {
      if (!event?.lngLat) return false;
      const key = `${event.lngLat[0]}:${event.lngLat[1]}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [categoryFilteredEvents]);

  const restrictedAreaCoordinates = useMemo(
    () =>
      (Array.isArray(trafficData.restricted_area.coordinates)
        ? trafficData.restricted_area.coordinates
        : []
      ).filter(isLatLngPair),
    [trafficData.restricted_area.coordinates],
  );

  const trafficRestrictionsGeoJson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: trafficData.no_entry_signs.map((s) => ({
        type: "Feature",
        id: s.id,
        properties: { title: s.name },
        geometry: {
          type: "Point",
          coordinates: latLngToLngLat(s.coordinates),
        },
      })),
    }),
    [trafficData.no_entry_signs],
  );

  const restrictedAreaGeoJson = useMemo(() => {
    const poly = restrictedAreaCoordinates.map(latLngToLngLat);
    const closed = [...poly];
    if (
      closed.length > 0 &&
      (closed[0][0] !== closed[closed.length - 1][0] ||
        closed[0][1] !== closed[closed.length - 1][1])
    )
      closed.push(closed[0]);
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: trafficData.restricted_area.id,
          properties: { title: trafficData.restricted_area.name },
          geometry: { type: "Polygon", coordinates: [closed] },
        },
      ],
    };
  }, [restrictedAreaCoordinates, trafficData.restricted_area]);

  const territoryCenter = useMemo<[number, number]>(() => {
    if (!restrictedAreaCoordinates.length) return mapCenter;
    const t = restrictedAreaCoordinates.reduce(
      (acc, [lat, lng]) => {
        acc.lat += lat;
        acc.lng += lng;
        return acc;
      },
      { lat: 0, lng: 0 },
    );
    return [
      t.lng / restrictedAreaCoordinates.length,
      t.lat / restrictedAreaCoordinates.length,
    ];
  }, [restrictedAreaCoordinates, mapCenter]);

  const toRotationDegrees = (from: [number, number], to: [number, number]) =>
    (Math.atan2(to[0] - from[0], to[1] - from[1]) * 180) / Math.PI;

  const territoryEntriesGeoJson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: trafficData.entry.map((ep) => {
        const coord = latLngToLngLat(ep.coordinates);
        return {
          type: "Feature",
          id: ep.id,
          properties: {
            title: ep.name,
            streetName: ep.streetName ?? "Neznāma iela",
            rotation:
              ep.roadBearing ?? toRotationDegrees(coord, territoryCenter),
          },
          geometry: { type: "Point", coordinates: coord },
        };
      }),
    }),
    [trafficData.entry, territoryCenter],
  );

  const territoryStaffEntryGeoJson = useMemo(() => {
    const coord = latLngToLngLat(trafficData.staffEntry.coordinates);
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: trafficData.staffEntry.id,
          properties: {
            title: trafficData.staffEntry.name,
            rotation:
              trafficData.staffEntry.roadBearing ??
              toRotationDegrees(coord, territoryCenter),
          },
          geometry: { type: "Point", coordinates: coord },
        },
      ],
    };
  }, [trafficData.staffEntry, territoryCenter]);

  const territoryPointsGeoJson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: [trafficData.wc, trafficData.medicine].map((pt) => ({
        type: "Feature",
        id: pt.id,
        properties: { title: pt.name },
        geometry: {
          type: "Point",
          coordinates: latLngToLngLat(pt.coordinates),
        },
      })),
    }),
    [trafficData.wc, trafficData.medicine],
  );

  const unifiedFocusBounds = useMemo(() => {
    const pts: LngLatPoint[] = [
      ...trafficData.entry.map((p) => latLngToLngLat(p.coordinates)),
      latLngToLngLat(trafficData.wc.coordinates),
      latLngToLngLat(trafficData.medicine.coordinates),
      latLngToLngLat(trafficData.staffEntry.coordinates),
      ...trafficData.no_entry_signs.map((s) => latLngToLngLat(s.coordinates)),
      ...restrictedAreaCoordinates.map(latLngToLngLat),
    ];
    const cb = getBoundsFromPoints(pts);
    const lngSpan = Math.max(cb[2] - cb[0], 0.0004);
    const latSpan = Math.max(cb[3] - cb[1], 0.0003);
    const zf = isTablet ? 1.7 : 1.15;
    const nl = (lngSpan / zf) * 1.18;
    const nla = (latSpan / zf) * 1.18;
    const center = getBoundsCenter(cb);
    const sb = createBoundsFromCenterAndSpan(center, nl, nla);
    return {
      territory: sb,
      traffic: sb,
      fromPoint: (c: [number, number]) =>
        createBoundsFromCenterAndSpan(c, nl, nla),
    };
  }, [isTablet, trafficData, restrictedAreaCoordinates]);

  const animateToBoundsLowered = useCallback(
    (bounds: [number, number, number, number], maxZoom?: number) => {
      const cam = cameraRef.current;
      if (!cam) return;
      try {
        cam.fitBounds(bounds, {
          padding: overlayModePadding,
          duration: overlayModePadding.duration,
          ...(maxZoom !== undefined ? { maxZoom } : {}),
        });
      } catch (e) {
        console.error(e);
      }
    },
    [overlayModePadding],
  );

  const animateToCenterPoint = useCallback(
    (lngLat: [number, number], zoom: number) => {
      const cam = cameraRef.current;
      if (!cam) return;
      try {
        cam.flyTo({ center: lngLat, duration: focusPadding.duration });
        cam.zoomTo(zoom, { duration: focusPadding.duration });
      } catch (e) {
        console.error(e);
      }
    },
    [focusPadding.duration],
  );

  const closeLegendSheet = useCallback(() => {
    legendSheetTranslateY.stopAnimation();
    legendSheetBackdropOpacity.stopAnimation();
    Animated.parallel([
      Animated.timing(legendSheetTranslateY, {
        toValue: 340,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(legendSheetBackdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setIsLegendSheetVisible(false);
    });
  }, [legendSheetBackdropOpacity, legendSheetTranslateY]);

  const openLegendSheet = useCallback(() => {
    legendSheetTranslateY.stopAnimation();
    legendSheetBackdropOpacity.stopAnimation();
    setIsLegendSheetVisible(true);
    legendSheetBackdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(legendSheetTranslateY, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(legendSheetBackdropOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [legendSheetBackdropOpacity, legendSheetTranslateY]);

  const handleRecenter = useCallback(() => {
    animateToCenterPoint(mapCenter, 14);
  }, [animateToCenterPoint, mapCenter]);

  const handleFitAllEvents = useCallback(() => {
    setShowTrafficRestrictions(false);
    setShowTerritoryData(false);
    setSelectedEventCategory("all");
    setAllPlacesInitialZoom(null);
    if (!validEvents.length) {
      handleRecenter();
      return;
    }
    const cam = cameraRef.current;
    if (cam) {
      try {
        cam.fitBounds(allEventsBounds, {
          padding: allPlacesFocusPadding,
          duration: allPlacesFocusPadding.duration,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [validEvents, allEventsBounds, allPlacesFocusPadding, handleRecenter]);

  useEffect(() => {
    if (
      showTrafficRestrictions ||
      showTerritoryData ||
      selectedEventCategory !== "all"
    ) {
      setAllPlacesInitialZoom(null);
    }
  }, [showTrafficRestrictions, showTerritoryData, selectedEventCategory]);

  useEffect(() => {
    if (
      showTrafficRestrictions ||
      showTerritoryData ||
      selectedEventCategory !== "all"
    ) {
      return;
    }
    if (currentZoomLevel === null) return;

    setAllPlacesInitialZoom((prev) => {
      if (prev === null) return currentZoomLevel;
      return currentZoomLevel < prev ? currentZoomLevel : prev;
    });
  }, [
    showTrafficRestrictions,
    showTerritoryData,
    selectedEventCategory,
    currentZoomLevel,
  ]);

  const showPlacePills = useMemo(() => {
    if (selectedEventCategory !== "all") return true;
    if (currentZoomLevel === null || allPlacesInitialZoom === null)
      return false;
    const baselineZoom = allPlacesInitialZoom ?? mapZoom;
    return currentZoomLevel > baselineZoom + PLACE_PILLS_ZOOM_DELTA;
  }, [selectedEventCategory, currentZoomLevel, allPlacesInitialZoom, mapZoom]);

  useEffect(() => {
    if (hasAutoCenteredAllPlacesRef.current) return;
    if (!maplibre || !isMapReady || !cameraRef.current) return;
    if (!validEvents.length || !!focusEventId) return;
    if (showTrafficRestrictions || showTerritoryData) return;
    if (selectedEventCategory !== "all") return;

    handleFitAllEvents();
    hasAutoCenteredAllPlacesRef.current = true;
  }, [
    maplibre,
    isMapReady,
    validEvents.length,
    focusEventId,
    showTrafficRestrictions,
    showTerritoryData,
    selectedEventCategory,
    handleFitAllEvents,
  ]);

  const handleResetActiveCategoryView = useCallback(() => {
    if (showTrafficRestrictions) {
      animateToBoundsLowered(unifiedFocusBounds.traffic);
      return;
    }

    if (showTerritoryData) {
      animateToBoundsLowered(unifiedFocusBounds.territory);
      return;
    }

    if (selectedEventCategory === "all") {
      handleFitAllEvents();
      return;
    }

    handleCategorySelect(selectedEventCategory);
  }, [
    animateToBoundsLowered,
    handleCategorySelect,
    handleFitAllEvents,
    selectedEventCategory,
    showTerritoryData,
    showTrafficRestrictions,
    unifiedFocusBounds,
  ]);

  const handleCategorySelect = useCallback(
    (category: EventCategory) => {
      setShowTrafficRestrictions(false);
      setShowTerritoryData(false);
      setSelectedEventCategory(category);
      const next =
        category === "all"
          ? baseVisibleEvents
          : baseVisibleEvents.filter((e) => matchesEventCategory(e, category));
      if (!next.length) {
        animateToBoundsLowered(allEventsBounds);
        return;
      }
      const unique = next.filter(
        (e, i, arr) =>
          arr.findIndex((x) => x.lat === e.lat && x.long === e.long) === i,
      );
      const cb = getBoundsFromPoints(
        unique
          .filter((e) => e.long !== null && e.lat !== null)
          .map((e) => [e.long, e.lat] as LngLatPoint),
      );
      const cam = cameraRef.current;
      const maxZoomForCategory = category === "kids" ? 6.8 : undefined;
      if (cam) {
        try {
          cam.fitBounds(cb, {
            padding: categoryFocusPadding,
            duration: 900,
            ...(maxZoomForCategory !== undefined
              ? { maxZoom: maxZoomForCategory }
              : {}),
          });
        } catch (e) {
          console.error(e);
        }
      }
    },
    [
      baseVisibleEvents,
      allEventsBounds,
      categoryFocusPadding,
      animateToBoundsLowered,
    ],
  );

  const handleTrafficRestrictionsToggle = useCallback(() => {
    setShowTrafficRestrictions((cur) => {
      const next = !cur;
      if (next) {
        setShowTerritoryData(false);
        setModeInitialZoom(null);
        animateToBoundsLowered(unifiedFocusBounds.traffic);
      }
      return next;
    });
  }, [animateToBoundsLowered, unifiedFocusBounds]);

  const handleTerritoryToggle = useCallback(() => {
    setShowTerritoryData((cur) => {
      const next = !cur;
      if (next) {
        setShowTrafficRestrictions(false);
        setModeInitialZoom(null);
        animateToBoundsLowered(unifiedFocusBounds.territory);
      }
      return next;
    });
  }, [animateToBoundsLowered, unifiedFocusBounds]);

  useEffect(() => {
    if (!showTrafficRestrictions && !showTerritoryData) {
      setModeInitialZoom(null);
      return;
    }
    if (modeInitialZoom === null && currentZoomLevel !== null) {
      setModeInitialZoom(currentZoomLevel);
    }
  }, [
    showTrafficRestrictions,
    showTerritoryData,
    modeInitialZoom,
    currentZoomLevel,
  ]);

  const isDetailOverlayVisibleAtCurrentZoom = useMemo(() => {
    if (modeInitialZoom === null || currentZoomLevel === null) return true;
    return (
      Math.abs(currentZoomLevel - modeInitialZoom) <=
      DETAIL_OVERLAY_ZOOM_EPSILON
    );
  }, [currentZoomLevel, modeInitialZoom]);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleMarkerPress = (event) => {
    if (event.place === "Viesiem" || event.place === "Satiksmes ierobežojumi") {
      return;
    }
    const placeData = placeByCanonicalName.get(
      canonicalizePlaceName(event.place),
    );
    setSelectedPlace({
      ...event,
      ...(placeData ?? {}),
    });
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedPlace(null);
  };

  const legendItems = useMemo(
    () => [
      { icon: vietaIcon, label: "Pasākumu vieta" },
      { icon: medicineIcon, label: "Medicīniskā palīdzība" },
      { icon: wcIcon, label: "Labierīcības" },
      {
        icon: greenArrowIcon,
        label: "Apmeklētāju ieeja",
        arrow: true,
      },
      {
        icon: blueArrowIcon,
        label: "Dienesta ieeja",
        arrow: true,
      },
      { icon: stopSignIcon, label: "Satiksmes ierobežojumi" },
    ],
    [vietaIcon],
  );

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      <View style={[styles.mapCard, { backgroundColor: "transparent" }]}>
        {maplibre ? (
          <maplibre.Map
            mapStyle={currentMapStyle}
            style={styles.map}
            padding={{ top: height * 0.22, left: 0, right: 0, bottom: 0 }} // Pārbīda kartes saturu uz leju, lai marķieri nav zem pills
            logo={false}
            attribution
            compass
            compassHiddenFacingNorth
            scaleBar={false}
            onDidFinishLoadingMap={() => setIsMapReady(true)}
            onDidFailLoadingMap={() => setCurrentMapStyle(fallbackMapStyle)}
            onRegionIsChanging={(event) => {
              const zoom = extractZoomLevel(event);
              if (typeof zoom === "number" && Number.isFinite(zoom)) {
                setCurrentZoomLevel(zoom);
              }
            }}
            onRegionDidChange={(event) => {
              const zoom = extractZoomLevel(event);
              if (typeof zoom === "number" && Number.isFinite(zoom)) {
                setCurrentZoomLevel(zoom);
              }
            }}
            preferredFramesPerSecond={Platform.OS === "ios" ? 60 : 45}
            androidView="texture"
          >
            <maplibre.Camera
              ref={cameraRef}
              initialViewState={{ center: mapCenter, zoom: mapZoom }}
              maxZoom={17}
              minZoom={showTrafficRestrictions || showTerritoryData ? 10.8 : 8}
            />

            {!showTrafficRestrictions && !showTerritoryData ? (
              <KarteEventMarkersLayer
                maplibre={maplibre}
                events={uniqueCategoryFilteredEvents}
                selectedEventCategory={selectedEventCategory}
                showPlacePills={showPlacePills}
                theme={theme}
                styles={styles}
                onMarkerPress={handleMarkerPress}
                formatPlaceLabel={formatPlaceLabel}
              />
            ) : null}

            {showTrafficRestrictions ? (
              <>
                <maplibre.Images images={{ stopSign: stopSignIcon }} />
                <maplibre.GeoJSONSource
                  id="traffic-restrictions-area-source"
                  data={
                    restrictedAreaGeoJson as unknown as GeoJSON.FeatureCollection
                  }
                >
                  <maplibre.Layer
                    id="traffic-restrictions-area-fill"
                    type="fill"
                    paint={{ "fill-color": "#DC2626", "fill-opacity": 0.2 }}
                  />
                  <maplibre.Layer
                    id="traffic-restrictions-area-outline"
                    type="line"
                    paint={{
                      "line-color": "#DC2626",
                      "line-opacity": 0.65,
                      "line-width": 2,
                    }}
                  />
                </maplibre.GeoJSONSource>
                {isDetailOverlayVisibleAtCurrentZoom ? (
                  <>
                    <maplibre.GeoJSONSource
                      id="traffic-restrictions-signs-source"
                      data={
                        trafficRestrictionsGeoJson as unknown as GeoJSON.FeatureCollection
                      }
                    >
                      <maplibre.Layer
                        id="traffic-restrictions-signs"
                        type="symbol"
                        layout={{
                          "icon-image": "stopSign",
                          "icon-size": 0.25,
                          "icon-allow-overlap": true,
                        }}
                      />
                    </maplibre.GeoJSONSource>
                    {trafficData.no_entry_signs.map((sign) => (
                      <maplibre.ViewAnnotation
                        key={`traffic-pill-${sign.id}`}
                        id={`traffic-pill-${sign.id}`}
                        lngLat={[sign.coordinates[1], sign.coordinates[0]]}
                        anchor="center"
                        offset={TRAFFIC_SIGN_PILL_OFFSETS[sign.id] ?? [28, -22]}
                      >
                        <View
                          pointerEvents="none"
                          style={[
                            styles.entryPill,
                            {
                              backgroundColor: theme.colors.accent2,
                              borderColor: "#ffffff",
                              shadowColor: "#000",
                            },
                          ]}
                        >
                          <ThemedText
                            variant="body"
                            color="white"
                            style={styles.entryPillText}
                          >
                            {sign.name}
                          </ThemedText>
                        </View>
                      </maplibre.ViewAnnotation>
                    ))}
                  </>
                ) : null}
              </>
            ) : null}

            {showTerritoryData ? (
              <>
                <maplibre.Images
                  images={{
                    wcIcon,
                    medicineIcon,
                    blueArrowIcon,
                    greenArrowIcon,
                  }}
                />
                <maplibre.GeoJSONSource
                  id="territory-area-source"
                  data={
                    restrictedAreaGeoJson as unknown as GeoJSON.FeatureCollection
                  }
                >
                  <maplibre.Layer
                    id="territory-area-fill"
                    type="fill"
                    paint={{ "fill-color": "#16a34a", "fill-opacity": 0.15 }}
                  />
                  <maplibre.Layer
                    id="territory-area-outline"
                    type="line"
                    paint={{
                      "line-color": "#16a34a",
                      "line-opacity": 0.5,
                      "line-width": 2,
                    }}
                  />
                </maplibre.GeoJSONSource>
                {isDetailOverlayVisibleAtCurrentZoom ? (
                  <>
                    <maplibre.GeoJSONSource
                      id="territory-points-source"
                      data={
                        territoryPointsGeoJson as unknown as GeoJSON.FeatureCollection
                      }
                    >
                      <maplibre.Layer
                        id="territory-wc-point"
                        type="symbol"
                        filter={["==", ["get", "title"], trafficData.wc.name]}
                        layout={{
                          "icon-image": "wcIcon",
                          "icon-size": 0.25,
                          "icon-allow-overlap": true,
                        }}
                      />
                      <maplibre.Layer
                        id="territory-medicine-point"
                        type="symbol"
                        filter={[
                          "==",
                          ["get", "title"],
                          trafficData.medicine.name,
                        ]}
                        layout={{
                          "icon-image": "medicineIcon",
                          "icon-size": 0.25,
                          "icon-allow-overlap": true,
                        }}
                      />
                    </maplibre.GeoJSONSource>
                    <maplibre.GeoJSONSource
                      id="territory-entry-source"
                      data={
                        territoryEntriesGeoJson as unknown as GeoJSON.FeatureCollection
                      }
                    >
                      <maplibre.Layer
                        id="territory-entry-arrows"
                        type="symbol"
                        layout={{
                          "icon-image": "greenArrowIcon",
                          "icon-size": 0.25,
                          "icon-allow-overlap": true,
                          "icon-anchor": "top",
                          "icon-rotate": ["get", "rotation"],
                          "icon-rotation-alignment": "map",
                        }}
                      />
                    </maplibre.GeoJSONSource>
                    {trafficData.entry.map((ep) => (
                      <maplibre.ViewAnnotation
                        key={`entry-pill-${ep.id}`}
                        id={`entry-pill-${ep.id}`}
                        lngLat={[ep.coordinates[1], ep.coordinates[0]]}
                        anchor="center"
                        offset={ENTRY_PILL_OFFSETS[ep.id] ?? [48, -16]}
                      >
                        <View
                          pointerEvents="none"
                          style={[
                            styles.entryPill,
                            {
                              backgroundColor: theme.colors.accent2,
                              borderColor: "#ffffff",
                              shadowColor: "#000",
                            },
                          ]}
                        >
                          <ThemedText
                            variant="body"
                            color="white"
                            style={styles.entryPillText}
                          >
                            {ep.streetName ?? ep.name}
                          </ThemedText>
                        </View>
                      </maplibre.ViewAnnotation>
                    ))}
                    <maplibre.GeoJSONSource
                      id="territory-staff-entry-source"
                      data={
                        territoryStaffEntryGeoJson as unknown as GeoJSON.FeatureCollection
                      }
                    >
                      <maplibre.Layer
                        id="territory-staff-entry-arrow"
                        type="symbol"
                        layout={{
                          "icon-image": "blueArrowIcon",
                          "icon-size": 0.25,
                          "icon-allow-overlap": true,
                          "icon-anchor": "top",
                          "icon-rotate": ["get", "rotation"],
                          "icon-rotation-alignment": "map",
                        }}
                      />
                    </maplibre.GeoJSONSource>
                    <maplibre.ViewAnnotation
                      id="entry-pill-staff-1"
                      lngLat={[
                        trafficData.staffEntry.coordinates[1],
                        trafficData.staffEntry.coordinates[0],
                      ]}
                      anchor="center"
                      offset={
                        ENTRY_PILL_OFFSETS[trafficData.staffEntry.id] ?? [
                          88, 42,
                        ]
                      }
                    >
                      <View
                        pointerEvents="none"
                        style={[
                          styles.entryPill,
                          {
                            backgroundColor: theme.colors.accent2,
                            borderColor: "#ffffff",
                            shadowColor: "#000",
                          },
                        ]}
                      >
                        <ThemedText
                          variant="body"
                          color="white"
                          style={styles.entryPillText}
                        >
                          {trafficData.staffEntry.name}
                        </ThemedText>
                      </View>
                    </maplibre.ViewAnnotation>
                  </>
                ) : null}
              </>
            ) : null}
          </maplibre.Map>
        ) : (
          <View style={styles.webFallback}>
            <ThemedText
              variant="body"
              color="text"
              style={styles.webFallbackText}
            >
              {isMapLoading
                ? "Ielādē karti..."
                : isMapUnavailable
                  ? "Karte šajā vidē nav pieejama. Atver iOS/Android development build versiju."
                  : "Karte nav pieejama."}
            </ThemedText>
          </View>
        )}

        {maplibre ? (
          <LinearGradient
            pointerEvents="none"
            colors={[
              theme.name === "dark"
                ? theme.colors.background
                : "rgba(255,255,255,1)",
              theme.name === "dark"
                ? `${theme.colors.background}00`
                : "rgba(255,255,255,0)",
            ]}
            style={[
              styles.mapTopGradient,
              {
                height: height * 0.3,
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
              },
            ]}
          />
        ) : null}

        <TopBackgroundImage style={{ zIndex: 10, elevation: 10 }} />

        {maplibre ? (
          <>
            <KarteControlsPills
              theme={theme}
              styles={styles}
              height={height}
              isTablet={isTablet}
              showTrafficRestrictions={showTrafficRestrictions}
              showTerritoryData={showTerritoryData}
              selectedEventCategory={selectedEventCategory}
              onFitAllEvents={handleFitAllEvents}
              onSelectCategory={handleCategorySelect}
              onTerritoryToggle={handleTerritoryToggle}
              onTrafficToggle={handleTrafficRestrictionsToggle}
            />

            <LinearGradient
              pointerEvents="none"
              colors={[
                theme.name === "dark"
                  ? `${theme.colors.background}00`
                  : "rgba(255,255,255,0)",
                theme.name === "dark"
                  ? theme.colors.background
                  : "rgba(255,255,255,1)",
              ]}
              style={[styles.mapBottomGradient, { height: height * 0.2 }]}
            />
          </>
        ) : null}

        <Pressable
          onPress={handleResetActiveCategoryView}
          style={[
            styles.mapTabButton,
            {
              backgroundColor: theme.colors.lightGray,
              right: theme.spacing.three,
              bottom: tabBarHeight + theme.spacing.two + 56,
              marginRight: theme.spacing.two,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Atjaunot aktīvās kategorijas kartes skatu"
        >
          <SymbolView
            size={20}
            weight="semibold"
            tintColor={theme.colors.text}
            name={{ ios: "scope", android: "my_location", web: "my_location" }}
          />
        </Pressable>

        <Pressable
          onPress={openLegendSheet}
          style={[
            styles.mapTabButton,
            {
              backgroundColor: theme.colors.lightGray,
              right: theme.spacing.three,
              bottom: tabBarHeight + theme.spacing.two,
              marginRight: theme.spacing.two,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Atvērt kartes skaidrojumu"
        >
          <Image
            source={require("../../../assets/icons/info.svg")}
            contentFit="contain"
            style={{ width: 20, height: 20, tintColor: theme.colors.text }}
          />
        </Pressable>

        <KarteLegendSheet
          isVisible={isLegendSheetVisible}
          theme={theme}
          styles={styles}
          tabBarHeight={tabBarHeight}
          backdropOpacity={legendSheetBackdropOpacity}
          translateY={legendSheetTranslateY}
          onClose={closeLegendSheet}
          legendItems={legendItems}
        />
      </View>

      <EventPlaceModal
        visible={isModalVisible}
        onClose={handleModalClose}
        place={selectedPlace}
        selectedEventCategory={selectedEventCategory}
      />
      <AppHeader
        eyebrow="Navigācija"
        title="Karte"
        titleColor={theme.name === "dark" ? "textSecondary" : "text"}
        style={styles.headerContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  headerContainer: {
    position: "absolute",
    zIndex: 20,
    marginBottom: 0,
    backgroundColor: "transparent",
  },
  mapCard: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    borderWidth: 0,
    backgroundColor: "#FFFFFF",
  },
  map: { flex: 1 },
  eventMarkerWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: 44,
    minWidth: 44,
    paddingBottom: 2,
    flexShrink: 1,
    flexGrow: 0,
    flexDirection: "column",
    maxWidth: 260,
  },
  eventMarkerLabelPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginBottom: 6,
    maxWidth: 260,
    minHeight: 28,
    alignItems: "center",
    flexWrap: "wrap",
    zIndex: 999,
    elevation: 30,
  },
  eventMarkerLabelText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
    marginBottom: 0,
    textAlign: "center",
  },
  eventPlaceIcon: { width: 35, height: 35 },
  mapBottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
    elevation: 15,
  },
  mapTopGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 5,
    elevation: 5,
  },
  controlsPillsRow: {
    position: "absolute",
    zIndex: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  controlPill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-start",
    shadowColor: "#6B7280",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  controlPillText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    marginBottom: 0,
  },
  entryPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 999,
    elevation: 30,
  },
  entryPillText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    marginBottom: 0,
  },
  legendSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderTopWidth: 3,
    paddingHorizontal: 20,
    paddingLeft: 35,
    paddingTop: 12,
    paddingBottom: 24,
    zIndex: 70,
    shadowColor: "#111827",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  legendBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    zIndex: 65,
  },
  legendCloseButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  legendTitle: {
    marginBottom: 14,
    marginRight: 36,
    marginLeft: 8,
    marginTop: 9,
  },
  mapTabButton: {
    position: "absolute",
    zIndex: 55,
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#111827",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  legendHandleWrap: { alignItems: "center", marginBottom: 10 },
  dragHandle: { width: 46, height: 5, borderRadius: 999, opacity: 0.32 },
  legendList: { gap: 10 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  legendIcon: { width: 34, height: 22 },
  legendArrowIcon: { transform: [{ rotate: "-90deg" }] },
  legendText: { marginBottom: 0, lineHeight: 26, fontSize: 18, flexShrink: 1 },
  webFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  webFallbackText: { textAlign: "center" },
});
