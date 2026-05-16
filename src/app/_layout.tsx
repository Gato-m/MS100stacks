import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { ThemeProvider } from "../design/ThemeProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
        <Stack.Screen
          name="event/[eventId]"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            headerShown: false,
            contentStyle: { backgroundColor: "rgba(0, 0, 0, 0.42)" },
          }}
        />
        <Stack.Screen
          name="map-marker-modal"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            headerShown: false,
            contentStyle: { backgroundColor: "rgba(0, 0, 0, 0.42)" },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
