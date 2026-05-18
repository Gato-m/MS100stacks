import { AnimatedEntry } from "@/components/AnimatedEntry";
import { AppHeader } from "@/components/AppHeader";
import { DatePillSelector } from "@/components/DatePillSelector";
import { Pill } from "@/components/Pill";
import { SectionCard } from "@/components/SectionCard";
import { SectionContainer } from "@/components/SectionContainer";
import { ThemedText } from "@/components/ThemedText";
import { TopBackgroundImage } from "@/components/TopBackgroundImage";
import { useTheme } from "@/design/ThemeProvider";
import {
  cancelScheduledReminder,
  ensureReminderPermissions,
  scheduleEventReminder,
} from "@/lib/eventNotifications";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useScrollToTop } from "@react-navigation/native";
import { Image } from "expo-image";
import * as Notifications from "expo-notifications";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import events2026 from "../../../lib/events2026.json";

type EventItem = {
  eventId: string;
  date: string;
  time: string;
  title: string;
  titleBig?: string;
  note?: string;
  place: string;
  addInfo: string[];
};

type EventWithCoords = EventItem & {
  lat: number | null;
  long: number | null;
};

type ReminderNotificationData = {
  eventId?: string;
  minutesBefore?: number;
};

const REMINDER_OPTIONS = [
  { minutesBefore: 15, label: "15 min pirms sākuma" },
  { minutesBefore: 30, label: "30 minutes pirms sākuma" },
] as const;

const MONTHS_LV = [
  "janvāris",
  "februāris",
  "marts",
  "aprīlis",
  "maijs",
  "jūnijs",
  "jūlijs",
  "augusts",
  "septembris",
  "oktobris",
  "novembris",
  "decembris",
] as const;

function formatDateLatvian(dateString: string) {
  const [year, month, day] = dateString.split("-");
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const parsedDay = Number(day);

  if (
    !Number.isInteger(parsedYear) ||
    !Number.isInteger(parsedMonth) ||
    !Number.isInteger(parsedDay) ||
    parsedMonth < 1 ||
    parsedMonth > 12
  ) {
    return dateString;
  }

  return `${parsedDay}. ${MONTHS_LV[parsedMonth - 1]}`;
}

export default function ProgrammaScreen() {
  const { theme } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const screenHeight = Dimensions.get("window").height;
  const [headerHeight, setHeaderHeight] = useState(0);
  const [dateSelectorHeight, setDateSelectorHeight] = useState(0);
  const headerTopOffset =
    theme.layout.ScreenTopToFirstComponent + headerHeight + theme.spacing.three;
  const scrollTopOffset =
    headerTopOffset + dateSelectorHeight + theme.spacing.three;
  // Ref for scroll-to-top
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  useFocusEffect(
    useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: false });
      }
    }, []),
  );
  // Merge events with coordinates from events2026.json (no more places2026.json)
  const eventsRaw = events2026 as unknown as EventItem[];
  // Izveido map ar vietām no events2026.json
  const placeMap = useMemo(() => {
    const map = new Map<string, { latLong: [number, number]; img?: string }>();
    for (const ev of eventsRaw) {
      if (ev.place && ev.latLong && Array.isArray(ev.latLong)) {
        if (!map.has(ev.place)) {
          map.set(ev.place, { latLong: ev.latLong, img: (ev as any).img });
        }
      }
    }
    return map;
  }, [eventsRaw]);
  const events: EventWithCoords[] = useMemo(
    () =>
      eventsRaw.map((event) => {
        const found = placeMap.get(event.place);
        return {
          ...event,
          lat: found?.latLong?.[0] ?? null,
          long: found?.latLong?.[1] ?? null,
        };
      }),
    [eventsRaw, placeMap],
  );
  // Separate week-long events and intro
  const visaNedelaEvents = useMemo(
    () => events.filter((event) => event.date === "Visu nedēļu"),
    [events],
  );
  const introEvent = visaNedelaEvents.find(
    (e) => !e.place && !e.lat && !e.long,
  );
  const weekLongEvents = visaNedelaEvents.filter((e) => e !== introEvent);
  // Dates for pills: all unique dates, then 'Visu nedēļu' as last
  const availableDates = useMemo(() => {
    const dates = [...new Set(events.map((event) => event.date))].filter(
      (d) => d !== "Visu nedēļu",
    );
    return [...dates, "Visu nedēļu"];
  }, [events]);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Ja "Visu nedēļu" ir pieejams, izvēlas to, citādi pirmo datumu
    return availableDates.includes("Visu nedēļu")
      ? "Visu nedēļu"
      : (availableDates[0] ?? "");
  });
  const [activeReminderEvent, setActiveReminderEvent] =
    useState<EventItem | null>(null);
  const [isReminderSheetVisible, setIsReminderSheetVisible] = useState(false);
  const [isReminderSheetMounted, setIsReminderSheetMounted] = useState(false);
  const [selectedReminderMinutes, setSelectedReminderMinutes] = useState<
    number[]
  >([]);
  const [scheduledReminderIds, setScheduledReminderIds] = useState<
    Record<string, Record<number, string>>
  >({});

  const activeReminderEventIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeReminderEventIdRef.current = activeReminderEvent?.eventId ?? null;
  }, [activeReminderEvent?.eventId]);

  const clearFiredReminder = useCallback(
    (eventId: string, minutesBefore: number) => {
      setScheduledReminderIds((previous) => {
        const eventReminders = { ...(previous[eventId] ?? {}) };
        if (!eventReminders[minutesBefore]) {
          return previous;
        }

        delete eventReminders[minutesBefore];
        if (Object.keys(eventReminders).length === 0) {
          const next = { ...previous };
          delete next[eventId];
          return next;
        }

        return { ...previous, [eventId]: eventReminders };
      });

      // If the sheet is open for the same event, also clear the local selection UI.
      if (activeReminderEventIdRef.current === eventId) {
        setSelectedReminderMinutes((previous) =>
          previous.filter((value) => value !== minutesBefore),
        );
      }
    },
    [],
  );
  // Show only week events if 'Visu nedēļu' selected, else filter by date (excluding intro)
  const filteredEvents = useMemo(() => {
    if (selectedDate === "Visu nedēļu") return weekLongEvents;
    // Exclude intro event from all date lists
    return events.filter(
      (event) => event.date === selectedDate && event !== introEvent,
    );
  }, [events, selectedDate, weekLongEvents, introEvent]);

  const reminderSheetTranslateY = useRef(
    new Animated.Value(screenHeight),
  ).current;
  const reminderSheetBackdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isReminderSheetVisible) {
      setIsReminderSheetMounted(true);
    }
  }, [isReminderSheetVisible]);

  useEffect(() => {
    if (!isReminderSheetMounted) {
      return;
    }

    if (isReminderSheetVisible) {
      reminderSheetTranslateY.setValue(screenHeight);
      reminderSheetBackdropOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(reminderSheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          // stiffness: 140,
          mass: 0.5,
        }),
        Animated.timing(reminderSheetBackdropOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(reminderSheetTranslateY, {
        toValue: screenHeight,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(reminderSheetBackdropOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsReminderSheetMounted(false);
      }
    });
  }, [
    isReminderSheetMounted,
    isReminderSheetVisible,
    reminderSheetBackdropOpacity,
    reminderSheetTranslateY,
    screenHeight,
  ]);

  useEffect(() => {
    const handleNotification = (notification: Notifications.Notification) => {
      const data = notification.request.content
        .data as ReminderNotificationData;
      const eventId = typeof data?.eventId === "string" ? data.eventId : null;
      const minutesBefore =
        typeof data?.minutesBefore === "number" ? data.minutesBefore : null;

      if (!eventId || minutesBefore == null) {
        return;
      }

      clearFiredReminder(eventId, minutesBefore);
    };

    const receivedSubscription =
      Notifications.addNotificationReceivedListener(handleNotification);
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotification(response.notification);
      });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [clearFiredReminder]);

  function openReminderSheet(event: EventItem) {
    setActiveReminderEvent(event);
    setIsReminderSheetVisible(true);
    setSelectedReminderMinutes(
      Object.keys(scheduledReminderIds[event.eventId] ?? {}).map(Number),
    );
  }

  function closeReminderSheet() {
    setIsReminderSheetVisible(false);
    setActiveReminderEvent(null);
    setSelectedReminderMinutes([]);
  }

  async function toggleReminder(minutesBefore: number) {
    if (!activeReminderEvent) {
      return;
    }

    const existingNotificationId =
      scheduledReminderIds[activeReminderEvent.eventId]?.[minutesBefore];

    if (existingNotificationId) {
      await cancelScheduledReminder(existingNotificationId);
      setScheduledReminderIds((previous) => {
        const eventReminders = {
          ...(previous[activeReminderEvent.eventId] ?? {}),
        };
        delete eventReminders[minutesBefore];

        if (Object.keys(eventReminders).length === 0) {
          const next = { ...previous };
          delete next[activeReminderEvent.eventId];
          return next;
        }

        return {
          ...previous,
          [activeReminderEvent.eventId]: eventReminders,
        };
      });
      setSelectedReminderMinutes((previous) =>
        previous.filter((value) => value !== minutesBefore),
      );
      return;
    }

    const hasPermission = await ensureReminderPermissions();
    if (!hasPermission) {
      Alert.alert(
        "Atgādinājumi nav atļauti",
        "Lai saņemtu atgādinājumus, lūdzu atļaujiet paziņojumus ierīces iestatījumos.",
      );
      return;
    }

    const scheduledId = await scheduleEventReminder(
      activeReminderEvent,
      minutesBefore,
    );

    if (!scheduledId) {
      Alert.alert(
        "Atgādinājumu nevar ieplānot",
        "Šim pasākumam atgādinājumu vairs nevar ieplānot, jo sākuma laiks jau ir pagājis vai datums nav derīgs.",
      );
      return;
    }

    setScheduledReminderIds((previous) => ({
      ...previous,
      [activeReminderEvent.eventId]: {
        ...(previous[activeReminderEvent.eventId] ?? {}),
        [minutesBefore]: scheduledId,
      },
    }));
    setSelectedReminderMinutes((previous) =>
      previous.includes(minutesBefore)
        ? previous
        : [...previous, minutesBefore].sort((left, right) => left - right),
    );
  }

  return (
    <View style={styles.container}>
      <TopBackgroundImage />
      <AppHeader
        eyebrow="Pilsētas svētki"
        title="Programma"
        titleColor={theme.name === "dark" ? "textSecondary" : "text"}
        style={styles.headerContainer}
        onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
      />

      <SectionContainer
        style={[styles.dateSelectorContainer, { top: headerTopOffset }]}
        onLayout={(event) =>
          setDateSelectorHeight(event.nativeEvent.layout.height)
        }
      >
        <DatePillSelector
          dates={availableDates}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          rowGap={theme.spacing.two}
          columnGap={theme.spacing.two}
          formatDate={(date) =>
            date === "Visu nedēļu" ? "Svētku nedēļa" : formatDateLatvian(date)
          }
        />
      </SectionContainer>

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
          {/* Intro block for week section, only visible for 'Svētku nedēļa' pill, no section title */}
          {selectedDate === "Visu nedēļu" && introEvent ? (
            <SectionContainer gap={theme.spacing.one}>
              <AnimatedEntry index={0}>
                <SectionCard
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 0,
                    marginBottom: 18,
                  }}
                >
                  <View
                    style={[
                      styles.cardRowTitle,
                      { marginTop: 0, marginBottom: 0 },
                    ]}
                  >
                    {/* Show titleBig in large font, then title below */}
                    {introEvent.titleBig ? (
                      <ThemedText
                        variant="title"
                        color={theme.name === "dark" ? "lightGray" : "text"}
                        style={{
                          fontSize: 28,
                          fontWeight: "bold",
                          marginBottom: 6,
                          flexShrink: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        {introEvent.titleBig}
                      </ThemedText>
                    ) : null}
                    <ThemedText
                      variant="subTitle"
                      color={theme.name === "dark" ? "lightGray" : "text"}
                      style={[styles.sectionTitle, styles.introTitleText]}
                    >
                      {introEvent.title}
                    </ThemedText>
                    {introEvent.note ? (
                      <ThemedText
                        variant="subTitle"
                        color="accent2"
                        style={[
                          styles.sectionTitle,
                          styles.introTitleText,
                          { marginTop: 5 },
                        ]}
                      >
                        {introEvent.note}
                      </ThemedText>
                    ) : null}
                  </View>
                </SectionCard>
              </AnimatedEntry>
            </SectionContainer>
          ) : null}
          <SectionContainer gap={theme.spacing.one}>
            {filteredEvents.map((event: EventItem, index: number) => {
              const hasScheduledReminder =
                Object.keys(scheduledReminderIds[event.eventId] ?? {}).length >
                0;

              return (
                <AnimatedEntry key={event.eventId} index={index}>
                  <SectionCard>
                    <View style={styles.cardRow}>
                      <View style={styles.leftColumn}>
                        <View style={styles.metaRow}>
                          <Pill variant="time" style={{ alignSelf: "center" }}>
                            {event.time}
                          </Pill>
                          <ThemedText
                            variant="body"
                            color={
                              theme.name === "dark"
                                ? "lightGray"
                                : "textSecondary"
                            }
                            style={styles.placeText}
                          >
                            {event.place}
                          </ThemedText>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => openReminderSheet(event)}
                        style={styles.clockColumn}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={`Iestatīt atgādinājumu pasākumam ${event.title}`}
                      >
                        <View
                          style={[
                            styles.eventReminderIconWrap,
                            hasScheduledReminder && {
                              backgroundColor: theme.colors.darkRed,
                            },
                          ]}
                        >
                          <Image
                            source={require("../../../assets/icons/clock.svg")}
                            contentFit="contain"
                            style={[
                              styles.clockIcon,
                              {
                                tintColor: hasScheduledReminder
                                  ? theme.colors.white
                                  : theme.colors.darkRed,
                              },
                            ]}
                          />
                        </View>
                      </Pressable>
                      <View style={styles.markerColumn}>
                        <Image
                          source={require("../../../assets/icons/vieta.svg")}
                          contentFit="contain"
                          style={[
                            styles.placeIcon,
                            { tintColor: theme.colors.darkRed },
                          ]}
                        />
                      </View>
                    </View>
                    <View style={styles.cardRowTitle}>
                      <ThemedText
                        variant="subTitle"
                        color={theme.name === "dark" ? "lightGray" : "text"}
                        style={styles.sectionTitle}
                      >
                        {event.title}
                      </ThemedText>
                    </View>
                  </SectionCard>
                </AnimatedEntry>
              );
            })}
          </SectionContainer>
        </ScrollView>
      </View>
      <Modal
        transparent
        visible={isReminderSheetMounted}
        onRequestClose={closeReminderSheet}
      >
        <View style={styles.sheetOverlay}>
          <Animated.View
            style={[
              styles.sheetBackdrop,
              { opacity: reminderSheetBackdropOpacity },
            ]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={closeReminderSheet}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.reminderSheet,
              {
                backgroundColor: theme.colors.background,
                borderColor:
                  theme.name === "dark" ? theme.colors.lightGray : "#e5e7eb",
                paddingBottom: tabBarHeight + theme.spacing.three,
                transform: [{ translateY: reminderSheetTranslateY }],
              },
            ]}
          >
            <View
              style={[
                styles.reminderSheetHandle,
                { backgroundColor: theme.colors.darkGray },
              ]}
            />
            <Pressable
              onPress={closeReminderSheet}
              style={[
                styles.reminderSheetCloseButton,
                { backgroundColor: theme.colors.lightGray },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Aizvērt atgādinājuma izvēlni"
              hitSlop={8}
            >
              <SymbolView
                size={18}
                weight="semibold"
                tintColor={theme.colors.text}
                name={{ ios: "xmark", android: "close", web: "close" }}
              />
            </Pressable>
            <ThemedText
              variant="subTitle"
              color={theme.name === "dark" ? "textSecondary" : "text"}
              style={styles.reminderSheetTitle}
            >
              Vai vēlaties saņemt atgādinājumu par pasākuma sākumu?
            </ThemedText>
            <View style={styles.reminderOptionsList}>
              {REMINDER_OPTIONS.map((option) => {
                const isSelected = selectedReminderMinutes.includes(
                  option.minutesBefore,
                );

                return (
                  <Pressable
                    key={option.minutesBefore}
                    onPress={() => {
                      void toggleReminder(option.minutesBefore);
                    }}
                    style={[
                      styles.reminderOptionRow,
                      {
                        borderColor:
                          theme.name === "dark"
                            ? theme.colors.lightGray
                            : "#d1d5db",
                      },
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={option.label}
                  >
                    <View
                      style={[
                        styles.reminderOptionIconWrap,
                        isSelected && { backgroundColor: theme.colors.darkRed },
                      ]}
                    >
                      <Image
                        source={require("../../../assets/icons/clock.svg")}
                        contentFit="contain"
                        style={[
                          styles.reminderOptionIcon,
                          {
                            tintColor: isSelected
                              ? theme.colors.white
                              : theme.name === "dark"
                                ? theme.colors.lightGray
                                : theme.colors.darkRed,
                          },
                        ]}
                      />
                    </View>
                    <ThemedText
                      variant="body"
                      color={theme.name === "dark" ? "textSecondary" : "text"}
                      style={styles.reminderOptionText}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    zIndex: 20,
    marginBottom: 0,
    backgroundColor: "transparent",
  },
  dateSelectorContainer: {
    position: "absolute",
    zIndex: 19,
    marginBottom: 0,
    backgroundColor: "transparent",
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  container: {
    flex: 1,
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
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
    marginVertical: 11,
  },
  cardRowTitle: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: -8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    minWidth: 0,
  },
  placeText: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    lineHeight: 16,
    marginBottom: 0,
    fontSize: 13,
  },
  clockColumn: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    alignSelf: "stretch",
    flexShrink: 0,
    width: 32,
    marginLeft: 4,
    marginRight: -4,
  },
  eventReminderIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  clockIcon: {
    width: 24,
    height: 24,
    // SVG strokeWidth is set to 2 for bolder look
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },
  reminderSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    height: "35%",
  },
  reminderSheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 18,
  },
  reminderSheetCloseButton: {
    position: "absolute",
    top: 14,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderSheetTitle: {
    marginBottom: 18,
    marginRight: 52,
  },
  reminderOptionsList: {
    gap: 12,
  },
  reminderOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  reminderOptionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  reminderOptionIcon: {
    width: 24,
    height: 24,
  },
  reminderOptionText: {
    marginLeft: 14,
    marginBottom: 0,
    flex: 1,
  },
  weekSectionTitle: {
    marginBottom: 4,
    marginLeft: 4,
  },
  markerColumn: {
    alignItems: "center",
    justifyContent: "flex-start",
    alignSelf: "stretch",
    flexShrink: 0,
    paddingHorizontal: 1,
  },
  placeIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
  },
  eventTitle: {
    flexShrink: 1,
    minWidth: 0,
    marginTop: -0.5,
  },
  sectionTitle: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  introTitleText: {
    marginBottom: 0,
    flexShrink: 1,
    flexWrap: "wrap",
  },
});
