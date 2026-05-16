import { ThemedText } from "@/components/ThemedText";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

type KarteEventMarkersLayerProps = {
  maplibre: any;
  events: any[];
  selectedEventCategory: string;
  showPlacePills: boolean;
  theme: any;
  styles: any;
  onMarkerPress: (event: any) => void;
  formatPlaceLabel: (place: string) => string;
};

export function KarteEventMarkersLayer({
  maplibre,
  events,
  selectedEventCategory,
  showPlacePills,
  theme,
  styles,
  onMarkerPress,
  formatPlaceLabel,
}: KarteEventMarkersLayerProps) {
  return events.map((event) => (
    <maplibre.ViewAnnotation
      key={`event-marker-${event.eventId}`}
      id={`event-marker-${event.eventId}`}
      lngLat={event.lngLat}
      anchor="bottom"
    >
      <Pressable
        onPress={() => onMarkerPress(event)}
        style={styles.eventMarkerWrap}
      >
        {showPlacePills && event.place ? (
          <View
            style={[
              styles.eventMarkerLabelPill,
              { backgroundColor: theme.colors.accent2 },
            ]}
          >
            <ThemedText
              variant="body"
              color="white"
              style={styles.eventMarkerLabelText}
            >
              {formatPlaceLabel(event.place)}
            </ThemedText>
          </View>
        ) : null}
        <FontAwesome5
          name="map-marker-alt"
          size={36}
          color="#EA4335"
          style={{
            backgroundColor: "transparent",
            marginTop: 2,
          }}
        />
      </Pressable>
    </maplibre.ViewAnnotation>
  ));
}
