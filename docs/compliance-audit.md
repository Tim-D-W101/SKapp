# GlowTrack compliance audit

**Date:** 2026-09-29
**Code audited:** branch `claude/clever-turing-1wol88` at `b24bee1` (Phases 1–12.2)
**Status:** reviewed on 2026-09-29. All six decisions were approved and
applied. See [Resolution](#resolution) at the end. Line numbers in the
findings refer to the audited commit.

Banned words are written with a middle dot in this report (for example
"me·dical"), so the report itself doesn't show up in the next search for them.

## Summary

| #   | Category                                  | Findings                     | Plan target |
| --- | ----------------------------------------- | ---------------------------- | ----------- |
| 1   | Banned vocabulary                         | 5 (all in the server prompt) | 0           |
| 2   | Accuracy claims                           | 0                            | 0           |
| 3   | Hardcoded user-facing strings             | 3 (config and server)        | —           |
| 4   | Hardcoded colours, spacing and font sizes | 1 (`app.json`)               | —           |
| 5   | Secrets                                   | 0                            | 0           |
| 6   | Missing disclaimers                       | 0                            | 0           |
| 7   | Permissions the app doesn't use           | 4, plus 2 to confirm         | —           |

**What the app shows is clean.** Every banned word the audit found is in the
instructions the Edge Function sends to the model. Users never see those
instructions. The one real gap is in the automatic check on the
model's output (finding 1.5).

### How the audit was run

- **Scope.** Every tracked file except `docs/reference/` (the planning
  documents) and `package-lock.json`. For secrets, the scope was also every
  commit on every branch (`git log -p --all`).
- **Banned words.** The word list is the one in the P12.3 prompt, which also
  includes the plain word "dermato·logist". Matching was case-insensitive, on
  whole words and their inflected forms.
- **Code and permissions.** Each hit was then read in context. Permissions
  were taken from:
  - an `expo prebuild` of the current `app.json`;
  - the Android manifests of every native library in `node_modules`.

## 1. Banned vocabulary

Nothing in `src/constants/copy.ts`, any component, `app.json`, `README.md`,
the privacy policy or the terms uses a banned word. There is no store copy
yet; it comes in P14.3.

| #   | File                                        | Line  | Issue                                                                                                                                                                                                                                                                                                                          | Suggested fix                                                                                                                                                        |
| --- | ------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | `supabase/functions/analyze-scan/prompt.ts` | 182   | The model's role statement ends "This is a beauty tool, not a me·dical one."                                                                                                                                                                                                                                                   | "This is a beauty tool. It only ever talks about how skin looks."                                                                                                    |
| 1.2 | `supabase/functions/analyze-scan/prompt.ts` | 186   | Rule 1 is "Never diag·nose. Never name any me·dical con·dition, dis·ease or dis·order."                                                                                                                                                                                                                                        | "1. Never identify, name or rule out any skin problem, and never guess at what might be behind how the skin looks."                                                  |
| 1.3 | `supabase/functions/analyze-scan/prompt.ts` | 187   | Rule 2 is "Never mention or evaluate any trea·tment, medication or procedure."                                                                                                                                                                                                                                                 | "2. Never mention or evaluate any medication, procedure or professional service."                                                                                    |
| 1.4 | `supabase/functions/analyze-scan/prompt.ts` | 59–84 | `BANNED_TERMS` is the banned list itself. It has two jobs:<br>• line 260 puts it in the prompt as the words the model must never write;<br>• `compliance.ts` uses it to reject any reply that contains one.<br>It has to contain the words to work.                                                                            | **Keep, as a documented exception.** It is the mechanism that enforces the rule. Add a line to CLAUDE.md §3 naming this file as the only allowed place for the list. |
| 1.5 | `supabase/functions/analyze-scan/prompt.ts` | 82    | The list has "dermato·logist-grade" but not the plain "dermato·logist", which the P12.3 list includes. The output check matches the full term, so a reply saying "see a dermato·logist" would pass it.<br>Today, rule 6 asks the model to use the `refer_to_professional` flag instead of writing that, but nothing checks it. | Add `'dermato·logist'` (without the dot) to `BANNED_TERMS`. The existing prefix matching then catches the plural and the "-grade" phrase as well.                    |

**Changing the prompt has a cost.** Fixes 1.1–1.3 and 1.5 all change
`prompt.ts`, so they need three follow-up steps:

1. `PROMPT_VERSION` goes from `v2.0.0` to `v2.1.0`. The file's own rule
   requires a bump for any change, and each scan row records the version it
   was scored with.
2. Re-run calibration (`npm run calibrate`) and compare the results with
   v2.0.0. I can't run this from here: it needs your `GEMINI_API_KEY` and the
   calibration photos.
3. Redeploy `analyze-scan`.

**Not findings:**

- **`CLAUDE.md` lines 35–50** are the rule itself, which developers read.
  Users never see them.
- **The commit message of `63e8e08`** ("docs: add CLAUDE.md project guide")
  names Google Play's "Me·dical" category. It's in history and can only be
  changed by rewriting history, so leave it.

## 2. Accuracy claims

**No findings.** The searches covered:

- the words "accurate", "precise", "proven", "scientifically" and
  "clini·cally", and "guarantee", "certified", "expert" and "study";
- every percentage;
- every mention of a doctor or a professional.

None of them turned up a claim. Each match is listed below with the reason it
passes.

| File                                        | Line         | Text                                                                                | Why it passes                                                                                                                         |
| ------------------------------------------- | ------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/constants/copy.ts`                     | 431          | "Showing N% before, M% after"                                                       | This is the comparison slider's position, read out by screen readers. It isn't a measurement.                                         |
| `src/constants/copy.ts`                     | 529          | "Best value, save N% vs weekly"                                                     | A price comparison, worked out from live Google Play prices (`src/lib/purchases.ts` 213). It stays accurate as long as it's computed. |
| `src/constants/copy.ts`                     | 65, 708      | "…not professional skincare advice."                                                | A disclaimer. It says what the app is _not_.                                                                                          |
| `src/constants/copy.ts`                     | 710–714      | The full disclaimer, and the referral card                                          | These point people to a qualified professional. They don't compare the app with one.                                                  |
| `docs/terms-of-service.md`                  | 15–16, 34–38 | "not advice from a doctor…", "not a substitute for seeing a qualified professional" | Disclaimers again, for the same reason.                                                                                               |
| `docs/privacy-policy.md`                    | 110          | "Records from any doctor or other professional."                                    | Part of the list of things the app does _not_ collect.                                                                                |
| `supabase/functions/analyze-scan/prompt.ts` | 83, 168      | "me·dically proven", "guarantee"                                                    | Entries in the detector lists (see 1.4). The model is forbidden from writing them.                                                    |
| `supabase/functions/analyze-scan/prompt.ts` | 191          | "…appears to warrant professional attention…"                                       | Tells the model when to set the referral flag. Users never see it.                                                                    |
| `src/lib/jpegLuminance.ts`                  | 97–105       | `precision`                                                                         | The name of a field in the JPEG file format.                                                                                          |

## 3. Hardcoded user-facing strings

Every string in `app/` and `src/components/` comes from `copy.ts`: JSX text,
labels, hints, titles, placeholders and alerts alike. Every error message
shown on screen goes through `toUserMessage()` or a `copy.errors` entry.

| #   | File                                        | Line    | Issue                                                                                                                                                                                                                                                | Suggested fix                                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | `app.json`                                  | 3       | `"name": "GlowTrack"`, the name under the app icon. A config file can't import `copy.ts`.                                                                                                                                                            | **Accept as an exception.** It already matches `copy.share.cardBrand` (`copy.ts` 343).                                                                                                                                                                                                                                                        |
| 3.2 | `app.json`                                  | 16      | `cameraPermission`: "GlowTrack uses your camera to take your scan photo." Only iOS shows it, in the system camera prompt. Android's prompt shows no custom text. This line and the in-app explanation (`copy.ts` 211) say slightly different things. | **Accept as an exception.** Before the iOS build, align it with `copy.scan.permission.body`, e.g. "GlowTrack uses your camera to take your scan photo. Photos are never saved to your gallery."                                                                                                                                               |
| 3.3 | `supabase/functions/analyze-scan/prompt.ts` | 175–179 | `SUNSCREEN_STEP` is an English title and "why" line. The server adds it to the morning routine when the model leaves sunscreen out, and it's shown on the Routine tab.                                                                               | **Recommended: accept as an exception.** Every other routine title and "why" line is also English text from the server (written by the model), so this matches them. The alternative is for the server to send only the `sunscreen` key, and for the app to show text from `copy.ts`. That's an app change plus a prompt change for one line. |

**Not findings:**

- **Model-written text** (the one-line summary, the observations and the
  routine) is shown to users by design, and can't live in `copy.ts`.
  `compliance.ts` checks it before it's saved: banned words, instructions,
  how often to do something, promises, ingredients and numbers.
- **`new Error('…')` messages** in these places are for developers only and
  never reach the screen:
  - `src/stores/useAuthStore.ts` 113, 141 and 196;
  - `src/lib/personalData.ts` 123;
  - `src/lib/shareImage.ts` 17;
  - `src/lib/purchases.ts` 92;
  - `src/lib/scan.ts` 142.
- **`app/dev-gallery.tsx`.** Its strings are all in `copy.devGallery`. But
  its own comment (line 30) says "Delete this route before release". The
  button to it is hidden outside development, yet the route still ships and
  can be opened by link (`glowtrack://dev-gallery`). **Suggested:** delete the
  route, its Home-tab button and `copy.devGallery` before the first store
  build.

## 4. Hardcoded colours, spacing and font sizes

`app/` and `src/` (outside `src/theme/tokens.ts`) have no hex or `rgb()`
colours, and no literal font sizes, font weights, spacing, radii or opacity.
The only style numbers are `0` offsets.

| #   | File       | Line | Issue                                                                                                                               | Suggested fix                                                                                                                                                             |
| --- | ---------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | `app.json` | 31   | `android.adaptiveIcon.backgroundColor` is `"#E6F4FE"`, the light blue from Expo's template. A config file can't import `tokens.ts`. | **Accept as an exception.** Replace it with the brand colour from `tokens.ts` when the final icon is made in Phase 14, and note in `tokens.ts` that `app.json` copies it. |

**Not findings:** these numbers aren't styling.

- `src/constants/share.ts` lines 3–4 hold the pixel sizes of the share
  images, as named constants.
- `src/lib/capture.ts` line 117 shrinks the photo to 8×8 to measure the
  light. That's image processing.
- `src/components/ui/Icon.tsx` lines 66–107 are drawing coordinates inside
  the icons' 24-unit grid.

## 5. Secrets

**No findings.**

- **Key patterns, current files and every commit on every branch:** no match
  for any of these:
  - `AIza…` (Google);
  - `sk-…`, `sk_live_…` and `sk_test_…`;
  - `eyJ…` (JWTs, which includes Supabase keys);
  - `sntrys_` (Sentry tokens);
  - `phc_` (PostHog keys);
  - `goog_` (RevenueCat's Google key);
  - `-----BEGIN` (private keys).
- **Env files:** the only one ever committed is `.env.example`, and its
  values are empty. `.gitignore` covers `.env` and `.env.*`, including
  `supabase/functions/.env`, as `git check-ignore` confirms.
- **`service_role`** only appears in three places:
  - migration grants and policies for the server role;
  - `supabase/functions/analyze-scan/index.ts` line 75, which reads
    `SUPABASE_SERVICE_ROLE_KEY` from the function's secrets;
  - setup docs.

  No key value appears anywhere.

- **Server secrets:** `GEMINI_API_KEY` and `REVENUECAT_SECRET_KEY` are only
  read in two places:
  - `supabase/functions/analyze-scan/index.ts` lines 71–72, from the
    function's secrets;
  - `scripts/calibrate.ts` line 392, a local developer script. It reads the
    git-ignored `supabase/functions/.env` and never goes into the app.
- **App code** only reads `EXPO_PUBLIC_*` variables, and always by name
  (never by building the name at runtime):

  | Variables                                                                       | Where                       |
  | ------------------------------------------------------------------------------- | --------------------------- |
  | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`                     | `src/lib/supabase.ts`       |
  | `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`                                            | `src/lib/purchases.ts`      |
  | `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`                           | `src/lib/analytics.ts`      |
  | `EXPO_PUBLIC_SENTRY_DSN`                                                        | `src/lib/crashReporting.ts` |
  | `EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_SUPPORT_EMAIL` | `src/constants/links.ts`    |

  All of these are meant to be public.

- **Row-level security** is on for all five tables (`profiles`, `scans`,
  `scan_results`, `routines`, `routine_logs`), at
  `supabase/migrations/0001_initial_schema.sql` lines 178–182.

## 6. Missing disclaimers

**No findings.** Every screen that shows a score also shows the disclaimer,
and so does every image the app exports.

| Screen                  | Route                                      | Disclaimer                                                                                           |
| ----------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Scan result             | `app/scan/result.tsx` → `ResultView`       | Full, `src/components/scan/ResultView.tsx` 153                                                       |
| A past scan             | `app/progress/[scanId].tsx` → `ResultView` | Full, same component                                                                                 |
| Progress tab            | `app/(tabs)/progress.tsx`                  | `src/components/progress/ProgressScreen.tsx` 121                                                     |
| Before and after        | `app/progress/compare.tsx`                 | `src/components/progress/CompareScreen.tsx` 151                                                      |
| Share                   | `app/scan/share.tsx`                       | On screen at `src/components/scan/ShareScreen.tsx` 203. In the exported image at `ShareCard.tsx` 121 |
| Before-and-after image  | exported from Compare                      | In the image, `src/components/progress/CompareCard.tsx` 123                                          |
| Routine tab (no scores) | `app/(tabs)/routine.tsx`                   | `src/components/routine/RoutineScreen.tsx` 130, because the routine comes from a scan                |
| Settings, About         | `app/(tabs)/settings.tsx`                  | Full, `src/components/settings/AboutSection.tsx` 45                                                  |
| Dev gallery             | `app/dev-gallery.tsx`                      | 137, 183 and 184                                                                                     |

**Screens with no scores:** Home, the paywall, onboarding, sign-in, the
camera, confirm, analysing and reminders. Reminder notifications don't
include scores either (`copy.ts` 470–494).

## 7. Permissions

The only permission `app.json` asks for itself is the camera, through the
`expo-camera` plugin, with the microphone and audio recording turned off.
Everything else comes from elsewhere. `app.json` doesn't set
`android.permissions` or `android.blockedPermissions`, so the built app also
declares:

- Expo's template defaults;
- every permission in the manifests of the native libraries it uses.

Four of these the app never uses:

| #   | Permission                                                     | Comes from                        | Used?  | Issue                                                                                                                                                                                                                  |
| --- | -------------------------------------------------------------- | --------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 | `android.permission.ACTIVITY_RECOGNITION`                      | `expo-sensors`                    | **No** | The steadiness check uses only the accelerometer (`src/components/scan/useCaptureChecks.ts` 2), which needs no permission. This permission is for step counting. Google Play lists it to users as "Physical activity". |
| 7.2 | `android.permission.READ_EXTERNAL_STORAGE` (up to Android 12)  | Expo template, `expo-file-system` | **No** | The app never reads shared storage. Photos come straight from the camera. On older phones it shows as "Photos, media and files", which is a poor look for a face-photo app.                                            |
| 7.3 | `android.permission.WRITE_EXTERNAL_STORAGE` (up to Android 12) | Expo template, `expo-file-system` | **No** | The app never writes to shared storage. Scan photos stay in app storage. Share images and data exports go to the app's cache, and leave only through the share sheet.                                                  |
| 7.4 | `android.permission.SYSTEM_ALERT_WINDOW`                       | Expo template                     | **No** | The "Display over other apps" permission. Nothing in the app draws over other apps.                                                                                                                                    |

**Suggested fix for 7.1–7.4.** This changes `app.json`, so it needs your
go-ahead. Add this under `android`:

```json
"blockedPermissions": [
  "android.permission.ACTIVITY_RECOGNITION",
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.SYSTEM_ALERT_WINDOW"
]
```

Then check it in two ways:

- **After prebuild:** the manifest should mark each of the four as
  `tools:node="remove"`.
- **On a phone running Android 12 or older:** check that scanning, sharing an
  image and downloading your data all still work.

**To confirm from the first EAS build.** These come from libraries downloaded
at build time, so they can't be read from `node_modules`. Confirm them in the
merged manifest, or in Play Console → App bundle explorer → Permissions, then
decide:

- **`com.google.android.c2dm.permission.RECEIVE`**, from Firebase Messaging,
  which `expo-notifications` includes. It's for push messages. GlowTrack only
  schedules reminders on the phone, so this is likely unused, and can be
  blocked the same way.
- **Launcher badge permissions** (several vendor-specific ones), from
  ShortcutBadger, which `expo-notifications` includes. The app never sets an
  icon badge, so these are likely unused. They're harmless but add clutter,
  so block them or leave them.

**Used, and correct to declare:**

| Permission                         | What uses it                                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `CAMERA`                           | The scan                                                                                                                              |
| `INTERNET`, `ACCESS_NETWORK_STATE` | Everything online. The routine's offline queue listens for the connection coming back (`src/stores/useRoutineStore.ts` 1).            |
| `ACCESS_WIFI_STATE`                | Declared by `expo-network`. It's a normal permission that users never see. The app doesn't strictly need it. Low impact, so leave it. |
| `VIBRATE`                          | Haptics                                                                                                                               |
| `POST_NOTIFICATIONS`               | Reminders                                                                                                                             |
| `RECEIVE_BOOT_COMPLETED`           | Keeps scheduled reminders after the phone restarts                                                                                    |
| `WAKE_LOCK`                        | Declared by Firebase Messaging and notifications. A normal permission.                                                                |
| `com.android.vending.BILLING`      | Subscriptions, through RevenueCat                                                                                                     |

**Later, for iOS (Phase 15).** `expo-sensors` automatically adds an iOS
"motion" permission, with the default English text "Allow GlowTrack to access
your device motion". The accelerometer doesn't need that permission, and the
text isn't from `copy.ts`. Fix it by adding
`["expo-sensors", { "motionPermission": false }]` to the plugins in
`app.json`.

## Decisions for you

The `chore: compliance audit clean` commit contains only what you approve
here. Recommendations are in bold.

1. **Reword the prompt (1.1–1.3), and add the plain "dermato·logist" to the
   banned list (1.5).** This needs the prompt version bump and a calibration
   run you do with your key. **Recommended: yes.**
2. **Keep `BANNED_TERMS` as the one allowed home of the list (1.4).** This
   adds a sentence to CLAUDE.md §3. **Recommended: yes.**
3. **Block the four unused Android permissions in `app.json` (7.1–7.4).**
   **Recommended: yes.**
4. **Accept the `app.json` name, camera text and icon colour as config
   exceptions (3.1, 3.2, 4.1).** Their text and colour get updated in Phases
   14–15. **Recommended: yes.**
5. **Keep the sunscreen step's text on the server (3.3).** **Recommended:
   yes.**
6. **Delete the dev gallery before release**, either now or in Phase 14.
   **Recommended: in Phase 14, with the release build.**

With 1 and 2 approved, categories 1, 2, 5 and 6 show zero findings. The
detector list remains, as the documented exception.

## Resolution

All six decisions were approved on 2026-09-29 and applied in
`chore: compliance audit clean`.

| #   | Decision                                  | Outcome                                                                                                                                                                                                         |
| --- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Reword the prompt; add "dermato·logist"   | **Done.** Rules 1 and 2 and the role statement are reworded (`prompt.ts` 186, 190 and 191 now). The word is in `BANNED_TERMS`, and `PROMPT_VERSION` is `v2.1.0`: a minor bump, because rules and lists changed. |
| 2   | Keep `BANNED_TERMS` as the one exception  | **Done.** CLAUDE.md §3 names it, and so does the comment above the list.                                                                                                                                        |
| 3   | Block the four unused Android permissions | **Done.** `app.json` → `android.blockedPermissions`. After prebuild, the manifest marks all four `tools:node="remove"`, which also strips the copies the libraries declare.                                     |
| 4   | `app.json` name, camera text, icon colour | **Accepted as config exceptions.** The camera text is aligned with `copy.scan.permission.body` before the iOS build (Phase 15). The icon colour changes with the final icon (Phase 14).                         |
| 5   | Sunscreen step text on the server         | **Accepted.** No change.                                                                                                                                                                                        |
| 6   | Delete the dev gallery                    | **Scheduled for Phase 14.** The route, its Home-tab button and `copy.devGallery` are removed with the release build.                                                                                            |

### After the fixes

| #   | Category                                  | Open findings                                         | Plan target |
| --- | ----------------------------------------- | ----------------------------------------------------- | ----------- |
| 1   | Banned vocabulary                         | **0.** The detector list is the documented exception. | 0           |
| 2   | Accuracy claims                           | **0**                                                 | 0           |
| 3   | Hardcoded user-facing strings             | 0 (3 accepted exceptions)                             | —           |
| 4   | Hardcoded colours, spacing and font sizes | 0 (1 accepted exception)                              | —           |
| 5   | Secrets                                   | **0**                                                 | 0           |
| 6   | Missing disclaimers                       | **0**                                                 | 0           |
| 7   | Permissions the app doesn't use           | 0 (2 to confirm from the first EAS build)             | —           |

### How the fixes were checked

- **Banned-word search, repeated.** The only hits left are the rule itself
  in CLAUDE.md §3, and the entries of `BANNED_TERMS` (`prompt.ts` 63–87).
- **The whole system prompt, with the list block taken out**, contains no
  banned term. This was checked with the Edge Function's own matcher.
- **The output check** now catches "see a dermato·logist", the plural, and
  the "-grade" phrase.
- **The Edge Function:** `deno check` and `deno lint` pass, and all 46
  scenarios pass on `v2.1.0`.
- **The app:** `tsc` and ESLint pass.

### Still to do, outside the code

1. **Calibration.** Run `npm run calibrate` with the photo set, and compare
   the spread and scores with `v2.0.0` before trusting the new version.
2. **Deploy.** Deploy `analyze-scan`. Scans record `v2.1.0` from then on.
3. **Test on an older phone.** On one running Android 12 or older, check that
   scanning, sharing an image and downloading your data all still work.
4. **Check the first EAS build.** Look at its permission list for the two
   build-time items in section 7.
