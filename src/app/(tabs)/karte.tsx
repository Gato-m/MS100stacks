import React, { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import eventsData from "../../../lib/events.json";

type EventItem = {
  eventId: string;
  title: string;
  lat: number;
  long: number;
};

type MapLibreModule = typeof import("@maplibre/maplibre-react-native");

const FALLBACK_CENTER: [number, number] = [
  26.22201211346372, 56.85465469818972,
];
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/bright";

export default function KarteScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const maplibre =
    Platform.OS === "web"
      ? null
      : (require("@maplibre/maplibre-react-native") as MapLibreModule);
  const events = (eventsData as { events: EventItem[] }).events;

  const validEvents = useMemo(
    () =>
      events.filter(
        (event) => Number.isFinite(event.lat) && Number.isFinite(event.long),
      ),
    [events],
  );

  const mapCenter = useMemo<[number, number]>(() => {
    if (validEvents.length === 0) {
      return FALLBACK_CENTER;
    }

    const totals = validEvents.reduce(
      (accumulator, event) => {
        accumulator.lat += event.lat;
        accumulator.long += event.long;
        return accumulator;
      },
      { lat: 0, long: 0 },
    );

    return [totals.long / validEvents.length, totals.lat / validEvents.length];
  }, [validEvents]);

  const markersGeoJson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: validEvents.map((event) => ({
        type: "Feature",
        id: event.eventId,
        properties: {
          title: event.title,
        },
        geometry: {
          type: "Point",
          coordinates: [event.long, event.lat],
        },
      })),
    }),
    [validEvents],
  );

  return (
    <View style={styles.container}>
      <View style={styles.mapCard}>
        {maplibre ? (
          <maplibre.Map
            mapStyle={MAP_STYLE_URL}
            style={styles.map}
            logo={false}
            attribution
            compass
            compassHiddenFacingNorth
            scaleBar={false}
            preferredFramesPerSecond={Platform.OS === "ios" ? 60 : 45}
            androidView="surface"
          >
            <maplibre.Camera
              initialViewState={{ center: mapCenter, zoom: 12.5 }}
              maxZoom={17}
              minZoom={8}
            />

            <maplibre.GeoJSONSource
              id="events-source"
              data={markersGeoJson as unknown as GeoJSON.FeatureCollection}
            >
              <maplibre.Layer
                id="event-points"
                type="circle"
                paint={{
                  "circle-color": "#DC2626",
                  "circle-radius": 5,
                  "circle-stroke-color": "#FFFFFF",
                  "circle-stroke-width": 2,
                }}
              />
            </maplibre.GeoJSONSource>
          </maplibre.Map>
        ) : (
          <View style={styles.webFallback}>
            <Text style={styles.webFallbackText}>
              Karte pieejama iOS/Android development build vidē.
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.header, isTablet && styles.headerTablet]}>
        <Text style={styles.eyebrow}>Navigācija</Text>
        <Text style={styles.title}>Karte</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 72,
    gap: 12,
    zIndex: 20,
  },
  headerTablet: {
    left: "5%",
    right: "5%",
    width: "90%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: "10%",
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#939393",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#111827",
  },
  mapCard: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    borderWidth: 0,
    backgroundColor: "#FFFFFF",
  },
  map: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  webFallbackText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: "#374151",
  },
});
