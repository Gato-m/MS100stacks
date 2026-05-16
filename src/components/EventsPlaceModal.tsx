import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface EventsPlaceModalProps {
  visible: boolean;
  onClose: () => void;
  place: {
    id: string;
    name: string;
    description?: string;
    [key: string]: any;
  } | null;
}

const EventsPlaceModal: React.FC<EventsPlaceModalProps> = ({
  visible,
  onClose,
  place,
}) => {
  const screenHeight = Dimensions.get("window").height;
  const sheetHeight = screenHeight * 0.9;
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(screenHeight);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: screenHeight - sheetHeight,
          useNativeDriver: true,
          damping: 18,
          mass: 0.5,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, screenHeight, sheetHeight, translateY, backdropOpacity]);

  // Always get image from lib/places2026.json
  let placeImg = null;
  if (place && (place.id || place.name)) {
    try {
      const places = require("../../lib/places2026.json");
      // Try to match by id first, then by name
      let found = null;
      if (place.id) {
        found = places.find((p) => p.id === place.id);
      }
      if (!found && place.name) {
        found = places.find((p) => p.place === place.name);
      }
      if (found && found.img) {
        try {
          placeImg = require(`../../assets/images/${found.img}`);
        } catch (e) {
          placeImg = null;
        }
      }
    } catch (e) {}
  }
  // Use a fallback placeholder if no image found
  if (!placeImg) {
    placeImg = require("../../assets/images/placeholder.png");
  }

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.sheetOverlay}>
        <Animated.View
          style={[styles.sheetBackdrop, { opacity: backdropOpacity }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              height: sheetHeight,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={placeImg}
              style={styles.placeImg}
              resizeMode="cover"
            />
            <View style={styles.sheetHandleOverlay} />
            <Pressable style={styles.closeButtonOverlay} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>{place?.name}</Text>
          {place?.description && (
            <Text style={styles.description}>{place.description}</Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  bottomSheet: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  imageContainer: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
    marginLeft: 0,
    marginRight: 0,
    marginTop: -24, // pull image to top of modal
    marginBottom: 0,
    backgroundColor: "#eee",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 0,
  },
  placeImg: {
    width: "100%",
    height: 200,
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    objectFit: "cover",
    alignSelf: "flex-start",
    display: "flex",
  },
  sheetHandleOverlay: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#ccc",
    alignSelf: "center",
    opacity: 0.7,
    zIndex: 2,
    marginLeft: "auto",
    marginRight: "auto",
  },
  closeButtonOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 8,
    zIndex: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 16,
    marginTop: 2,
    opacity: 0.5,
    zIndex: 2,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
    marginTop: -32,
    marginRight: -8,
    zIndex: 2,
  },
  closeText: {
    fontSize: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#444",
  },
});

export default EventsPlaceModal;
