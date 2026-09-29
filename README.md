# GlowTrack

A cosmetic skincare progress tracker. You photograph your face, get cosmetic
appearance scores, and track those scores over weeks to see whether your
routine is working.

This is a **beauty** app, and it has to stay one — store approval depends on
it. See the compliance section of `CLAUDE.md` for the language rules, and
follow them in code, copy and commit messages alike.

## Prerequisites

| Tool    | Notes                                                      |
| ------- | ---------------------------------------------------------- |
| Node.js | LTS (the major version in `.nvmrc`). Check with `node -v`  |
| Git     | Check with `git --version`                                 |
| Expo Go | Installed on a physical Android phone, from the Play Store |

Your phone and your computer must be on the same Wi-Fi network. On Windows,
keep the project in a plain path such as `C:\dev\` — OneDrive's file syncing
breaks `node_modules`.

## Install

```bash
npm install
cp .env.example .env
```

Then fill in `.env`. Every key is an `EXPO_PUBLIC_*` value that is safe to ship
in the app. The Gemini API key and the Supabase service role key are **not**
in this file and must never be — they belong in Supabase Edge Function secrets
only.

## Run

```bash
npm start
```

Scan the QR code with Expo Go on your Android phone. If your network blocks
device-to-device traffic (common on guest and corporate Wi-Fi):

```bash
npx expo start --tunnel
```

## Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm run format      # Prettier, writes in place
npx expo-doctor     # project health
```

CI runs `typecheck` and `lint` on every push and pull request to `main`.

## Database types

`src/types/database.ts` is generated from the live Supabase schema. **Re-run
this after every migration**, or the app's types drift from the database:

```bash
npx supabase login     # once per machine
npm run types:db
```

`types:db` runs the Supabase CLI through `npx`, so it is not a project
dependency. Never edit `database.ts` by hand.

## Auth settings

Every new install is signed in anonymously, and email sign-in uses emailed
links. The app can't start until these are set in the Supabase dashboard:

1. **Authentication → Sign In / Providers:** turn on **Allow anonymous
   sign-ins**, and **Allow manual linking**, which Supabase requires for
   turning an anonymous user into one with an email.
2. **Authentication → URL Configuration → Redirect URLs:** add
   `glowtrack://**` (installed builds) and `exp://**` (Expo Go). Email links
   only return to the app if their redirect is on this list.

Anonymous sign-ins are limited to 30 per hour per IP address by default
(**Authentication → Rate Limits**). Repeated reinstalls while testing can hit
that limit.

## Scan pipeline

Scans are scored by the `analyze-scan` Edge Function, which is the only place
the Gemini key exists. To set it up:

1. Run `supabase/migrations/0003_scan_pipeline.sql`, then
   `supabase/migrations/0004_routines.sql`, in the SQL editor. They turn on
   Realtime for `scans`, which the app uses to follow each scan, and let each
   scan save its routine alongside its scores. Run 0004 before deploying the
   Phase 9 version of the function.
2. Set the `GEMINI_API_KEY` and `REVENUECAT_SECRET_KEY` secrets and deploy
   the function, as described in `supabase/functions/analyze-scan/README.md`.
   Before analysing a paid scan, the function checks the subscription with
   RevenueCat itself, so a modified app can't scan for free.
3. Run the calibration harness before trusting the scores:
   `npm run calibrate` (see `scripts/README.md`).

## Subscriptions

The first scan is free. After it, scanning needs a subscription, sold through
Google Play and managed with RevenueCat. The trend and comparisons need one
too, while results and scan history stay open to everyone. Someone whose
subscription lapses keeps reading their history but can't scan.

Set the products up by hand, in this order, before testing any purchase:

1. **Play Console → Monetise → Subscriptions:** create one subscription,
   `glowtrack_premium`, with three base plans: `weekly`, `monthly` and
   `annual`.
2. On the `weekly` base plan, add a free-trial offer of 3 days.
3. Set prices for your main markets, then override them for lower-priced
   regions.
4. **RevenueCat:** create a project, add the Android app, and upload the Google
   Play service account JSON credentials.
5. Create an entitlement with the identifier `premium` and attach all three
   base plans to it. The app and the `analyze-scan` Edge Function both check
   this exact name.
6. Create an offering, `default`, and make it the current offering. Give it
   three packages using RevenueCat's standard Weekly, Monthly and Annual
   package types. The app matches plans by package type, and leaves out any
   plan that is missing.
7. **RevenueCat → Project settings → Restore behavior:** choose **Transfer to
   new App User ID**. A fresh install starts as a new anonymous user, so
   restoring on it has to move the subscription to that user.

Then put the Android **public** SDK key (`goog_...`, under API keys) in `.env`
as `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`. It is designed to be public. The
**secret** key (`sk_...`) is different: it belongs only in the Edge Function's
secrets (see `supabase/functions/analyze-scan/README.md`) and never in the app.

The paywall links to the Terms and the Privacy Policy, which the stores
require. Put their web addresses in `EXPO_PUBLIC_TERMS_URL` and
`EXPO_PUBLIC_PRIVACY_URL`. For cloud builds, set all of these in EAS as well.

Testing purchases:

- Products can take several hours to appear after they're created.
- Purchases only work in a build installed from a Play testing track, signed
  with the same key, by a licence-tested account. Expo Go runs RevenueCat in a
  browser preview mode without Google Play, so it can't make real purchases.
- To try the free scan again without subscribing, clear the app's storage in
  Android settings: the app starts over as a new anonymous user with a fresh
  free scan. Or reset it for your own user in the SQL editor:
  `update public.profiles set free_scan_used = false where id = 'YOUR_USER_ID';`

## Analytics and crash reporting

Events go to PostHog, and crashes to Sentry. Both need a new development
build, because Sentry adds a native module.

### What is sent

Only the events typed in `src/lib/analytics.ts`, and only scores, counts and
choices. Never the photo, a storage path, a signed link, an email address, the
headline or the observation text. The PostHog client captures nothing on its
own: autocapture, session recording, app lifecycle events, exception capture
and remote configuration are all off. People are identified by their Supabase
user id, with these properties: `skin_type`, `age_band`, `concern_count`,
`is_premium`, `scan_count` and `days_since_install`.

A few events need explaining:

- `scan_number` is which scan this is for the person. For `camera_opened`,
  `scan_submitted` and `scan_rejected` it's the next one; for `scan_completed`
  and `results_viewed` it's the scan itself; on `paywall_viewed` it's how many
  are done so far. It's null when the count isn't known yet (offline at
  launch).
- `capture_attempted` counts every press of the shutter, including presses
  while the light or steadiness checks still hold it back. `face_ok` is always
  null: the app has no face detection, only the oval guide.
- `app_opened` fires at launch, and again on coming back after 30 minutes or
  more away. Shorter trips out, such as the purchase sheet, don't count.
- `rescan_from_reminder` fires when a scan is submitted within an hour of
  tapping a re-scan or streak reminder.

### PostHog setup

1. Create a PostHog Cloud project in the EU or US region.
2. **Project settings:** turn on **Discard client IP data**, and leave session
   replay off.
3. Put the project API key (`phc_...`, public by design) in
   `EXPO_PUBLIC_POSTHOG_KEY`, and the region's host (`https://eu.i.posthog.com`
   or `https://us.i.posthog.com`) in `EXPO_PUBLIC_POSTHOG_HOST`. Nothing is
   sent until both are set. Set them in EAS as well.

Events are sent from development builds too. Leave the two variables empty in
your local `.env`, or use a separate PostHog project for development, so
testing doesn't count as real use.

### The four funnels

Build each one in PostHog under **Product analytics → New insight → Funnel**,
then save it to a dashboard.

| Funnel         | Steps                                                                                                                          | Conversion window |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| Activation     | `app_opened` where `is_first_open` = true → `onboarding_completed` → `scan_completed`                                          | 7 days            |
| Monetisation   | `scan_completed` → `paywall_viewed` → `purchase_completed`                                                                     | 14 days           |
| Retention loop | `scan_completed` where `scan_number` = 1 → `scan_completed` where `scan_number` = 2 → `scan_completed` where `scan_number` = 3 | 21 days           |
| Capture        | `camera_opened` → `capture_attempted` → `scan_completed`                                                                       | 1 hour            |

The retention loop's steps are the day-7 and day-14 rescans, since the weekly
reminder asks for one scan a week. Open **Time to convert** on it to see how
close to weekly people really come. For the capture funnel, break
`capture_attempted` down by `brightness_ok` and `stability_ok` to see which
check stops people.

### Sentry setup

Sentry only runs in production builds with a DSN, so Expo Go and development
builds never report. No screenshots, view hierarchy, request bodies or IP
addresses are sent, and web addresses, storage paths and email addresses are
removed from every message and breadcrumb. The only identifier is the Supabase
user id.

1. Create a React Native project in Sentry. In **Settings → Security &
   Privacy**, turn on **Prevent Storing of IP Addresses**.
2. Put the DSN (public by design) in `EXPO_PUBLIC_SENTRY_DSN`, in `.env` and in
   EAS.
3. Release builds upload source maps so stack traces point to the real code.
   The Sentry plugin in `app.json` and `metro.config.js` handle this, but EAS
   needs three variables:
   - `SENTRY_ORG`: the organisation slug;
   - `SENTRY_PROJECT`: the project slug;
   - `SENTRY_AUTH_TOKEN`: an organisation auth token. This one is a **secret**.
     Give it secret visibility in EAS, and never put it in `.env`, `app.json`
     or the repository.

   **Without the token, release builds fail.** To build anyway, without
   readable stack traces, set `SENTRY_DISABLE_AUTO_UPLOAD=true` for that build.

## Build

Cloud builds run on EAS, so no Mac is needed for iOS later.

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview   # installable APK for testing
eas build --platform android --profile production
```

## Layout

```
app/          Expo Router routes only
  (auth)/     sign-in flow
  (onboarding)/
  (tabs)/     main tab navigator
  scan/       camera and scan flow
src/
  components/ui/         shared primitives
  components/scan/
  components/progress/
  lib/                   clients and helpers
  stores/                Zustand stores
  theme/                 design tokens
  types/                 shared types
  constants/             all user-facing copy
supabase/
  migrations/
  functions/             Edge Functions (Deno)
scripts/                 calibration harness (Deno)
assets/
```

`@/...` resolves to `src/...`.
