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
