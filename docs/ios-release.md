# Building and releasing for iOS

iOS builds run on Expo's macOS machines through EAS, so a Windows PC is
enough to build and submit. What you can't do without an iPhone is try the
build: TestFlight, Apple's testing app, only runs on an iPhone. Borrow one,
buy a cheap second-hand model, or recruit a tester who has one.

The build plan puts this after Android has proved the product. Nothing here
has been built or run yet: this is the preparation.

**Before submitting, five things must change** (see
[Must change before App Review](#must-change-before-app-review)). The build
works without them, but App Review would reject it, and some of the wording
would be wrong on an iPhone.

## What's already set up

| Where                               | What                                                                                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app.json` → `ios`                  | Bundle identifier `com.glowtrack.app`, iPhone only (`supportsTablet: false`).                                                                                                        |
| `app.json` → camera plugin          | The camera purpose string: "GlowTrack uses your camera to take a photo of your face for each scan, so you can see how your skin looks over time."                                    |
| `app.json` → `ios.infoPlist`        | The photo library purpose string, for Save Image in the share sheet (see [Dependencies](#dependencies)).                                                                             |
| `app.json` → sensors plugin         | `motionPermission: false`. The app only reads the accelerometer, which needs no permission on iOS. This removes Expo's default motion purpose string and the unused permission code. |
| `app.json` → `ios.config`           | `usesNonExemptEncryption: false`. The app only uses HTTPS, so App Store Connect stops asking the export compliance question on every upload.                                         |
| `app.json` → `ios.privacyManifests` | The privacy manifest (see [Privacy manifest](#privacy-manifest)).                                                                                                                    |
| `eas.json` → `production.ios`       | A Release build for the App Store. The same `production` profile builds both platforms.                                                                                              |
| `src/lib/purchases.ts`              | Reads `EXPO_PUBLIC_REVENUECAT_IOS_KEY` on iOS. Without it, subscriptions can't start on an iPhone at all.                                                                            |

**Why there's no `buildNumber` in `app.json`:**

- **The build number** (`CFBundleVersion`, what App Store Connect uses to
  tell uploads apart) is kept by EAS, like Android's `versionCode`, because
  `eas.json` sets `appVersionSource: remote`.
- **It goes up by itself.** Each production build adds one (`autoIncrement`).
  A `buildNumber` in `app.json` would be ignored, and EAS would warn about it.
- **Checking it:** `eas build:version:get -p ios` shows it. The first iOS build
  starts at 1.
- **The version users see** is `version` in `app.json` (`1.0.0`), shared with
  Android.

## One-time setup

1. **Join the Apple Developer Program** (about R1,800 a year) at
   developer.apple.com.
   - **As an individual,** your own name appears as the seller.
   - **As an organisation,** the company name appears. It needs a D-U-N-S
     number, which can take a couple of weeks to get.

2. **Accept the Paid Apps agreement** in App Store Connect → Business, and
   fill in the bank and tax details. Subscriptions can't be tested or sold
   until it shows as Active.

3. **Add the RevenueCat key for iOS to EAS.** Do this once the App Store app
   exists in RevenueCat (step 4 of the
   [App Store Connect checklist](#app-store-connect-checklist)):

   ```bash
   eas env:create --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value "appl_…" \
     --environment development --environment preview --environment production --visibility plaintext
   ```

   Everything else in `docs/android-release.md` → One-time setup already
   applies to iOS builds too: Supabase, PostHog, Sentry, the legal links and
   the support address.

4. **Make the first build:**

   ```bash
   eas build --profile production --platform ios
   ```

   - **Sign in when asked.** EAS asks for your Apple ID and a two-factor
     code.
   - **Let EAS create everything.** It offers to create the distribution
     certificate, register the App ID `com.glowtrack.app` and create the
     provisioning profile. Answer yes to each. They're kept on Expo's servers,
     as the Android keystore is.
   - **Push notifications may come up.** `expo-notifications` adds the push
     notifications entitlement, although the app only schedules reminders on
     the phone. If EAS asks to set up a push key, you can skip it.

5. **Send the build to App Store Connect:**

   ```bash
   eas submit --profile production --platform ios
   ```

   - If the app doesn't exist in App Store Connect yet, EAS offers to create
     it.
   - Processing takes 15 to 30 minutes, and then the build appears in
     TestFlight.

6. **Install it on the iPhone:**
   1. In App Store Connect → TestFlight, add yourself as an internal tester.
   2. Install TestFlight on the iPhone and accept the invitation.
   3. Run `docs/test-script.md`, with the [iOS differences](#running-the-test-script-on-an-iphone).

### Development builds on an iPhone (optional)

The `development` and `preview` profiles also build for iOS, but only for
iPhones registered with your developer account:

```bash
eas device:create                                   # open the link on the iPhone and install the profile
eas build --profile development --platform ios
```

Before the build opens, iOS may ask you to turn on Developer Mode (Settings →
Privacy & Security). Simulator builds aren't useful without a Mac, so the
profiles don't make them.

## Dependencies

Everything installed works on iOS. This table lists what each one needs.

| Package                                                                                                                                                       | On iOS                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-native-purchases`                                                                                                                                      | **Works, but needs setup and code before selling.** It needs the `appl_` key above, the App Store products and RevenueCat's App Store setup. Three pieces of code under [Must change before App Review](#must-change-before-app-review) are Google-specific.                                                                                                                                                                |
| `expo-secure-store`                                                                                                                                           | **Works, but behaves differently.** It stores the sign-in session and settings in the iOS Keychain, and **iOS keeps Keychain items after the app is deleted.** Reinstalling on the same iPhone brings back the previous account (anonymous or signed in), where Android would start over. The test script and the privacy policy both assume Android behaviour (see [Must change](#must-change-before-app-review), item 5). |
| `expo-sharing`                                                                                                                                                | **Works, with the photo library string added.** The share sheet offers Save Image for the progress card, and iOS closes an app that saves to Photos without a photo library purpose string. That's why `NSPhotoLibraryAddUsageDescription` is set. The data export (`.json`) goes to Save to Files and needs nothing.                                                                                                       |
| `expo-camera`                                                                                                                                                 | Works. The camera purpose string is set. Microphone and barcode scanning are off. The silent sampling the light meter uses (`shutterSound: false`, no shutter animation) is supported on iOS. In some countries iOS always plays the shutter sound, which would click while the meter works. **Check on a device.**                                                                                                         |
| `expo-sensors`                                                                                                                                                | Works. Accelerometer only, so no permission is needed. The motion purpose string is removed.                                                                                                                                                                                                                                                                                                                                |
| `expo-notifications`                                                                                                                                          | Works. Reminders are scheduled on the phone. iOS allows 64 pending at once, and the app schedules at most 14. The Android channel setup is skipped on iOS already. The push entitlement it adds is harmless.                                                                                                                                                                                                                |
| `expo-dev-client`                                                                                                                                             | Works. It adds a local network purpose string and a Bonjour entry to every build. The launcher is switched off in release builds, so the prompt never appears in the App Store version.                                                                                                                                                                                                                                     |
| `expo-splash-screen`                                                                                                                                          | Works. The plugin makes the iOS launch screen with the same colours, including dark mode.                                                                                                                                                                                                                                                                                                                                   |
| `@sentry/react-native`                                                                                                                                        | Works. The same `SENTRY_ORG`, `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN` EAS variables upload the iOS source maps during the build.                                                                                                                                                                                                                                                                                           |
| `expo-haptics`                                                                                                                                                | Works. Routine ticks give a light tap on every supported iPhone.                                                                                                                                                                                                                                                                                                                                                            |
| `posthog-react-native`, `@supabase/supabase-js`, `zustand`                                                                                                    | JavaScript only. Nothing to configure.                                                                                                                                                                                                                                                                                                                                                                                      |
| `expo-constants`, `expo-crypto`, `expo-file-system`, `expo-image`, `expo-image-manipulator`, `expo-linking`, `expo-network`, `expo-router`, `expo-status-bar` | Work. Nothing to configure.                                                                                                                                                                                                                                                                                                                                                                                                 |
| `react-native-gesture-handler`, `-reanimated`, `-worklets`, `-safe-area-context`, `-screens`, `-svg`, `-view-shot`                                            | Work. Nothing to configure.                                                                                                                                                                                                                                                                                                                                                                                                 |

Nothing is Android-only. Three things are only on Android and are skipped on
iOS already:

- the notification channel;
- the back button handlers (see [Layout and navigation](#layout-and-navigation));
- `android.blockedPermissions`.

## Privacy manifest

Apple needs a privacy manifest (`PrivacyInfo.xcprivacy`) that declares two
things:

- the "required reason" system calls the app makes;
- the data it collects.

There's no `ios/` folder in the repository, because EAS generates it on every
build, so the manifest lives in `app.json` → `ios.privacyManifests`. Prebuild
writes it into the app as `PrivacyInfo.xcprivacy`. This was checked with a
local `expo prebuild --platform ios`.

### Required-reason calls

The calls come from React Native and the Expo modules, not the app's own code.
Most libraries are linked into the app's main file, so their calls count as
the app's. The list is the combination of the manifests the installed
libraries ship:

| Category         | Reasons                | Declared by                                      |
| ---------------- | ---------------------- | ------------------------------------------------ |
| UserDefaults     | CA92.1                 | React Native, expo-constants, expo-notifications |
| File timestamps  | C617.1, 0A2A.1, 3B52.1 | React Native, expo-file-system, expo-application |
| System boot time | 35F9.1                 | React Native                                     |
| Disk space       | E174.1, 85F4.1         | expo-file-system                                 |

The native Sentry and RevenueCat libraries are downloaded during the build,
so their manifests couldn't be checked here. If either needs a category or
reason that's missing, App Store Connect's email after the first upload
names it. Add it to `ios.privacyManifests` in `app.json` and build again.

After adding a native library, check whether it ships a
`PrivacyInfo.xcprivacy` and add any new categories to `app.json`. If one is missing,
App Store Connect emails a warning naming the category after the upload.

### Collected data

Nothing is used for tracking (`NSPrivacyTracking: false`), and every type is
linked to the account's random ID.

| Data type             | What it is in GlowTrack                                             | Used for                     |
| --------------------- | ------------------------------------------------------------------- | ---------------------------- |
| Photos or videos      | The scan photos                                                     | App functionality            |
| Other user content    | The answers from getting started, the routine and its ticks         | App functionality, analytics |
| Email address         | Only if the person adds one to save their progress                  | App functionality            |
| User ID               | The account's random ID, shared with RevenueCat, PostHog and Sentry | App functionality, analytics |
| Purchase history      | Subscription status from RevenueCat                                 | App functionality            |
| Product interaction   | PostHog events                                                      | Analytics                    |
| Crash data            | Sentry reports                                                      | App functionality            |
| Other diagnostic data | The phone model and system version in crash reports                 | App functionality            |

**Why skin answers aren't declared as health data.** The skin type and focus
areas are cosmetic preferences, such as "Visible pores" and "Dullness", in
keeping with the Beauty positioning. That's a judgement call. Make sure the
App Privacy answers in App Store Connect say the same as this table.

## Layout and navigation

Every screen was read for iOS layout problems. None needed a code change.
Five things need checking on an iPhone.

### Safe areas, the Dynamic Island and the home indicator

- **Screens:** every screen is wrapped in `Screen`, which keeps content inside
  the safe area on all four sides.
- **Tab screens:** these keep top, left and right. The tab bar sits above the
  home indicator by itself.
- **The camera:** the camera screen runs edge to edge and pads its controls by
  the safe-area insets. The close button clears the Dynamic Island, and the
  shutter clears the home indicator. The tips sheet adds the bottom inset too.
- **Modals:**
  - The scan picker is a full-screen modal, wrapped in `Screen`.
  - The share screen is a sheet on iOS, and swiping it down closes it.
  - The paywall's Close stays visible.
- **Absolute positioning:** nothing is absolutely positioned against the top
  or bottom of the screen. The absolute elements are all inside content: the
  chart tooltip, the comparison slider and the off-screen share card.

### No back button

iPhones have no back button. Instead, a swipe from the left edge goes back in
a stack. Four screens catch Android's back button, and none of them relies on
it:

| Screen          | On Android, back…             | On iOS                                                                                           |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| Onboarding      | goes to the previous question | The header's back arrow and a swipe right do the same. The first step has nothing to go back to. |
| Analysing       | leaves for Home               | The close button is always visible. The swipe is off on purpose.                                 |
| Results         | leaves for Home               | The close button. The swipe is off on purpose.                                                   |
| Reminders intro | counts as Not now             | The Not now button. The swipe is off on purpose.                                                 |

Every other stack screen has a Close, Back, Retake, Not now or Done button,
and the edge swipe does the same thing. Sign-in and the email check use the
native header, which shows iOS's back arrow.

### Check on an iPhone

1. **The sign-in keyboard.** Sign-in has a native header, and the
   keyboard-avoiding view doesn't allow for its height. Check that the send
   button stays above the keyboard. If it doesn't, give the view a
   `keyboardVerticalOffset` of the header height.
2. **The same on Delete my account,** with the `DELETE` field.
3. **The comparison slider at the left edge.** A drag that starts at the very
   left edge may go back instead of moving the slider.
4. **Front camera photos.** Check they aren't mirrored differently from
   Android, and that the faint previous photo still lines up.
5. **Largest text size** (Settings → Accessibility → Display & Text Size).
   The 1.5× cap applies on iOS too.

## Must change before App Review

These weren't changed here. The build works without them, and each one is
wording or a store decision that's yours to make. **All five need doing
before the first submission.**

### 1. Wording and links that name Google Play

- **Why it matters:** on an iPhone this text is simply wrong. App Review
  also rejects apps that mention another platform (guideline 2.3.10).
- **What to do:**
  - Make each string below say the right store for the platform: "the App
    Store", "your Apple Account", and "Settings → your name →
    Subscriptions" for cancelling.
  - Do the same in the privacy policy and the terms.

| String in `src/constants/copy.ts`         | Says now                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| `paywall.terms`, `paywall.trialTerms`     | "…Cancel any time in Google Play."                                             |
| `paywall.outcomes.pending`                | "Your payment is waiting on Google Play…"                                      |
| `paywall.outcomes.alreadySubscribed`      | "You already have this subscription on Google Play…"                           |
| `paywall.outcomes.storeUnavailable`       | "Google Play isn't available right now…"                                       |
| `paywall.outcomes.network`                | "We couldn't reach Google Play…"                                               |
| `paywall.outcomes.nothingToRestore`       | "…on this Google Play account."                                                |
| `settings.subscription.manageHint`        | "Opens your subscriptions in Google Play."                                     |
| `settings.subscription.manageFailed`      | "Google Play didn't open…"                                                     |
| `settings.deleteAccount.subscriptionNote` | "…does not cancel a Google Play subscription. Cancel it in Google Play first." |

The fallback link in `src/constants/links.ts` (`PLAY_SUBSCRIPTIONS_URL`) needs
an iOS version, `https://apps.apple.com/account/subscriptions`. RevenueCat
usually gives the right link itself, and the fallback is only used when it
doesn't.

### 2. Free trials

- **The problem:** the paywall reads the trial from Google's offer details,
  which don't exist on iOS, so on an iPhone it never mentions a trial. If an
  introductory offer is set up in App Store Connect, Apple starts a free
  trial while the paywall says "You pay … today".
- **The choice:**
  - **Either:** don't create introductory offers on the App Store yet;
  - **or:** show the App Store trial.
    - Read `product.introPrice`.
    - Check the person can have it with RevenueCat's
      `checkTrialOrIntroductoryPriceEligibility`, because the App Store lists
      offers whether or not someone can use them.
    - A comment on `freeTrial` in `src/lib/purchases.ts` already notes this.

### 3. The plan name in Settings

Settings works out the plan (weekly, monthly, annual) from Google's base plan
ID. App Store products have no base plans, so an iPhone would show the
fallback name. Match the entitlement's product against the current offering's
packages instead.

### 4. Telling people their photo goes to Google's AI

- **What Apple asks:** guideline 5.1.2(i) asks apps to say clearly when
  personal data goes to a third-party AI service, and to get permission
  first.
- **What the app says now:** the notice before the first photo says it is
  "uploaded and analysed" and "never shared", but not that Google's Gemini
  does the analysis.
- **Suggested change** to `scan.dataNotice.points`:
  - **First point:** "Your photo is sent to Google's Gemini AI service, which
    estimates how your skin looks."
  - **Third point:** "Apart from that, it is never shared, never sold and
    never used for advertising."
- **Where it applies:** this is worth doing for Android too.

### 5. Deleting the app doesn't remove the account on iOS

This follows from the Keychain behaviour described under
[Dependencies](#dependencies).

- **The privacy policy.** Its "How long we keep it" table says information on
  the phone lasts "until you delete your account or uninstall the app". On
  iOS the stored sign-in outlives an uninstall.
  - **Either:** reword it;
  - **or:** clear the Keychain on the first launch after a reinstall.
    - Keep a marker in the app's own storage, which iOS does delete.
    - If the marker is missing, sign out before anything else runs.
- **The test script.** Where it says to uninstall for a fresh start, use
  Settings → Delete my account on iOS.

### Also worth fixing first

The Home tab still says "No scans yet" after scans. App Review counts
placeholder content as incomplete (guideline 2.1).

## App Store Connect checklist

Work through this in order. Steps 1 and 2 are the one-time setup above.

1. **Enrol** in the Apple Developer Program.
2. **Activate the Paid Apps agreement,** with bank and tax details.
3. **Create the app** (or let `eas submit` do it):
   - name: `GlowTrack: Skincare Progress`, the same as on Play and within
     Apple's 30-character limit;
   - bundle ID: `com.glowtrack.app`;
   - any SKU, such as `glowtrack-ios`;
   - primary language: English.
4. **Set up subscriptions and RevenueCat:**
   1. Under Subscriptions, create one subscription group, for example
      "GlowTrack Premium".
   2. Add three auto-renewable subscriptions to it: weekly, monthly and
      annual. Product IDs can't contain a colon; for example
      `glowtrack_premium_weekly`.
   3. Give each one a price, and a display name and description in English.
   4. Add a review screenshot of the paywall to each one.
   5. Hold introductory offers until item 2 above is settled.
   6. In RevenueCat, add an App Store app to the existing project, with
      bundle ID `com.glowtrack.app`.
   7. Upload the In-App Purchase key. Make it in App Store Connect → Users
      and Access → Integrations → In-App Purchase. It downloads as a `.p8`
      file; keep it with the keystore backup.
   8. Copy RevenueCat's App Store Server Notifications URL into App
      Information → App Store Server Notifications, as Version 2 for both
      production and sandbox.
   9. Attach the three products to the `premium` entitlement, and to the
      weekly, monthly and annual packages of the current offering. They sit
      beside the Play products.
   10. Copy the public `appl_…` key into EAS (One-time setup, step 3).

   The server-side check in `analyze-scan` asks RevenueCat about the account,
   not the store, so it covers App Store subscriptions without changes.

5. **App Information:**
   - **Category: Lifestyle.** The App Store has no Beauty category.
     - Don't choose Health & Fitness or Me·dical. They invite review under
       guideline 1.4.1, which the build plan names as the biggest iOS risk.
   - **Subtitle** (30 characters): for example "Track your skincare
     progress".
   - **Content rights:** the app shows no third-party content.
   - **Privacy Policy URL:** the same page as Play.
6. **Age rating:**
   - Answer the questionnaire: the app has no objectionable content.
   - It gives cosmetic estimates and routine suggestions, with no
     me·dical information. Answer those questions to match.
   - The app is for adults, and onboarding offers no age range under 18.
     Consider raising the rating to 18+ so the store matches the privacy
     policy.
7. **App Privacy.** Answer the data questions from the table under
   [Collected data](#collected-data):
   - the same types;
   - linked to the person;
   - not used for tracking;
   - the same purposes.

   Include what the SDKs collect for you: RevenueCat, PostHog, Sentry, and
   Google (Gemini) for the photos.

8. **Pricing and Availability:**
   - **Price:** free (the subscriptions carry the price).
   - **Countries:** the same as Play.
9. **The version page:**
   - **Screenshots:** 6.9" iPhone, 1320 × 2868 portrait, from 3 to 10. Reuse
     the plan in `docs/store-listing.md`, taken on an iPhone. iPad
     screenshots aren't needed, because the app is iPhone only.
   - **Description:**
     - Adapt the Play description in `docs/store-listing.md`. Its
       subscription paragraph names Google Play and needs the App Store
       version.
     - Include a link to the Terms of Use. Apple requires one for
       auto-renewing subscriptions, in the description or the EULA field.
   - **Keywords:** 100 characters, comma-separated. Run them through the
     banned-word list in `CLAUDE.md` section 3, as for Play.
   - **Support URL:** required. A page with the support email is enough.
   - **Copyright:** for example "2026 [your name or company]".
10. **App Review Information:**
    - **Sign-in:** no demo account is needed, because the app works without
      signing in.
    - **Notes for the reviewer:** a short version of the points below.
      - GlowTrack gives cosmetic estimates of how skin looks in a photo, for
        tracking a skincare routine.
      - The first scan is free. Later scans need the subscription, which can
        be bought with a sandbox account.
      - The photo is sent to Google's Gemini API for the estimate.
      - Settings → Delete my account deletes everything.
      - Any clear, front-facing photo of a face works.
    - **Sign in with Apple:** not needed. The only sign-in is an emailed
      link, with no third-party accounts.
11. **Upload and test:**
    1. `eas build` and then `eas submit`, as in One-time setup.
    2. In TestFlight, run `docs/test-script.md` on an iPhone.
    3. In section 5, sign in with a sandbox tester (Users and Access →
       Sandbox) instead of a Play license tester.
12. **Submit for review.** Attach the three subscriptions to the version, so
    they're reviewed with it. Expect at least one round of questions about
    the app's purpose (guideline 1.4.1): the build plan budgets for it.

### Running the test script on an iPhone

- **Fresh start:** Delete my account, not uninstalling (see
  [Must change](#must-change-before-app-review), item 5).
- **Purchases:** a sandbox Apple Account instead of a Play license tester.
  Sandbox renewals come every few minutes, as on Play.
- **Back navigation:** wherever a step says to press back, swipe from the
  left edge or use the on-screen button.
- **Sharing:**
  - Step 4.4 opens the iOS share sheet.
  - Also tap **Save Image** and check that the app asks for photo access
    and doesn't close.
- **Cancelling:** Settings → your name → Subscriptions, in place of the
  Play Store steps in 8.6 and 9.6.
