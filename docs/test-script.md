# GlowTrack manual regression test

Run this before every release build. It takes about 25 to 30 minutes, and
you don't need to know the app. Every step says what **Pass** looks like.
Anything else is a fail: note the step number, what you saw, and take a
screenshot.

The sections run in this order on purpose. The bad-photo checks come before
the first real scan, while the free scan is still unused. Account deletion
comes last, because it wipes everything.

## Before you start (2 minutes)

- An Android phone with a front camera, charged, on Wi-Fi.
- The build to test, installed from the Play testing track or as a preview
  APK.
- **A Google account added as a license tester.** Use Play Console →
  Settings → License testing, and sign in with it in the Play Store on the
  phone. Test purchases are then free, and subscriptions renew every few
  minutes instead of weekly.
- A well-lit spot near a window, and a second person for step 2.5.
- If the app was installed before: uninstall it first, so this is a fresh
  install.
- The Home tab is still a placeholder that says "No scans yet" even after
  scans. That's expected for now, so don't report it.

Mark each step `[x]` as it passes.

## 1. Fresh install and onboarding (3 minutes)

1. [ ] **Install the app and open it.**
       Pass: "Getting things ready" shows briefly, then "See whether your routine
       is working" with **Get started**. There's no sign-in screen or crash.
2. [ ] **Read the welcome screen.**
       Pass: the line "GlowTrack gives cosmetic estimates, not professional
       skincare advice." is visible.
3. [ ] **Tap Get started.**
       Pass: "How old are you?" appears with five age ranges (18–24 up to 55+).
       Nothing under 18 is offered.
4. [ ] **Pick an age range.**
       Pass: **Continue** becomes active. The progress indicator moves on.
5. [ ] **On "How would you describe your skin?", pick any option and
       continue.**
       Pass: "What would you like to focus on?" appears.
6. [ ] **Tap four focus options.**
       Pass: the fourth isn't selected, and "You can pick up to 3." shows. The
       counter reads "3 of 3 selected".
7. [ ] **Continue, pick a goal, and continue.**
       Pass: "You're all set" appears, with a summary naming your skin type (or
       just the goal) and **Take my first scan**.
8. [ ] **Close the app completely (swipe it away), then open it again.**
       Pass: it returns to the step you were on, with your answers kept. It
       doesn't start over.
9. [ ] **Tap Take my first scan.**
       Pass: "Before your first photo" appears, with four points about how the
       photo is stored and deleted.
10. [ ] **Tap Continue.**
        Pass: "Camera access" explains why, with **Allow camera**.
11. [ ] **Tap Allow camera, then allow it in the system dialog.**
        Pass: the live front camera shows, with a face oval and a guidance line.

## 2. Bad photo handling (4 minutes)

The free scan must survive every one of these.

1. [ ] **Cover the camera, or point it at a dark corner.**
       Pass: the guidance reads "Move to brighter light". Pressing the shutter
       takes no photo.
2. [ ] **Shake the phone gently while pointing at your face.**
       Pass: the guidance reads "Hold steady". Pressing the shutter takes no
       photo.
3. [ ] **Point the camera at a plain wall in good light, hold still, and take
       the photo. Tap Use this.**
       Pass: "Looking at your photo" shows its steps, then "We couldn't use that
       photo" and "We couldn't find a face in the photo." The line "This didn't
       use up your free scan." is shown.
4. [ ] **Tap Retake photo.**
       Pass: back on the live camera.
5. [ ] **With a second person's face also in the frame, take the photo and
       tap Use this.**
       Pass: "There was more than one face in the photo." The free scan is still
       kept.
6. [ ] **Tap Retake photo.** Hold the phone at arm's length in soft, even
       light, and **take a blurry photo on purpose:** move just as you press, if
       the shutter allows it.
       Pass: either the shutter holds back with "Hold steady", or the result is
       "The photo was blurry…". The free scan is still kept.

## 3. First scan, the happy path (3 minutes)

1. [ ] **Face a window, hold the phone at eye level, and wait for "Looking
       good".**
       Pass: the guidance turns to "Looking good" and the shutter is active.
2. [ ] **Tap the shutter.**
       Pass: "Use this photo?" shows your photo with **Use this** and **Retake**.
3. [ ] **Tap Use this twice, quickly.**
       Pass: one waiting screen, "Looking at your photo". The steps move from
       "Uploading your photo" to "Looking at texture, tone and clarity". Only one
       scan appears later in the history (checked in 6.5).
4. [ ] **Wait for the results.**
       Pass: within about 30 seconds, "Your results" appears. The overall score
       counts up, then seven scores (Clarity, Texture, Pores, Hydration,
       Redness, Evenness, Firmness), a one-line summary, "What stands out" and
       "Where to focus".
5. [ ] **Read the whole results screen.**
       Pass: the disclaimer "GlowTrack gives cosmetic estimates of how your skin
       looks in a photo…" is visible. No wording suggests the app identifies a
       skin problem, and no score is shown in red.

## 4. Results and sharing (3 minutes)

1. [ ] **Tap Share.**
       Pass: "Share your progress" shows a preview, with Story and Feed formats.
       **Include my photo** is off.
2. [ ] **Switch between Story and Feed.**
       Pass: the preview changes shape. The short disclaimer is printed at the
       bottom of the image.
3. [ ] **Turn on Include my photo.**
       Pass: "Share your photo?" asks first. Only after **Include photo** does
       your face appear in the preview.
4. [ ] **Tap Share image.**
       Pass: the Android share sheet opens with the image. Cancel it. The app
       doesn't crash and stays on the share screen.
5. [ ] **Go back to the results and tap Build my routine.**
       Pass: "A weekly nudge?" appears first, explaining the reminders.
6. [ ] **Tap Turn on reminders, and allow notifications in the system
       dialog.**
       Pass: the Routine tab opens with Morning and Evening steps. The last
       morning step is sunscreen.

## 5. Paywall and purchase (4 minutes)

1. [ ] **On the Progress tab, find the trend.**
       Pass: the latest score shows, plus "Your trend and comparisons" with
       **See plans**. That part is locked.
2. [ ] **Start a second scan from the Home tab (Take a scan).**
       Pass: the plans open instead of the camera. There's no free second scan.
3. [ ] **Look at the plans without buying.**
       Pass:
   - Annual, monthly and weekly show real prices, each billed per period;
   - Annual is pre-selected;
   - under the button, the terms say what you pay, when, and that it renews
     until you cancel in Google Play;
   - Restore purchases, Terms and Privacy Policy are present, and Close
     always stays visible.
4. [ ] **Tap Restore purchases.**
       Pass: "We couldn't find a subscription on this Google Play account."
5. [ ] **Choose Weekly, tap its button, and cancel the Google Play sheet.**
       Pass: "Purchase cancelled. Nothing was charged."
6. [ ] **Buy Weekly again with the test card "Test card, always approves".**
       Pass: "You're subscribed" with **Continue**. Continue opens the camera.
7. [ ] **Close the app completely and reopen it.**
       Pass: still subscribed. The plans don't reappear when you start a scan.

## 6. Second scan and comparison (4 minutes)

1. [ ] **On the camera, look for your last photo.**
       Pass: a tip explains the faint previous photo. **Show last photo** /
       **Hide last photo** toggles it.
2. [ ] **Line up with the faint photo, take the scan, and tap Use this.**
       Pass: the results appear, with "Since your last scan" showing the change
       in each score ("Up 2", "Down 1", "No change").
3. [ ] **Tap See my progress.**
       Pass: the latest score, the change since your first scan, a trend chart
       with two points, and a note about normal photo-to-photo variation.
4. [ ] **Tap a point on the chart, then change the filter to one score.**
       Pass: the point shows its date and score. The line switches to that
       score.
5. [ ] **Scroll to Scan history.**
       Pass: exactly two scans, with thumbnails, newest first. The double tap in
       3.3 didn't create a third. The rejected photos from section 2 aren't
       listed.
6. [ ] **Tap Compare two scans.**
       Pass: "Before and after" shows both photos. Dragging the slider wipes
       between them, and the score table shows each change and the days
       between.
7. [ ] **Tap Share this comparison, then Include my photos.**
       Pass: the same confirmation as 4.3. The image carries the short
       disclaimer.

## 7. Routine and notifications (2 minutes)

1. [ ] **Open the Routine tab and tick two steps.**
       Pass: each tick responds at once, with a small vibration, and the
       completion ring moves.
2. [ ] **Close the app completely and reopen the Routine tab.**
       Pass: the same two steps are still ticked.
3. [ ] **Untick one step.**
       Pass: it clears, and stays cleared after reopening.
4. [ ] **Open Settings → Reminders.**
       Pass:
   - "At most one reminder a day, whatever is switched on." is shown;
   - the weekly scan reminder is on, with a day and a time;
   - the daily routine reminder is locked until the routine has been used a
     couple of times.
5. [ ] **Optional, for the weekly reminder:** set the phone's date 7 days
       ahead, wait a minute, then set it back to automatic.
       Pass: one "Time for your weekly scan"-style notification arrives. Tapping
       it opens the app.

## 8. Offline behaviour (3 minutes)

1. [ ] **With the app open on the Routine tab, turn on airplane mode, tick a
       step, and untick another.**
       Pass: both change at once. There's no error.
2. [ ] **Turn airplane mode off and wait 10 seconds.** Close the app
       completely, reopen it, and open the Routine tab.
       Pass: the changes from 8.1 are still there, so they synced.
3. [ ] **Turn on airplane mode and start a scan. Take the photo and tap Use
       this.**
       Pass: "Your photo didn't upload" or "You're offline…", with **Try again**
       and **Go back**. There's no endless spinner.
4. [ ] **Turn airplane mode off and tap Try again.**
       Pass: the scan completes normally.
5. [ ] **With airplane mode on, close the app completely and reopen it.**
       Pass: "We couldn't get started. Check your connection and try again." with
       a retry. This is expected: see the known limitation in
       `docs/hardening-report.md`. Turn airplane mode off and retry: the app
       opens where you were.
6. [ ] **In the Play Store app, cancel the test subscription** (profile →
       Payments & subscriptions → Subscriptions → GlowTrack → Cancel).
       Pass: Play confirms the cancellation. Test subscriptions end within a few
       minutes; section 9 checks what happens then.

## 9. Settings, data export and account deletion (5 minutes)

1. [ ] **Open Settings → Subscription.**
       Pass: "Plan: Weekly" with "Ends on …" or "Free trial ends on …", no
       longer "Renews on". **Manage subscription** opens Google Play's
       subscriptions page.
2. [ ] **Back in the app, open Settings → About.**
       Pass:
   - the full disclaimer and the app version are shown;
   - Privacy Policy and Terms open in the browser (or say the page didn't
     open, if the addresses aren't set yet);
   - Contact support opens an email draft, if a support address is set.
3. [ ] **Tap Download my data.**
       Pass: the share sheet offers `glowtrack-my-data.json`. Save it to Files or
       send it to yourself: it lists your scans and their scores, with no photos.
4. [ ] **Tap Delete all my scan photos and confirm.**
       Pass: "Your photos have been deleted." The Progress history shows
       placeholders instead of thumbnails, and the scores are still there.
5. [ ] **Once the end time from 9.1 has passed,** switch to another app and
       back, then open Settings → Subscription.
       Pass: "Your subscription has ended. Your history and comparisons stay."
       The Progress tab still shows the trend. Starting a scan opens the plans
       instead of the camera.
6. [ ] **Tap Delete my account.**
       Pass: a full screen lists what will be deleted, says it can't be undone,
       and says to cancel the subscription in Google Play separately.
       **Delete everything** stays disabled.
7. [ ] **Type `delete` in lower case.**
       Pass: still disabled.
8. [ ] **Type `DELETE` and tap Delete everything.**
       Pass: "Your account and all your data have been deleted." The app starts
       over at "See whether your routine is working".
9. [ ] **Go through onboarding quickly and open the Progress tab.**
       Pass: "No scans yet". Nothing from the deleted account is visible.

## After the run

- **If every box is ticked,** the build passes.
- **If anything failed,** file it with its step number and screenshot before
  the build ships.
- **For the developer, after 9.8:** run the SQL check in README → Privacy
  controls, using the deleted user's id. Every count should be 0.
