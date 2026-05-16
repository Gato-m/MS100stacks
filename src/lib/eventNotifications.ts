import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const EVENT_REMINDER_CHANNEL_ID = "event-reminders";

export type ReminderEvent = {
  eventId: string;
  date: string;
  time: string;
  title: string;
  place: string;
};

export async function ensureReminderPermissions() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(EVENT_REMINDER_CHANNEL_ID, {
      name: "Atgādinājumi par pasākumiem",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 200, 250],
      lightColor: "#be0a0a",
      sound: "default",
    });
  }

  const existingPermissions = await Notifications.getPermissionsAsync();
  if (
    existingPermissions.granted ||
    existingPermissions.status === Notifications.PermissionStatus.GRANTED
  ) {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return (
    requestedPermissions.granted ||
    requestedPermissions.status === Notifications.PermissionStatus.GRANTED
  );
}

export function getEventStartDate(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes)
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function getReminderDate(
  date: string,
  time: string,
  minutesBefore: number,
) {
  const eventStart = getEventStartDate(date, time);
  if (!eventStart) {
    return null;
  }

  const reminderDate = new Date(eventStart.getTime() - minutesBefore * 60_000);
  if (reminderDate.getTime() <= Date.now()) {
    return null;
  }

  return reminderDate;
}

export async function scheduleEventReminder(
  event: ReminderEvent,
  minutesBefore: number,
) {
  const reminderDate = getReminderDate(event.date, event.time, minutesBefore);
  if (!reminderDate) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: event.title,
      body: `${event.place} sākas pēc ${minutesBefore} min.`,
      sound: "default",
      data: {
        eventId: event.eventId,
        minutesBefore,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });
}

export async function cancelScheduledReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
