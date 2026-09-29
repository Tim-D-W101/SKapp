// Expo's default Metro config, with Sentry's additions so crash reports can
// be matched to the original source (README > Crash reporting).
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

module.exports = getSentryExpoConfig(__dirname);
