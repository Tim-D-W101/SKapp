import type { ColorSchemeName } from '@/theme/colors';

/**
 * What the app's colours follow, chosen under Appearance in Settings: the
 * phone's own light or dark setting, or always light, or always dark.
 */
export type AppearancePreference = 'system' | 'light' | 'dark';

/** In the order Settings lists them. */
export const APPEARANCE_PREFERENCES = [
  'system',
  'light',
  'dark',
] as const satisfies readonly AppearancePreference[];

/** New installs, and anyone who has never changed it, follow the phone. */
export const DEFAULT_APPEARANCE: AppearancePreference = 'system';

/** A saved value, if it is one of the choices. Anything else, including nothing saved, is null. */
export function parseAppearancePreference(value: unknown): AppearancePreference | null {
  return APPEARANCE_PREFERENCES.find((choice) => choice === value) ?? null;
}

/**
 * The palette to draw with: the fixed choice, or, when following the phone,
 * its setting. A phone that reports neither light nor dark is drawn light.
 */
export function resolveColorScheme(
  preference: AppearancePreference,
  system: string | null | undefined,
): ColorSchemeName {
  if (preference !== 'system') return preference;
  return system === 'dark' ? 'dark' : 'light';
}
