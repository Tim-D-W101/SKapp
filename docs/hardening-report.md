# GlowTrack hardening pass (P13.1)

**Date:** 2026-09-30
**Scope:** every scenario in the P13.1 prompt. Each was traced through the code.
None has been run on a phone yet: the plan's Done-when needs each one
confirmed on a real device, and `docs/test-script.md` covers the ones a tester
can reproduce.

**Result:** three fixes, one known limitation, everything else already handled.

## Fixes

| #   | Scenario                                          | What was wrong                                                                                                                                                                                                                  | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Very slow connection; connection lost mid-request | React Native's `fetch` has no timeout. A stalled connection (a tunnel, a weak signal) never errors, so a request could hang for good. Onboarding's save was the worst case: its button spun and Back was disabled while saving. | **Every Supabase request now has a limit** (`src/lib/fetchTimeout.ts`, wired in `src/lib/supabase.ts`). The limits are 20 s, or 90 s for photo uploads and the analysis call. A request past its limit is abandoned and shows "This is taking too long. Check your connection and try again." Database requests that never got an answer used to show the generic message, and now show the offline or timeout message instead (`src/lib/errors.ts`). |
| 2   | Same scan submitted twice                         | A fast double-tap on "Use this" could start two uploads before the screen changed: two scans, two model calls. On the free scan, both could slip through before either finished.                                                | The confirm screen ignores a second tap (`src/components/scan/CaptureConfirm.tsx`). The server was already safe against the same scan being analysed twice.                                                                                                                                                                                                                                                                                           |
| 3   | Largest system font size                          | Text grew without limit. At the extreme settings some Android phones offer (up to 2×), fixed-size elements would overflow, for example the score inside a score ring.                                                           | Text and text fields scale up to 1.5× (`maxFontScale` in `src/theme/tokens.ts`). The usual "Largest" setting (about 1.3×) is honoured in full.                                                                                                                                                                                                                                                                                                        |

## Known limitation

**The app can't open with no connection, even for a returning user.**

- **What happens:** launch needs to confirm the account and read the profile.
  With no connection, a returning user sees "We couldn't get started. Check
  your connection and try again." and a Retry button. Nothing is lost or
  broken.
- **What it costs:** after a restart with no connection, the Routine tab can't
  be opened. Ticks made while the app stays open still queue on the phone and
  sync later.
- **What would fix it:** keep a copy of the profile on the phone, and start
  from the stored session and that copy when the server can't be reached. It
  touches the start-up path everything depends on, so it's worth its own change
  and a device test, rather than being folded into this pass. **Your call.**

## Already handled

### Network

| Scenario                                  | Behaviour                                                                                                                                                                                          |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Airplane mode on first launch             | Each start-up call gives up after 3 s. The start screen says to check the connection and offers Retry. Only one anonymous sign-in is ever in flight, so a retry can't create a second user.        |
| Connection lost mid-upload                | The upload fails with "Your photo didn't upload". Retry sends the same photo again. Nothing is left behind unless the app is killed at exactly the wrong moment (see Scan).                        |
| Connection lost while waiting for results | The app keeps checking the scan every 3 s, alongside Realtime, and picks up the result when the connection returns. After 30 s it says it's still working; after 60 s it offers Retry and Go back. |
| Very slow connection                      | Start-up calls give up after 3 s each, and every other request after its limit (fix 1). The waiting screen never strands anyone (see above).                                                       |
| Supabase unreachable entirely             | Same as airplane mode. For returning users, see the known limitation.                                                                                                                              |

### Auth

| Scenario                                    | Behaviour                                                                                                                                                                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session expired while backgrounded for days | The stored session refreshes on launch. If it can't (offline), the app offers Retry instead of creating a new user, so nothing the old user owns is stranded.                                              |
| Anonymous sign-in fails on first launch     | Retry screen, with the single-flight guard above.                                                                                                                                                          |
| Magic link opened on a different device     | The sign-in link only works with a code stored on the phone that asked for it. On another phone it fails with "Request a new one and open it on this phone."                                               |
| Account deleted server-side while open      | The next token refresh fails, the app notices it was signed out and starts over as a new user. Until then, reads come back empty and a new scan fails with an error message. Next launch also starts over. |

### Scan

| Scenario                                | Behaviour                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Camera permission denied, granted later | The permission check runs again every time the app comes back to the front, so the camera appears as soon as access is granted in Settings.                                                                                                                                                                                                                 |
| Camera permission permanently denied    | Explains why the camera is needed and opens the phone's Settings.                                                                                                                                                                                                                                                                                           |
| App backgrounded mid-capture            | The camera and the light and steadiness checks stop while the app is in the background and resume when it's back. A capture interrupted part-way shows "couldn't take the photo" and can be taken again.                                                                                                                                                    |
| App killed during upload                | **An orphan file can survive** if the app dies between the upload and saving the scan row. It sits in the user's private folder, is never shown, and is removed by "Delete all my scan photos" or account deletion. **An orphan row can survive** if the app dies right after saving it. It stays pending, is never shown, and never uses up the free scan. |
| Model returns malformed JSON            | The server retries once with a stricter instruction, then marks the scan failed. The app shows a message with Retry, and the free scan is kept.                                                                                                                                                                                                             |
| Model times out                         | The server gives up after 25 s and marks the scan failed, with the same outcome as above.                                                                                                                                                                                                                                                                   |
| Same scan submitted twice               | The server only ever analyses a scan once (atomic claim, then 409). The double-tap is now blocked too (fix 2).                                                                                                                                                                                                                                              |
| Storage quota exceeded                  | The upload fails with "Your photo didn't upload" and can be retried. Photos are resized to 1024 px, so each is a few hundred KB at most.                                                                                                                                                                                                                    |

### Subscription

| Scenario                                   | Behaviour                                                                                                                                                                                                                              |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purchase cancelled mid-flow                | "Purchase cancelled. Nothing was charged."                                                                                                                                                                                             |
| Purchase pending                           | Its own message: the purchase unlocks when the payment clears. RevenueCat's update listener unlocks it without a restart.                                                                                                              |
| Subscription expires while the app is open | The entitlement is checked again whenever the app comes back to the front. The server checks it on every scan regardless, so an expired subscription gets the plans, never a free analysis. Past results and comparisons stay visible. |
| Restore with no prior purchases            | "We couldn't find a subscription on this Google Play account."                                                                                                                                                                         |
| Play Store unavailable or signed out       | The paywall says subscriptions aren't available right now. The free scan still works.                                                                                                                                                  |

### Data

| Scenario                                   | Behaviour                                                                                                                                                                                          |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zero scans on every screen                 | Progress, Compare, Routine and the history all have empty states.                                                                                                                                  |
| Exactly one scan                           | Progress shows the score. The trend waits for a second scan. Compare says it needs two.                                                                                                            |
| 100 scans                                  | The history holds up to 500, and all thumbnail links are signed in one request. 100 rows render in one scrolling list: fine on a mid-range phone in theory. **Worth checking on a low-end phone.** |
| Very long strings from the model           | Routine titles are capped at 60 characters and reasons at 200. The one-line summary and the observations only appear on the scrolling results screen, where they wrap.                             |
| Scan row stuck in processing after a crash | History only lists finished results, so a stuck row is never shown and never uses up the free scan. A new scan works normally.                                                                     |

### Device

| Scenario                 | Behaviour                                                                                                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 360 dp wide screen       | Layouts are flexible and every text-heavy screen scrolls. The camera, confirm and waiting screens shrink the photo to fit. **Check on a device.**                                                                 |
| Largest system font size | Fix 3.                                                                                                                                                                                                            |
| Dark mode                | Every colour comes from the light and dark palettes in `tokens.ts`, and the audit found no stray colours. The status bar follows the theme; the camera forces light text over the preview. **Check each screen.** |
| Rotation while locked    | `app.json` locks the app to portrait.                                                                                                                                                                             |
| Low storage              | A failed photo save shows "couldn't take the photo". A failed data export shows its own error. The routine cache on the phone is best-effort, and its failures are logged, never fatal.                           |

## How the fixes were checked

- `tsc` and ESLint pass.
- **A new harness (6 groups) covers the timeout:**
  - the limit chosen for each kind of request;
  - a stalled request abandoned at its limit, with its options intact;
  - the caller's own cancel still working;
  - timers cleared after an answer or a failure;
  - the error messages;
  - two runs through the real Supabase client, with a stalled query and a
    stalled function call.
- **The earlier harnesses still pass:** auth, scan, progress, routine,
  reminders, analytics and Phase 12.
