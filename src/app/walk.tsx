import { useState, useEffect } from "react";
import { Platform, Text, View, StyleSheet } from "react-native";
import permissionbutton from "../components/permissions.button";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { Button } from "react-native";
import WalkMap from "../components/walk-map";
import { Link } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "reminder",
      body: "Hey come check in! 👋",
      data: { data: "goes here", test: { test1: "more data" } },
    },
    // have a nice little reminder with user to remind them to log how their walk went
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("myNotificationChannel", {
      name: "A channel is needed for the permissions prompt to appear",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return;
  }
  // Learn more about projectId:
  // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
  // EAS projectId is used here.
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log(token);
  } catch (e) {
    token = `${e}`;
  }

  return token;
}

export default function Walkscreen() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [status, setStatus] = useState("Not tracking");

  const [watch, setWatch] = useState<Location.LocationSubscription | null>(null);

  const [seconds, setSeconds] = useState(0);

  const [noteMsg, setNoteMsg] = useState("");

  const [notificationsOn, setNotificationsOn] = useState(false);

  const [reminderId, setReminderId] = useState<string | null>(null);

  const [goalSent, setGoalSent] = useState(false);


  async function getCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Location access is required to use the tracking features.");
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    console.log(currentLocation);
    const { latitude, longitude } = currentLocation.coords;
    console.log(latitude, longitude);
    setLocation(currentLocation);
  }

  async function startWalk() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    setErrorMsg("Location access is required to use the tracking features.");
    return;
  }

  setStatus("Tracking");

  const sub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10,
    },
    (location) => {
      setLocation(location);
    }
  );
  setWatch(sub);
  }

  const pauseWalk = async () => {
  if (watch) {
    watch.remove();
    setWatch(null);
  }
  setStatus("Paused");
    if (!notificationsOn) return;
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Walk Paused",
        body: "Your walk is still paused. Open the app when you are ready to continue.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 10,
      },
      });
      setReminderId(id);
      setNoteMsg("Pause reminder scheduled.");
    };

  const cancelReminder = async () => {
    if (!reminderId) return;
    await Notifications.cancelScheduledNotificationAsync(reminderId);
    setReminderId(null);
    setNoteMsg("Pause reminder canceled.");
  };

  const resumeWalk = async () => {
    await cancelReminder();
    startWalk();
  };

  const stopWalk = async () => {
    await cancelReminder();
    if (watch) {
      watch.remove();
      setWatch(null);
    }
    setStatus("Not tracking");
    setSeconds(0);
    setGoalSent(false);
  };

  useEffect(() => {
  if (status !== "Tracking") return;
  const timer = setInterval(() => {
    setSeconds((s) => s + 1);
  }, 1000);
  return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
  if (seconds < 60 || goalSent) return;
  setGoalSent(true);
  setNoteMsg("Walking goal reached!");
  if (!notificationsOn) return;
  Notifications.scheduleNotificationAsync({
    content: {
      title: "Goal Reached",
      body: "Great job! You completed your walking goal.",
    },
    trigger: null,
  });
  }, [seconds]);


  useEffect(() => {
    async function setupnotification() {

      const { status } = await Notifications.requestPermissionsAsync();
        if (status === "granted") {
          setNotificationsOn(true);
          setNoteMsg("Notifications are enabled.");
        } else {
          setNoteMsg("Notifications are disabled. Reminders will not appear.");
        }

      registerForPushNotificationsAsync().then(
        (token) => token && setExpoPushToken(token),
      );

      if (Platform.OS === "android") {
        Notifications.getNotificationChannelsAsync().then((value) =>
          setChannels(value ?? []),
        );
      }
    }
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    setupnotification();

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    //only need latitude and longitude
    text = `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{text}</Text>
      <Text style={styles.status}>Status: {status}</Text>
      <Text style={styles.status}>Goal: 60 seconds</Text>
      <Text style={styles.status}>Progress: {seconds} seconds</Text>
      <Text style={styles.status}>{noteMsg}</Text>
      <View style={styles.buttonRow}>
        <View style={styles.buttonBox}>
          <Button title="get current Location" onPress={getCurrentLocation} />
        </View>
        <View style={styles.buttonBox}>
          <Button title="Start Walk" onPress={startWalk} />
        </View>
        <View style={styles.buttonBox}>
          <Button title="Pause Walk" onPress={pauseWalk} />
        </View>
        <View style={styles.buttonBox}>
          <Button title="Resume Walk" onPress={resumeWalk} />
        </View>
        <View style={styles.buttonBox}>
          <Button title="Stop Walk" onPress={stopWalk} />
        </View>
      </View>
      <WalkMap />
      <Link href="/walk-notes" style={styles.link}>
        Go to Walk-Notes
      </Link>
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
      <Text style={styles.notice}>
        Privacy: This app collects your latitude, longitude, date, and time only
        while a walk is being tracked. Location records are stored locally on your
        device. You can pause or stop tracking at any time.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    color: "#898989",
  },
  paragraph: {
    fontSize: 18,
    textAlign: "center",
    color: "#898989",
  },
  notice: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
    width: "80%",
    color: "#898989",
  },
  status: {
    fontSize: 16,
    color: "#898989",
    marginTop: 8,
  },
  link: {
    fontSize: 16,
    color: "#1E90FF",
    marginTop: 8,
  },
  buttonRow: {
  flexDirection: "row",
  width: "100%",
  marginTop: 8,
  },
  buttonBox: {
    flex: 0.5,
    marginHorizontal: 1,
  },
});
