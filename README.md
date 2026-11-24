# Mobile Walking Tracker

A React Native app built with Expo that tracks a walk using the phone's
location. It shows the current latitude and longitude, tracks how long
the walk has been going, and uses local notifications to remind the
user about a paused walk and to celebrate reaching the walking goal.

## Features

- Get Current Location shows the current latitude and longitude
- Start Walk tracks location while the walk is active
- Pause, Resume, and Stop controls for a walking session
- Timer with a 60 second walking goal and a progress display
- Notification permission request with the status shown in the app
- Pause reminder notification 10 seconds after a walk is paused
- Pause reminder is canceled when the walk is resumed or stopped
- Goal notification when the 60 second goal is reached, sent once per session
- Privacy notice explaining what location data is collected

## Privacy

The app collects latitude, longitude, date, and time only while a walk
is being tracked. Records are stored locally on the device. The user
can pause or stop tracking at any time.

## Install

    npm install

This installs the project packages, including expo-location and
expo-notifications.

## Run the App

    npx expo start

Scan the QR code with Expo Go on a physical phone, or open the project
in an emulator. Notifications should be tested on a real device.

## How to Use

1. Allow location and notification permissions when asked.
2. Tap Get Current Location to see the current coordinates.
3. Tap Start Walk to begin tracking.
4. Tap Pause Walk to pause. A reminder is scheduled for 10 seconds later.
5. Tap Resume Walk to continue the same session. The reminder is canceled.
6. Tap Stop Walk to end the session. The timer and goal reset.
7. Walk for 60 seconds to reach the goal and get the goal notification.

## Notification Tests

| Test | Result |
| --- | --- |
| Notification permission approved, status message shows enabled | Pass |
| Notification permission denied, app says reminders are disabled | Pass |
| Pause a walk, reminder notification appears after about 10 seconds | Pass |
| Pause then resume before the reminder, reminder does not appear | Pass |
| Pause then stop before the reminder, reminder does not appear | Pass |
| Progress counts up while tracking and freezes when paused | Pass |
| 60 second goal reached, goal notification appears | Pass |
| Goal notification appears only once in a session | Pass |
| App minimized, notification still appears | Pass |

## Problems and Solutions

- The app broke after adding the pause reminder because the pause
  function used await without being marked async, and it had an extra
  closing brace. Fixed by replacing the pause, resume, and stop
  functions with corrected async versions.
- The screen got crowded as features were added. The expo push token
  and notification channels text from an earlier tutorial took up a
  lot of space, so those displays were removed (they were only for
  testing remote push notifications), the privacy notice was widened,
  and the tracking buttons were placed in a row.
- Resume at first only restarted tracking and did not cancel the
  scheduled reminder, so the reminder would have fired during the
  walk. Fixed by saving the notification ID when the reminder is
  scheduled and canceling it on resume and stop.

