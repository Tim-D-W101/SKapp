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

The bar along the bottom has two big pill buttons, **Home** and
**Progress**. A new scan starts from **Scan my skin** on the teal panel at
the top of Home. **Settings** opens from the round profile button at the top
right of Home, **the routine** from the Morning and Evening tiles under
"Today's routine", and **reminders** from the Reminders card under them (or
from Settings → Reminders).

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
       Pass: "Do you want daily reminders?" appears first, with a coral bell,
       a line saying it's once a day at a time you pick, **Yes, set my time**
       and **Not now**.
6. [ ] **Tap Yes, set my time. Choose Morning, tap the time, pick 7, then
       :45, then Save. Tap Save my reminder, and allow notifications in the
       system dialog.**
       Pass: "When suits you?" shows Morning and Evening and a time box; after
       the picker it reads 7:45 AM. Then the routine opens with Morning and
       Evening steps, and a Back button at the top. The last morning step is
       sunscreen. Back goes to Home.

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
       Pass: no reminders question this time (a daily reminder was set in
       4.6). The latest score, the change since your first scan, a trend chart
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
   - the daily routine reminder is set to Morning at 7:45 AM, the time
     picked in 4.6.
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
       latest score appears, and within a few seconds the Reminders card
       shows your next reminder.
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

1. [ ] **The bottom bar.**
       Pass: two big pill-shaped buttons side by side, **Home** and
       **Progress**, filling the width of the screen, each an icon beside
       its label, and nothing between them: no round or raised Scan button.
       The open one is filled teal with white text and a solid white icon;
       the other is a white pill with a soft shadow and no outline, teal
       text and the same icon outlined in teal. No line runs across the top
       of the bar. Home is a house with a rounded roof and a door;
       Progress is a rounded square with three rising bars. Each icon is
       centred beside its label and the same size whether solid or
       outlined, so nothing jumps when the tab changes. The bar clears the phone's
       own navigation bar or gesture line, and nothing on the screen is
       hidden behind it.
2. [ ] **Tap Progress, then Home.**
       Pass: each opens, and the teal fill moves to the button you tapped.
3. [ ] **Find Scan my skin on Home.**
       Pass: a white pill button with a camera at the bottom of the teal
       panel, under the date, the greeting and the latest score, with "Next
       scan suggested for …" (or "Your weekly scan is ready") under it. It
       shows before the first scan too (fresh install), and when the latest
       scan didn't load.
4. [ ] **Tap Scan my skin.**
       Pass: it opens the camera, or the plans once the free scan is used
       without a subscription, exactly as **Take a scan** on Progress does.
       Closing it comes back to Home.
5. [ ] **Look at "Today's routine" on Home, then tap Evening.**
       Pass: Home shows how many steps are done today beside the heading,
       and two tiles side by side, Morning (yellow) and Evening (blue), each
       with a count and a teal progress bar. Evening opens the routine with
       the evening steps showing and a **Back** button at the top. Tick a
       step and tap Back: the Evening tile shows one more done.
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
       Pass: Home shows the date and greeting, then the teal panel with the
       sun mark, "Your first scan", a line about the baseline and Scan my
       skin, with nothing below it: no routine, reminders or second scan
       button. The profile button is still there, so Settings opens before
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
        Pass: the two bottom buttons read as "Home, tab, selected" and
        "Progress, tab"; Scan my skin as "Scan my skin, button", with "Opens
        the camera for a new scan"; the score on the teal panel as "Your
        latest scan. Overall 72. From your scan on …, button", with "Opens
        the results of this scan"; the profile button as "Settings and
        account, button"; a routine tile as, for example, "Morning routine, 2
        of 4 done, button"; the Reminders card as, for example, "Reminders.
        Next reminder: Weekly scan, Sunday at 7:00 PM, button", with "Opens
        your reminder settings".
12. [ ] **Largest font.** Set Font size to the largest and look at the
        bottom bar and Home.
        Pass: "Home" and "Progress" aren't cut off (they may shrink a
        little to fit their buttons), and the buttons stay side by side; on
        the teal panel, the change pill moves under the score if it doesn't
        fit beside it, and Scan my skin stays one wide button; the routine
        tiles' text wraps inside them; the Reminders card's time wraps
        without overlapping "Change". Set the font size back afterwards.

## Bottom buttons and reminders check (8 minutes)

Run this once on any build that changes the bottom buttons or the Reminders
card on Home. It needs an account with at least one scan and notifications
allowed, so run it after section 7. Like the checks below, it sits apart from
the numbered sections so their step numbers don't move.

1. [ ] **Press and hold Progress, then let go.**
       Pass: while held, the button darkens a little and dips very slightly,
       like a key going down; on letting go it comes straight back up, with
       no wobble, a light tap of vibration, and Progress opens. Nothing
       glows, and there's no heavy shadow. Pressing the button that's
       already open gives the same small tap and stays where you are.
2. [ ] **Turn on Settings → Accessibility → Remove animations** (on some
       phones: Color and motion → Remove animations), then press each
       button and open the Reminders card.
       Pass: the buttons still darken while pressed but don't dip, and the
       Reminders sheet fades in (or simply appears) instead of sliding up.
       Turn Remove animations off again afterwards.
3. [ ] **Find the Reminders card on Home,** under "Today's routine".
       Pass: a white card with a coral bell, "Next reminder" with a pale
       coral **Change** beside it, then the reminder's day and time large,
       such as "Sunday at 7:00 PM", and what it's for under that, such as
       "Weekly scan". The reminder named is the one due soonest of those
       switched on in Settings → Reminders, at the day and time set there.
       The disclaimer is still at the bottom of Home.
4. [ ] **Tap the card.**
       Pass: a sheet slides up with rounded top corners and a grab bar,
       titled "Reminders", with exactly the controls of Settings →
       Reminders: Allow reminders with "At most one reminder a day…" under
       it, then the weekly scan reminder with its day and time, the daily
       routine reminder and the streak reminder, each in its own soft grey
       panel, with no lines between them. The seven days sit in one even row
       (no day wraps onto a second line), and each time shows large, such
       as "7:00 PM", on a pale coral pill with a clock and an arrow, beside
       the word Time. Long content scrolls inside the sheet, and **Done**
       stays at the bottom.
5. [ ] **In the sheet, turn off the streak reminder, set the daily routine
       reminder to Off (if it's available), pick another day for the weekly
       reminder, then tap its time, pick an hour two hours later and tap
       Save. Tap Done.**
       Pass: the sheet closes and the card shows the new day, two hours
       later than before, with "Weekly scan" under it: the day's name, or
       its date when it's more than six days away. It's always at least a week after your
       last scan, so it may be the week after next. Open Settings →
       Reminders: the same day and time are set there.
6. [ ] **Morning, then evening.** In the sheet, set the daily routine
       reminder to Morning; the time picker opens straight away. Pick a time
       and Save, tap Done, then do the same with Evening.
       Pass: after Save, the chosen routine's time shows under the choice,
       at exactly the time you picked. With Morning, the card says "Today
       at …" if that time is still to come today, or "Tomorrow at …" if it
       has passed, with "Morning routine" under it; the same with Evening.
       Two things can change the day, and both are expected: a reminder
       already arrived today (there's at most one a day), or a weekly scan
       or streak reminder is due first and takes the routine reminder's
       place. Set it back to what you had afterwards.
7. [ ] **In the sheet, turn off Allow reminders and tap Done.**
       Pass: the card says "Reminders are off", with "Turn on" beside
       "Reminders".
8. [ ] **Tap the card.**
       Pass: reminders turn back on and the sheet opens with Allow
       reminders on. Tap Done: the card shows the next reminder again.
9. [ ] **Switch everything off but the master switch:** in the sheet,
       turn off the weekly scan reminder, and check the streak reminder is
       off and the routine reminder is Off. Tap Done.
       Pass: the card says "No reminders coming up" and suggests choosing
       one. Turn the weekly scan and streak reminders back on afterwards.
10. [ ] **Refused notifications.** In the phone's Settings → Apps →
        GlowTrack → Notifications, turn notifications off, and switch back
        to GlowTrack.
        Pass: the card says "Reminders are off" with "Turn on". Tapping it
        opens the sheet with "Reminders are off. You can turn them on in your
        phone settings." and **Open settings**, which opens GlowTrack's page
        in the phone's settings. Turn notifications back on there and switch
        back: the card shows the next reminder again.
11. [ ] **Optional, not asked yet** (a fresh install, after the first
        scan, with "A weekly nudge?" answered Not now).
        Pass: the card says "Reminders are off" with "Turn on". Tapping it
        opens the sheet with the explanation "We can remind you once a
        week…" and **Turn on reminders**. Tap it and allow notifications in
        the system dialog: the sheet stays open and shows the reminder
        controls, and after Done the card shows the next reminder.
12. [ ] **Close the sheet three ways:** Done, a tap on the dimmed area
        above it, and Android's back button.
        Pass: each closes the sheet and stays on Home. Back with the sheet
        closed still leaves the app, as before.
13. [ ] **Dark theme.** Turn on Dark theme and look at the bottom bar, the
        card, the sheet and the time picker.
        Pass: the open button is bright mint with dark text and a solid dark
        icon, the other a dark pill a step lighter than the screen, with
        mint text and an outlined mint icon and no outline. The time picker
        is a dark box with the time in bright mint, the hours and minutes on
        darker cells, and the chosen ones filled mint. The card is a raised
        dark card with a coral bell and a deep rosewood "Change", and the
        sheet is dark with every word readable; each time sits on a deep
        rosewood pill.

## Reminder times check (8 minutes)

Run this once on any build that changes how reminder times are shown or
set. Same account as the check above: at least one scan and notifications
allowed. Morning and evening routine reminders come at whatever time you
pick, to the minute; the weekly scan reminder stays on the hour.

1. [ ] **Open Settings (the round profile button at the top right of
       Home) → Reminders.**
       Pass: the weekly time and, with Morning or Evening chosen, the
       routine time each read cleanly, such as "7:00 PM" and "7:45 AM":
       hours and minutes, then AM or PM in capitals, with no seconds and
       no odd gaps. On a phone set to a language that uses a 24-hour
       clock, they read "19:00" and "07:45" instead. The daily routine
       reminder isn't locked once you've had a scan.
2. [ ] **Set the daily routine reminder to Off, then tap Morning.**
       Pass: Morning isn't chosen yet; a box opens over the screen titled
       "Morning routine reminder", with the time large at the top between a
       − and a + button, an AM / PM switch, "Hour" with 12 and 1 to 11,
       "Minutes" with :00 to :55 in fives, and Cancel and Save. The first
       time it starts at 8:00 AM, only as a starting point. (On a 24-hour
       phone there's no AM / PM switch, and all 24 hours show.)
3. [ ] **Tap Cancel.**
       Pass: the box closes and the reminder is still Off. A tap on the
       dimmed area or Android's back button cancels the same way.
4. [ ] **Tap Morning again. Tap 6, then :30, then + three times, then Save.**
       Pass: the large time goes 6:30, 6:31, 6:32, 6:33 AM while picking.
       After Save, Morning is chosen and its time pill shows 6:33 AM. Home's
       Reminders card says "… at 6:33 AM" with "Morning routine" under it
       (unless a weekly scan or streak reminder takes that day).
5. [ ] **Tap the 6:33 AM pill, tap − until it reads 6:28 AM, and Save.**
       Pass: − rolls back across :30 into :29 and :28; the pill shows
       6:28 AM. Tap it again, tap PM, and Cancel: still 6:28 AM.
6. [ ] **Tap Evening.**
       Pass: the picker opens for "Evening routine reminder", starting at
       8:00 PM (or the evening time you set before). Pick 9:50 PM and Save:
       Evening is chosen at 9:50 PM. Tap Morning: the picker opens at
       6:28 AM, its own time; Cancel leaves Evening chosen.
7. [ ] **The weekly scan reminder's time.** Tap it.
       Pass: the same box, but hours only: no − and + buttons and no
       Minutes. Its time stays on the hour.
8. [ ] **From Home.** Tap the Reminders card, then change the routine time
       there the same way.
       Pass: the same picker opens over the sheet, and after Save the sheet
       shows the new time. Tap Done: Settings → Reminders shows it too.
9. [ ] **Close the app completely and open it again.**
       Pass: the morning and evening times you chose are still set, to the
       minute, and the Reminders card still names them.
10. [ ] **Optional, the real thing.** Set the routine reminder to two or
        three minutes from now and lock the phone.
        Pass: the notification arrives at that minute, unless that day
        already had a reminder (at most one a day). Set your usual time back
        afterwards.
11. [ ] **Largest font.** Set Font size to the largest and open
        Settings → Reminders and the picker.
        Pass: the day row stays on one line (the day names may shrink a
        little), each time pill stays whole beside "Time", the large time and the
        minutes shrink to fit rather than being cut off, and the picker
        scrolls if it's taller than the screen, with Cancel and Save always
        visible.

## After-scan reminders check (6 minutes)

Run this once on any build that changes the reminders question after a
scan. It needs a scan you can take (a subscription, or a fresh account's
free scan). The question only comes while no daily routine reminder is set,
and only until it's answered: **Not now** (or Back) means it isn't asked
again, and Settings and Home's Reminders card can always set one later.

1. [ ] **Get ready.** In Settings → Reminders, set the daily routine reminder
       to Off. If you've already answered the question with Not now on this
       phone, it won't come back: sign out and in with another account, or
       reinstall, to see it again.
2. [ ] **Take a scan and, on the results, tap the main button (or Close).**
       Pass: "Do you want daily reminders?" appears before the next screen,
       with a coral bell badge, a line about a nudge once a day at a time
       you pick, "At most one notification a day…", **Yes, set my time** and
       **Not now**. Every word reads warmly and is about routine and care.
3. [ ] **Tap Yes, set my time.**
       Pass: "When suits you?" with a white panel holding Morning / Evening
       (the one for the time of day it is now already chosen) and the time
       on a pale coral pill beside "Time", plus **Save my reminder** and
       **Not now**.
4. [ ] **Choose Evening, tap the time pill, pick 9:15 PM and Save. Then tap
       Save my reminder.**
       Pass: the pill shows 9:15 PM after the picker. Save my reminder goes
       on to the screen you were heading for (Home, routine or progress).
       Home's Reminders card says "… at 9:15 PM" with "Evening routine"
       under it (unless a weekly scan or streak reminder takes that day),
       and Settings → Reminders shows Evening at 9:15 PM.
5. [ ] **Take another scan and leave the results.**
       Pass: no reminders question: a daily reminder is already set.
6. [ ] **Not now.** Set the routine reminder to Off again, sign in with an
       account (or a fresh install) that hasn't answered yet, take a scan,
       leave the results and tap Not now.
       Pass: the next screen opens and nothing is scheduled for the
       routine. Take another scan: the question doesn't come again. The
       routine tab's "Want a daily nudge?" card doesn't appear either.
7. [ ] **Back.** On a fresh answer, press Android's back button on the
       question.
       Pass: it's treated as Not now.
8. [ ] **First scan on a fresh install.** Answer Yes, pick a time and Save my
       reminder.
       Pass: the system's notification prompt appears after Save my
       reminder, not before. Allow: you carry on, and the Reminders card
       shows your routine reminder (or the weekly scan reminder, if that's
       due first). Refuse instead: "Your time is saved" with **Continue**
       and **Open settings**; after allowing notifications in the phone's
       settings, the time you picked is used.
9. [ ] **Dark theme and largest font.** Repeat steps 2 and 3.
       Pass: every word is readable; the panel is a raised dark card and
       the time pill a deep rosewood with light text; nothing is cut off,
       and the screen scrolls if needed with the buttons reachable.

## Premium preview check (test builds only, 8 minutes)

Only on a **preview** build whose update was published with
`EXPO_PUBLIC_ENABLE_PREMIUM_PREVIEW=true` and
`EXPO_PUBLIC_PREVIEW_BYPASS_TOKEN` in the EAS `preview` environment, with the
same key set as the analyze-scan function's `PREVIEW_BYPASS_TOKEN` secret
and the function deployed (docs/ota-updates.md, "Testing premium on the
preview build"). It needs an account whose free scan is used, without a
subscription. Never on a production or Play Store build: there, step 1 must
find no Testing section.

1. [ ] **Open Settings and scroll down.**
       Pass: a **Testing** section with a teal gear badge, saying it's only
       in test builds, a **Preview premium** switch (off), and a note that
       this test build also asks the server for results on scans after your
       free one. (A build published without the key says "This test build
       has no preview key" instead.) On a production or Play Store build
       there's no Testing section at all.
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
       usual waiting screen runs and "Your results" appears with real scores,
       as for any scan. The new scan is in Progress → Scan history.
6. [ ] **Take one more scan the same way.**
       Pass: it gets results too: scans 2, 3 and on all work while the switch
       is on. In the analyze-scan logs, each shows
       `outcome: "preview_bypass"`.
7. [ ] **Settings → Subscription.**
       Pass: still "No active subscription": the preview isn't a
       subscription.
8. [ ] **Turn Preview premium off, then tap Scan my skin.**
       Pass: Progress is locked again and Scan my skin opens the plans. With
       the switch off, the app sends no key, so the server would turn a scan
       down as before.
9. [ ] **Optional, the server's off switch.** Unset the secret, as in
       ota-updates.md, "Switch it off, or change the key", then turn Preview
       premium on and take a scan.
       Pass: "This scan needs a subscription", with a note that the server
       didn't accept this test build's preview key, and the plans open. The
       logs show `token_off`. Set the secret again afterwards (ota-updates.md,
       step 3).

## Look and feel check (10 minutes)

Run this once on any build that changes the app's look, such as the
light and dark palettes, the Appearance setting, or the supporting colours
(sun yellow, coral, apricot peach and dusk blue) beside the launcher icon's
teal and mint. It needs an account with at least two scans and a routine,
so run it after section 8 and before section 9 wipes the account. It sits
apart from the numbered sections so their step numbers don't move.

**Before you start:** on the phone, open Settings → Display, and note how
to change **Font size** and **Dark theme**. Start on the default font size.
In GlowTrack, open Settings (the round button at the top of Home) →
**Appearance** and choose **Light**, whatever the phone is set to.

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
3. [ ] **Home, as it first opens.**
       Pass: the screen is a clean, barely-grey white (no cream anywhere),
       with today's date over a greeting ("Good morning", "Good afternoon"
       or "Good evening") instead of a "Home" title. On most phones
       everything down to the Reminders card shows without scrolling, and
       colour shows only where it means something:
   - the **teal panel** (the icon's teal) holds the latest overall score
     large in white, with "Overall score · " and the scan's day above it
     and "See results ›"; a **bright apricot pill** beside the score says
     how it moved since the scan before, with an arrow ("Up 4 since last
     scan"); a **mint meter** under it shows where the score sits out of
     100; then the journey since the first scan, a **white Scan my skin
     pill** with a camera, and when the next scan is suggested. Tapping
     the score opens that scan's results;
   - Today's routine is two tiles side by side: a **sun-yellow Morning**
     and a **dusk-blue Evening** (a calm twilight blue with a moon), each
     with a matching badge, its count and a **teal** progress bar;
   - Reminders is a **white** card with a **coral** bell, the next
     reminder's day and time large, and a pale coral "Change".

   Colour is flat: no purple, no gradients, no glass effects, nothing
   glows. At the bottom, the open button (Home) is a teal pill and Progress
   a white pill with a soft shadow. Main buttons are teal pills with white
   text. Every word is easy to read.
   - **No scans yet** (a fresh account): the teal panel shows the sun mark
     in sun yellow over mint arcs, "Your first scan" and Scan my skin, with
     nothing under it.

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
       nothing looks red or alarming. The seven scores sit on a white card,
       "What stands out" is one white card with a mint dot before each
       point, "Where to focus" on a sun-yellow panel, and "Since your last
       scan" on a white card. The full disclaimer, with its info icon, is
       visible without scrolling past anything collapsed.
7. [ ] **Share.**
       Pass: the preview is a light mint card with the sun mark beside
       "GlowTrack". The shared image looks the same as the preview.
8. [ ] **Progress and compare.**
       Pass: the latest score's ring sits on an apricot card beside "Up …
       points in … weeks", on one row, so "Over time" (or the locked "Your
       trend and comparisons") starts on the first screen: a white card with
       a teal chart line and points, its score chips scrolling out at the
       card's edge. "Before and after" is on a white card with a teal badge,
       and the weekly streak on a sun-yellow card. In the history, each
       change is a small pill with an arrow and words: mint for "Up 4",
       quiet grey for "Down 1". History thumbnails show (or show a mint
       placeholder). On the "Before and after" screen, there
       is no coloured strip down the left edge of the screen.
9. [ ] **Routine pictures.** Open Morning, then Evening.
       Pass:
   - every step shows a drawing between its tick box and its text, and
     still shows its title and its one-line reason;
   - at the top, a white card with the teal ring ("2/7") beside "2 of 7
     done today" and the line about consistency;
   - Morning is a sun-yellow card and Evening a dusk-blue one, each with a
     matching badge, and ticked boxes filled **teal** in both;
   - each kind of step is drawn in one of three colours on a tile of the
     same soft colour: sunscreen and face oil yellow; serum, eye cream,
     lip balm and makeup remover coral; cleanser, toner and moisturiser
     mint. No two steps next to each other in a usual morning share a
     colour;
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
        Pass: each section is a white card with a badge beside its title:
        Subscription yellow, Reminders coral, and Account, Appearance, Your
        data and About teal on mint. **Appearance** is second, under
        Account, with three choices in one row: System (a phone), Light (a
        sun) and Dark (a moon), the chosen one filled teal, and a line under
        them saying what it does. Switches are teal when on. Sign out,
        Manage subscription, Download my data, Delete all my scan photos and
        Contact support are rows with a teal name, a line saying what they
        do and an arrow, not big outlined buttons. **Delete my account** is
        the same kind of row in deep pink-red, clearly different from the
        teal ones, and opens its own screen to confirm. Reminders are in
        soft grey panels inside their card, one for each reminder.
13. [ ] **Error and empty states.** Look back at the offline screens in
        section 8, and at the Progress tab after 9.9.
        Pass: a full-screen error shows a quiet grey badge and an outlined
        Try again, never red. "No scans yet" on Progress shows the sun mark
        above it; on Home, the teal panel shows it.
14. [ ] **Dark look.** In GlowTrack's Settings → Appearance choose
        **Dark**, and repeat 3, 6, 9 and 11 quickly.
        Pass: the whole app turns dark at once, without restarting.
        Backgrounds are a deep spruce ink and cards a clear step lighter.
        Home's panel stays the icon's **deep teal** (not mint) with white
        text, the apricot pill and the mint meter, and Scan my skin is a
        pale mint-white pill with dark teal text. The open bottom button and
        main buttons are bright mint with dark text. Coloured cards and
        tiles turn rich and deep (terracotta for the apricot latest score,
        amber gold for the morning, rosewood for coral, navy for dusk, deep
        teal for mint) with their colours bright on top, and are still told
        apart; the morning tile is warm gold, not olive. Every word is readable, and the routine drawings
        show clearly on their dark tiles.
15. [ ] **Appearance follows the choice, not the phone.**
        Pass for each:
    - with the phone in **Dark theme**, choose **Light** in GlowTrack:
      GlowTrack is light everywhere (status bar icons dark) while other
      apps stay dark. Close GlowTrack fully and reopen it: it opens light
      straight away, with no dark flash first;
    - with the phone in **light** mode, choose **Dark**: the same, the
      other way round;
    - choose **System**, then turn the phone's Dark theme on and off from
      quick settings: GlowTrack follows the phone each time, and the line
      under the choices says it matches your phone's setting;
    - with TalkBack on, the three choices read as radio buttons, the first
      as "System, matches your phone's setting".
16. [ ] **Largest font.** Set Font size to the largest, and repeat 3, 6, 9,
        11 and 12.
        Pass: no text is cut off or overlaps. A long button label, such as
        "Delete all my scan photos", wraps onto two lines inside its button
        instead of ending in "…". Routine text wraps beside its drawing.
17. [ ] **Smallest font.** Set Font size to the smallest and look at Home and
        Routine.
        Pass: text is small but every button and tick box is still a large,
        easy target. Set the font size back afterwards.

## After the run

- **If every box is ticked,** the build passes.
- **If anything failed,** file it with its step number and screenshot before
  the build ships.
- **For the developer, after 9.8:** run the SQL check in README → Privacy
  controls, using the deleted user's id. Every count should be 0.
