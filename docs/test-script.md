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

The tab bar has two tabs, **Home** and **Progress**. A new scan starts from
the large **Scan my skin** card at the top of Home. **Settings** opens from
the round profile button at the top right of Home, and **the routine** from
"Today's routine" on Home.

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
       counts up, then seven scores (Clarity, Texture, Refined pores, Hydration,
       Calm tone, Evenness, Firmness), a one-line summary, "What stands out" and
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
       Pass: the routine opens with Morning and Evening steps, and a Back
       button at the top. The last morning step is sunscreen. Back goes to
       Home.

## 5. Paywall and purchase (4 minutes)

1. [ ] **On the Progress tab, find the trend.**
       Pass: the latest score shows, plus "Your trend and comparisons" with
       **See plans**. That part is locked.
2. [ ] **Start a second scan with Scan my skin on Home.**
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

1. [ ] **On Home, tap Morning under "Today's routine", and tick two steps.**
       Pass: the routine opens on the morning steps. Each tick responds at
       once, with a small vibration, and the completion ring moves. Back on
       Home, the Morning row shows the two steps done.
2. [ ] **Close the app completely, reopen it, and open the routine.**
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

1. [ ] **With the routine open, turn on airplane mode, tick a step, and
       untick another.**
       Pass: both change at once. There's no error.
2. [ ] **Turn airplane mode off and wait 10 seconds.** Close the app
       completely, reopen it, and open the routine.
       Pass: the changes from 8.1 are still there, so they synced.
3. [ ] **Turn on airplane mode and start a scan. Take the photo and tap Use
       this.**
       Pass: "Your photo didn't upload" or "You're offline…", with **Try again**
       and **Go back**. There's no endless spinner.
4. [ ] **Turn airplane mode off and tap Try again.**
       Pass: the scan completes normally.
5. [ ] **With airplane mode on, close the app completely and reopen it.**
       Pass: the app opens on Home. Home says your latest scan didn't load,
       with Try again. The routine shows today's steps and ticks, and
       ticking works. Turn airplane mode off and tap Try again on Home: your
       latest score appears.
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

## Navigation check (6 minutes)

Run this once on any build that changes how screens are reached, such as
the two-tab layout with **Scan my skin** on Home. It needs an account with at
least one scan and a routine, so run it after section 4. Like the look and
feel check, it sits apart from the numbered sections so their step numbers
don't move.

1. [ ] **The tab bar.**
       Pass: a plain bar along the bottom with two tabs, **Home** and
       **Progress**, each an icon over a label, and nothing between them: no
       round or raised button. The open tab's icon sits on a pale mint pill
       and its label is teal and bolder. The bar clears the phone's own
       navigation bar or gesture line, and nothing on the screen is hidden
       behind it.
2. [ ] **Tap Progress, then Home.**
       Pass: each opens, and the pill moves with it.
3. [ ] **Find Scan my skin on Home.**
       Pass: a large teal card at the top, under the title and the profile
       button, with the sun mark, "Scan my skin", a short line under it and a
       yellow camera badge. It shows before the first scan too (fresh
       install), and when the latest scan didn't load.
4. [ ] **Tap Scan my skin.**
       Pass: it opens the camera, or the plans once the free scan is used
       without a subscription, exactly as **Take a scan** on Progress does.
       Closing it comes back to Home.
5. [ ] **Look at "Today's routine" on Home, then tap Evening.**
       Pass: Home shows how many steps are done today, and a Morning and an
       Evening row, each with a count and a progress bar. Evening opens the
       routine with the evening steps showing and a **Back** button at the
       top. Tick a step and tap Back: the Evening row shows one more done.
6. [ ] **Tap the round profile button at the top right of Home.**
       Pass: Settings opens, with Account, Subscription, Reminders, Your data
       and About, and a **Back** button that stays at the top while you
       scroll. Back goes to Home. (A preview build with the premium preview
       turned on also shows Testing; see the Premium preview check.)
7. [ ] **Open everything that lives in Settings.**
       Pass: Save my progress (sign-in), Manage subscription, Download my
       data, Delete all my scan photos (cancel it), Delete my account (open
       it, then Close without deleting), Privacy Policy, Terms and Contact
       support all open as before. After Save my progress, tapping the link
       in the email brings you back to Settings.
8. [ ] **Before the first scan** (fresh install, before 3.1, or after 9.9).
       Pass: Home shows Scan my skin, then "No scans yet" with no second scan
       button, and still has the profile button, so Settings opens before
       any scan.
9. [ ] **Android's back button.**
       Pass:
   - on Progress, back goes to Home;
   - on Home, back leaves the app;
   - on the routine and on Settings, back goes to Home;
   - on the plans, back closes them;
   - on the results of a scan, back leaves for Home, as before.
10. [ ] **The plans, while the subscriptions aren't set up in Play Console
        yet.** Open Progress → See plans.
        Pass: in place of the plans, "Plans aren't available yet on this
        device. Please try again soon." with **Try again** and **Go back**.
        Try again shows the loading lines briefly, then the plans if the
        store has them, or the same message. No price shows anywhere. Go
        back and Close both leave. The value points, Restore purchases,
        Terms and Privacy Policy are still there. Once the subscriptions
        exist, the plans show with their store prices instead.
11. [ ] **TalkBack** (Settings → Accessibility → TalkBack).
        Pass: the tabs read as "Home, tab, selected" and "Progress, tab";
        Scan my skin as "Scan my skin, button", with "Opens the camera for a
        new scan"; the profile button as "Settings and account, button"; a
        routine row as, for example, "Morning routine, 2 of 4 done, button".
12. [ ] **Largest font.** Set Font size to the largest and look at the tab
        bar and Home.
        Pass: the tab labels aren't cut off; on Scan my skin, the title and
        its line wrap inside the card, beside the mark and the camera badge,
        without overlapping; the routine rows' text wraps without
        overlapping. Set the font size back afterwards.

## Premium preview check (test builds only, 5 minutes)

Only on a **preview** build whose update was published with
`EXPO_PUBLIC_ENABLE_PREMIUM_PREVIEW=true` in the EAS `preview` environment
(docs/ota-updates.md, "Testing premium on the preview build"). It needs an
account whose free scan is used, without a subscription. Never on a
production or Play Store build: there, step 1 must find no Testing section.

1. [ ] **Open Settings and scroll down.**
       Pass: a **Testing** section with a coral gear badge, saying it's only
       in test builds, a **Preview premium** switch (off), and a note that
       scans still follow the server's free-scan limit. On a production or
       Play Store build there's no Testing section at all.
2. [ ] **With the switch off, check the locks.**
       Pass: Progress shows "Your trend and comparisons" with **See plans**,
       and Scan my skin opens the plans.
3. [ ] **Turn Preview premium on, go Back, and open Progress.**
       Pass: the trend ("Over time", with the score chips and chart) and
       "Before and after" replace the locked card. With two or more scans,
       Compare two scans opens the comparison.
4. [ ] **Close the app completely and reopen it.**
       Pass: the switch is still on and Progress is still unlocked. It's
       saved on this phone only.
5. [ ] **Tap Scan my skin and take a photo.**
       Pass: the camera opens instead of the plans. After Use this, the
       server turns the scan down: "This scan needs a subscription" with a
       note that Preview premium only changes what this phone shows, and the
       plans open. That's expected: the server still needs a real
       subscription.
6. [ ] **Settings → Subscription.**
       Pass: still "No active subscription": the preview isn't a
       subscription.
7. [ ] **Turn Preview premium off.**
       Pass: Progress is locked again and Scan my skin opens the plans.

## Look and feel check (10 minutes)

Run this once on any build that changes the app's look, such as the
supporting colours (sun yellow, coral, lavender and sky blue) beside the
launcher icon's teal and mint. It needs an account with at least two scans and a
routine, so run it after section 8 and before section 9 wipes the account.
It sits apart from the numbered sections so their step numbers don't move.

**Before you start:** on the phone, open Settings → Display, and note how
to change **Font size** and **Dark theme**. Start on the default font size,
in light mode.

1. [ ] **Startup and onboarding** (fresh install, or after 9.8).
       Pass: the app's teal is the teal of the GlowTrack icon on the phone's
       home screen. The sun-over-arc mark, a teal sun over mint arcs like
       the icon's, shows on "Getting things ready", the welcome step and
       "You're all set". The progress bar fills in teal. A selected answer
       turns pale mint with a teal outline and tick; nothing shifts sideways
       when it's tapped.
2. [ ] **Sign-in and "Check your email"** (Settings → Save my progress).
       Pass: the email field's outline turns teal while typing. A bad
       address shows its message in a deep pink-red, not teal.
3. [ ] **Home.**
       Pass: the screen is white, and the small sun mark sits beside
       "Home". Scan my skin is a teal card that looks like the app icon (a
       cream sun over mint arcs) with a sun-yellow camera badge. Below it,
       each card has its own soft colour, with rounded corners: the latest
       score sky blue, Today's routine mint with a sun-yellow Morning row and
       a lavender Evening row (each with a matching badge and progress bar),
       and Your next scan coral. Main buttons are teal pills with white text;
       outlined buttons have teal text. Every word is easy to read.
4. [ ] **Camera and tips.**
       Pass: the face oval turns mint at "Looking good". **Why?** opens a
       sheet with rounded top corners, a grab bar and teal tick badges.
       "Before your first photo" and "Camera access" (on a fresh install)
       match the same style.
5. [ ] **Waiting, rejected and limit screens** (from section 2).
       Pass: the photo has rounded corners, finished steps show a teal tick
       badge, and every message and button is readable. "That's enough
       photos for now", if you reach it, looks the same, with Go back.
6. [ ] **Results.**
       Pass: the ring and bars run from pale mint (low) to deep teal (high);
       nothing looks red or alarming. The seven scores sit on a sky-blue
       card, "Where to focus" on a sun-yellow panel, and "Since your last
       scan" on a lavender card. The full disclaimer, with its info icon, is
       visible without scrolling past anything collapsed.
7. [ ] **Share.**
       Pass: the preview is a light mint card with the sun mark beside
       "GlowTrack". The shared image looks the same as the preview.
8. [ ] **Progress and compare.**
       Pass: the latest score sits on a sky-blue card, "Over time" (or the
       locked "Your trend and comparisons") on a lavender card with a
       lavender chart line and points, "Before and after" on a coral card,
       and the weekly streak on a sun-yellow card. History thumbnails show
       (or show a mint placeholder). On the "Before and after" screen, there
       is no coloured strip down the left edge of the screen.
9. [ ] **Routine pictures.** Open Morning, then Evening.
       Pass:
   - every step shows a drawing between its tick box and its text, and
     still shows its title and its one-line reason;
   - Morning is a sun-yellow card and Evening a lavender one, each with a
     matching badge, and ticked boxes in the section's colour;
   - each kind of step has its own colour, its drawing in that colour on a
     tile of the same soft colour: sunscreen and face oil yellow, serum and
     lip balm coral, eye cream and makeup remover lavender, cleanser and
     toner blue, moisturiser mint;
   - each drawing matches the step: makeup remover and cotton pad,
     cleanser pump, toner bottle, serum dropper, eye cream tube,
     moisturiser jar, face oil bottle, lip balm, sunscreen tube with a sun;
   - no drawing shows a brand, logo or real packaging;
   - tapping the drawing ticks the step, like tapping its text.
10. [ ] **Routine with TalkBack** (Settings → Accessibility → TalkBack).
        Pass: a step reads as its title, "checkbox", ticked or not, and its
        reason. TalkBack doesn't stop on the drawing or read
        "Illustration of…" for it.
11. [ ] **Paywall.**
        Pass: on each plan, the billed price is the largest text; "Best
        value" sits on a small teal pill under it. The terms under the
        button are plain body text. Close, Restore purchases, Terms and
        Privacy Policy are all visible.
12. [ ] **Settings and Delete my account.**
        Pass: each section is a mint card with a coloured badge beside its
        title: Account blue, Subscription yellow, Reminders coral, Your data
        lavender, About mint. Switches are teal when on.
        **Delete my account** is a deep pink-red button, clearly different
        from the teal ones.
13. [ ] **Error and empty states.** Look back at the offline screens in
        section 8, and at the Progress tab after 9.9.
        Pass: a full-screen error shows a quiet grey badge and an outlined
        Try again, never red. "No scans yet" shows the sun mark above it.
14. [ ] **Dark theme.** Turn on Dark theme and repeat 3, 6, 9 and 11
        quickly.
        Pass: backgrounds are a deep teal-black, the accent is the icon's
        bright mint, and main buttons have dark text. The sun mark beside
        "Home" has a cream sun, and Scan my skin is mint with a dark mark and
        dark text. The coloured cards turn deep and muted (navy, brown, plum)
        with their colours bright on top. Every word is readable, and the
        routine drawings show clearly on their dark tiles.
15. [ ] **Largest font.** Set Font size to the largest, and repeat 3, 6, 9,
        11 and 12.
        Pass: no text is cut off or overlaps. A long button label, such as
        "Delete all my scan photos", wraps onto two lines inside its button
        instead of ending in "…". Routine text wraps beside its drawing.
16. [ ] **Smallest font.** Set Font size to the smallest and look at Home and
        Routine.
        Pass: text is small but every button and tick box is still a large,
        easy target. Set the font size back afterwards.

## After the run

- **If every box is ticked,** the build passes.
- **If anything failed,** file it with its step number and screenshot before
  the build ships.
- **For the developer, after 9.8:** run the SQL check in README → Privacy
  controls, using the deleted user's id. Every count should be 0.
