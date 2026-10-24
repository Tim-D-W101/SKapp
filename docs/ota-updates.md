# Over-the-air updates (EAS Update)

Preview and production builds can take new JavaScript, screens and images
over the air. A change reaches an installed app without a new build or a
reinstall. The app is linked to the EAS project owned by `tim1212`
(`extra.eas.projectId` in `app.json`), and it asks `updates.url` for a new
update each time it starts.

## How it fits together

- **Channel.** Every build listens on one channel, set in `eas.json`. The
  `preview` profile listens on `preview` and the `production` profile on
  `production`. An update published to a channel reaches only the builds on
  that channel. The `development` profile has no channel. It still loads your
  local code with `npm start`, as before.
- **Runtime version.** `runtimeVersion` in `app.json` follows the app version
  (`"policy": "appVersion"`), so it's currently `1.0.0`. A build only accepts
  updates published with its own runtime version. See
  [Native changes need a new build and a new version](#native-changes-need-a-new-build-and-a-new-version).
- **Environment variables.** `EXPO_PUBLIC_*` values are written into the
  JavaScript when it's bundled, so each update carries its own copy. They come
  from the EAS environment you name with `--environment`, which holds the same
  values the matching build uses (`docs/android-release.md`, one-time setup
  step 3). There's nothing new to set up.

## First time: one new preview build

The preview APK installed now was built without update support, so it can
never receive an update. Replace it once:

1. Make a new preview build:

   ```bash
   npm run build:preview
   ```

2. Install the APK from the link EAS prints, over the old one. If Android
   refuses with "App not installed", uninstall the old GlowTrack first and
   install again. Your scans stay in your account; you only need to sign in
   again.
3. Open it once. From then on, code and UI changes arrive as updates, with no
   reinstall.

## Sending a change to the preview build

1. Sign in once, with the Expo account that owns the project (`tim1212`):

   ```bash
   npx eas-cli login
   ```

2. Check out the code you want to send, and install its dependencies with
   `npm ci`.
3. Publish it from the repository root:

   ```bash
   npx eas-cli update --channel preview --environment preview --message "<what changed>"
   ```

   This bundles the app on your computer with the `preview` environment's
   variables from EAS, then uploads it. Write a message you'll understand
   later: "Home: larger score ring" beats "fixes".

4. On the phone, open GlowTrack. It starts with the version it already has and
   downloads the update in the background. Close the app fully (swipe it away
   from recent apps) and open it again, and the update is running. So the
   change usually shows on the second open. If it doesn't, close and reopen
   once more.

To see what's published, run `npx eas-cli update:list --branch preview`, or
open the project's Updates page on expo.dev. To undo an update, check out the
last good commit and publish it again the same way.

## Testing premium on the preview build

Until the subscriptions exist in Google Play, nothing can be bought, so the
premium screens can't be reached for real. A preview build can offer a
tester-only switch instead: **Settings → Testing → Preview premium**. While
it's on, the phone's own checks count you as subscribed, so the trend, the
before-and-after comparison and the camera after your free scan open
instead of the plans.

On its own, the switch only changes what the phone shows: the server (the
analyze-scan Edge Function) checks the real subscription with RevenueCat, so
a scan after your free one would still be turned down. To get real results
for scans 2, 3 and on, the preview build also carries a **preview scan key**
that the server knows. The app sends it with each scan while the switch is
on, and the server counts a scan with the right key as subscribed.

It's controlled by two EAS variables and one Supabase secret:

| Name                                 | Value                    | Where                                   |
| ------------------------------------ | ------------------------ | --------------------------------------- |
| `EXPO_PUBLIC_ENABLE_PREMIUM_PREVIEW` | `true`                   | The EAS **`preview`** environment only  |
| `EXPO_PUBLIC_PREVIEW_BYPASS_TOKEN`   | your key (same as below) | The EAS **`preview`** environment only  |
| `PREVIEW_BYPASS_TOKEN`               | your key (same as above) | Supabase **Edge Function secrets** only |

Without the key, the switch still works as before, and only the free scan
gets results. The app sends the key only in a build that offers the switch
(never one on the `production` channel), only while the switch is on, and
only if the build was published with the key.

### Set it up (once)

1. **The switch.** In the `preview` environment only:

   ```bash
   npx eas-cli env:create --environment preview --name EXPO_PUBLIC_ENABLE_PREMIUM_PREVIEW --value true --visibility plaintext
   ```

2. **Make a key**: a long random string, at least 32 characters. Don't paste
   it into a chat, a commit or a ticket.

   ```bash
   openssl rand -hex 32
   ```

3. **Give it to the server.** Add a line to `supabase/functions/.env` (it's
   gitignored, and already holds the function's other secrets):

   ```text
   PREVIEW_BYPASS_TOKEN=<your key>
   ```

   Then upload the file, as in `supabase/functions/analyze-scan/README.md`:

   ```bash
   npx supabase secrets set --env-file supabase/functions/.env --project-ref yheevhjamvuxtnqudszk
   ```

   A value shorter than 32 characters is ignored (the function logs an
   error), so the key never opens scans by being easy to guess.

4. **Deploy the function** once, so the server knows to look for the key.
   Later changes to the secret need no new deploy.

   ```bash
   npx supabase functions deploy analyze-scan --project-ref yheevhjamvuxtnqudszk
   ```

5. **Give it to the preview build.** Same key, in the `preview` environment
   only. `read -rs` keeps it out of your screen and shell history; paste the
   key and press Enter:

   ```bash
   read -rs PREVIEW_KEY
   npx eas-cli env:create --environment preview --name EXPO_PUBLIC_PREVIEW_BYPASS_TOKEN --value "$PREVIEW_KEY" --visibility sensitive
   unset PREVIEW_KEY
   ```

   `sensitive` hides it on expo.dev and in logs while still letting
   `eas update` use it.

6. **Publish to the preview channel** as usual (`--environment preview`).
   Both values are written into the update, so the installed preview APK
   picks them up with no new build.

Then, on the preview build: Settings → Testing shows the switch, with a note
that this build also asks the server for scans after your free one. Turn
Preview premium on, and scans after the free one get real scores. The
first scan is still the free one, and is used up the same way.

### Switch it off, or change the key

- **Off, at once, for everyone:** remove the server's secret. Any key sent
  after that is ignored; no deploy is needed.

  ```bash
  npx supabase secrets unset PREVIEW_BYPASS_TOKEN --project-ref yheevhjamvuxtnqudszk
  ```

- **Take it out of the preview build:** delete the EAS variable
  (`npx eas-cli env:delete`) and publish again. Do the same with
  `EXPO_PUBLIC_ENABLE_PREMIUM_PREVIEW` to remove the Testing section.
- **A new key** (for example, if a preview APK went somewhere it
  shouldn't): make one, set it on the server (step 3) and in EAS (delete
  and recreate, step 5), and publish again. The old key stops working as
  soon as the server has the new one.

### Never for production

- **Neither EAS variable may exist in the `production` environment,** nor
  in `eas.json` or `app.json`. Check before every production build or
  update:

  ```bash
  npx eas-cli env:list --environment production
  ```

  Neither `EXPO_PUBLIC_ENABLE_PREMIUM_PREVIEW` nor
  `EXPO_PUBLIC_PREVIEW_BYPASS_TOKEN` may be in that list.

- **A second guard in the app:** a build on the `production` channel never
  shows the switch and never sends the key, even if a variable were set by
  mistake. `npm test` (`src/lib/premiumPreview.test.ts`) checks the switch's
  rules, and that `eas.json`, `app.json` and `.env.example` don't turn it on.
- **The key isn't secret from testers.** Anything with an `EXPO_PUBLIC_`
  name is written into the app, so anyone with the preview build could dig
  the key out of it and get scans analysed without paying. Keep preview
  builds to your testers, and change the key (or unset the secret) if one
  leaks. It can never reach a Play Store build, which is built and updated
  from the `production` environment.

### What stays real

- The free scan comes first, as for everyone, and is used up by the first
  finished scan.
- Purchases, restores and the subscription in Settings are unchanged, and
  RevenueCat isn't asked about scans the key lets through.
- **Analytics report reality:** a preview scan after the free one shows up
  as a completed scan (`scan_completed`, `results_viewed`) by someone with
  `is_premium` false, because that's what they are. Nothing records them as
  subscribed. The switch is saved on the phone only.
- The function logs each scan the key let through as
  `outcome: "preview_bypass"`, so they can be told apart from real ones.

### If scans after the free one are still turned down

"This scan needs a subscription", with a note that the server didn't accept
this build's preview key, means the key didn't match. The analyze-scan logs
(see its README, "Logs") say why, never with the key itself:

- `token_off`: the server has no `PREVIEW_BYPASS_TOKEN`, or it's shorter
  than 32 characters (there's a `startup` error for that).
- `token_rejected`: the two values differ. Set them again from the same
  key, and publish again.
- No `preview` line at all: the build didn't send a key. Check Preview
  premium is on, and that the update was published with
  `--environment preview` after the variable was created. The Testing note
  says "This test build has no preview key" when the build has none.

The steps to check it are in `docs/test-script.md`, "Premium preview check".

## What an update can't do

An update replaces the JavaScript bundle and the images and fonts it imports.
Anything compiled into the APK stays as it was. These need a new
`npm run build:preview` and a reinstall:

- **Native code:** adding, removing or upgrading a package that includes
  native code (most `expo-*` and `react-native-*` packages), or moving to a new
  Expo SDK.
- **Permissions:** any new or changed permission.
- **Native fields in `app.json`:** the name, icon, splash screen, Android
  package, scheme, orientation, permissions, and `plugins` with their options.
- **Build settings in `eas.json`.**

## Native changes need a new build and a new version

The runtime version is the `version` in `app.json`. So for any change in the
list above:

1. Make the change.
2. Raise `version` in `app.json`, for example from `1.0.0` to `1.0.1`.
3. Make a new build and install it.

Updates published after that carry runtime `1.0.1` and reach only builds made
at `1.0.1`. Older builds keep the last update they had. That stops JavaScript
that expects new native code from reaching an APK without it, where it would
crash.

The policy only reads the version number. It can't tell that a native change
happened:

- **Forget to raise the version**, and an update that needs new native code
  goes to every build on the old version, and they can crash on launch.
- **Raise the version without a new build**, and updates reach no one, because
  no installed build has that runtime yet.

Production builds raise `versionCode` on their own (`autoIncrement`). That
doesn't change the runtime version; only `version` does.

## Production updates reach real users

```bash
npx eas-cli update --channel production --environment production --message "<what changed>"
```

**This goes to everyone who installed the app from Play, on their next
launches, with no store review.** Only publish a change to `production` after
it has been published to the `preview` channel and checked on the preview
build, using the parts of `docs/test-script.md` it touches. The copy rules in
`CLAUDE.md` section 3 apply to an update exactly as they do to a store build.

## Good to know

- Crash reports from updated code still reach Sentry, tagged with the update.
  `eas update` doesn't upload source maps, though, so their stack traces point
  at the bundled code rather than at source lines.
- `eas update` writes the bundle to `dist/`, which git ignores.
