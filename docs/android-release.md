# Building and releasing for Android

Everything builds in Expo's cloud with EAS, so nothing needs installing
beyond Node and the EAS command line.

## Before the first store build: replace the placeholder art

`assets/icon.png`, the three `assets/android-icon-*.png` layers and
`assets/splash-icon.png` are still **Expo's template images**, and the app
icon is the Expo logo. Play will reject a listing that uses someone else's
logo. Replace them before uploading. Keep the file names, or update
`app.json`.

| File                                 | What it is                                     | Spec                                                                                                       |
| ------------------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `assets/icon.png`                    | The main icon                                  | 1024×1024 PNG, no transparency                                                                             |
| `assets/android-icon-foreground.png` | Adaptive icon, front layer                     | 1024×1024 PNG with transparency. Keep the artwork inside the central 66%, because launchers crop the rest. |
| `assets/android-icon-background.png` | Adaptive icon, back layer                      | 1024×1024 PNG, or delete it and rely on `adaptiveIcon.backgroundColor`                                     |
| `assets/android-icon-monochrome.png` | Themed icon (Android 13+)                      | 1024×1024 PNG, one colour on transparency                                                                  |
| `assets/splash-icon.png`             | Splash logo, shown at 200 dp on the app colour | PNG with transparency, square                                                                              |

When the icon is final, change `android.adaptiveIcon.backgroundColor` in
`app.json` from the template's `#E6F4FE` to the brand colour. That was
decision 4 of the compliance audit.

## One-time setup

1. **Install the command line and sign in:**

   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Link the project to your Expo account:**

   ```bash
   eas init
   ```

   This adds `extra.eas.projectId` (and `owner`) to `app.json`. Commit that
   change. The build profiles are already in `eas.json`, so there's no need
   to run `eas build:configure`.

3. **Store the app's settings in EAS, per environment.**

   - **Why:** builds run in Expo's cloud and never see your `.env`. EAS
     injects these at build time, and they're never committed.
   - **Which environment:** each profile in `eas.json` reads one
     environment: `development`, `preview` or `production`.
   - **Syntax:** repeat `--environment` for each one that needs the value.

   ```bash
   # Supabase (every environment)
   eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR-REF.supabase.co" \
     --environment development --environment preview --environment production --visibility plaintext
   eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR-ANON-KEY" \
     --environment development --environment preview --environment production --visibility plaintext

   # RevenueCat's public Android key (goog_…)
   eas env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value "goog_…" \
     --environment development --environment preview --environment production --visibility plaintext

   # Analytics and crash reporting
   eas env:create --name EXPO_PUBLIC_POSTHOG_KEY --value "phc_…" --environment preview --environment production --visibility plaintext
   eas env:create --name EXPO_PUBLIC_POSTHOG_HOST --value "https://eu.i.posthog.com" --environment preview --environment production --visibility plaintext
   eas env:create --name EXPO_PUBLIC_SENTRY_DSN --value "https://…" --environment preview --environment production --visibility plaintext

   # Legal pages and support
   eas env:create --name EXPO_PUBLIC_TERMS_URL --value "https://…" --environment preview --environment production --visibility plaintext
   eas env:create --name EXPO_PUBLIC_PRIVACY_URL --value "https://…" --environment preview --environment production --visibility plaintext
   eas env:create --name EXPO_PUBLIC_SUPPORT_EMAIL --value "support@…" --environment preview --environment production --visibility plaintext

   # Sentry source-map upload (release builds fail without the token)
   eas env:create --name SENTRY_ORG --value "your-org" --environment preview --environment production --visibility plaintext
   eas env:create --name SENTRY_PROJECT --value "your-project" --environment preview --environment production --visibility plaintext
   eas env:create --name SENTRY_AUTH_TOKEN --value "sntrys_…" --environment preview --environment production --visibility secret
   ```

   Check them with `eas env:list --environment production`. To run the app
   locally with the same values, `eas env:pull --environment development`
   writes them to `.env.local`, which git ignores.

   **Never add the Gemini key, the RevenueCat secret key or the Supabase
   service role key here.** They live only in Supabase Edge Function secrets.

## The three build profiles

| Profile       | Builds                                          | For                                                                                                                                        |
| ------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `development` | An APK of the development client                | Day-to-day work. Install it once, then `npm start` loads your local code with fast refresh. It replaces Expo Go, which can't run this app. |
| `preview`     | A release APK, installable straight from a link | Sharing a build with yourself or a tester without the Play Store                                                                           |
| `production`  | An Android App Bundle (`.aab`)                  | Uploading to Play Console                                                                                                                  |

```bash
eas build --profile development --platform android   # once, then after adding native packages
npm run build:preview                                 # eas build --profile preview --platform android
npm run build:production                              # eas build --profile production --platform android
```

**Version numbers:**

- **`versionCode`** (the number Play uses to tell builds apart) is kept by
  EAS (`appVersionSource: remote`). It goes up by one on every production
  build, so you can't upload a duplicate by mistake. Check it with
  `eas build:version:get -p android`.
- **`version`** in `app.json` (currently `1.0.0`) is the name users see. Raise
  it yourself for each release you announce.

## Your first production build

```bash
npm run build:production
```

On the first run, EAS asks whether to generate a new Android keystore.
**Answer yes.** When the build finishes, the terminal and expo.dev both link
to the `.aab`. Download it and upload it to the closed testing track in Play
Console (P14.2). The first upload must be done by hand in Play Console.

## The signing keystore: what it is and how to keep it safe

1. **What it is.** Every Android build is signed with a private key stored in
   a keystore file. Android and Play use the signature to check that an update
   comes from the same developer as the app already installed.

2. **Where it lives.** When you answer yes above, EAS generates the keystore
   and keeps it on Expo's servers. Every later build is signed with the same
   one, so you never handle the file day to day.

3. **What the key actually is: your upload key.** New Play apps must use
   **Play App Signing**:

   - Google keeps the real **app signing key**, and signs what users download
     with it.
   - The key EAS holds is your **upload key**. It proves to Google that an
     upload came from you.

4. **What losing it costs.** Losing the upload key does **not** end the app,
   as it would have in the old days. In Play Console → Test and release →
   App integrity, you can ask Google to reset it. You then register a new
   upload key, and a new build can't be uploaded until Google approves,
   usually within a few days. It's a lost week, not a lost app. Losing your
   Expo account access with no backup would put you in exactly that
   position, so back it up.

5. **How to back it up. Do it right after the first build:**

   1. Run:

      ```bash
      eas credentials --platform android
      ```

   2. Pick the `production` profile, then the keystore option, then
      **Download existing keystore**. EAS saves a `.jks` file and prints
      three values: the keystore password, the key alias and the key
      password.
   3. **Copy 1:** a password manager entry holding the `.jks` file as an
      attachment and the three values.
   4. **Copy 2, offline:** the same file and values on an encrypted USB drive
      or external disk kept somewhere other than your computer.
   5. **Never commit it.** `.gitignore` already excludes `*.jks` and
      `*.keystore`. Don't put it in the repository, a chat or email.

6. **Keep a record in Play Console.** After the first upload, App integrity
   shows the upload certificate's SHA-1 and SHA-256 fingerprints. Save them
   with the backup, so you can always tell which key is which.

## Closed testing

See the build plan, P14.2 and P14.4:

- the Play Console checklist;
- the 12-tester, 14-day rule;
- the message to send testers.

Run `docs/test-script.md` on each build before it goes to testers.
