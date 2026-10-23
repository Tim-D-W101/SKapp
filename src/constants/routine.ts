import type { IconName } from '@/components/ui/Icon';
import type { TintName } from '@/theme/colors';
import type { RoutineSlot } from '@/types/routine';

/**
 * From this local hour, the routine opens on the evening section; before it,
 * on the morning section.
 */
export const EVENING_FROM_HOUR = 14;

/** Extra wait after local midnight before starting the new day, so the clock has certainly turned. */
export const MIDNIGHT_GRACE_MS = 1000;

/** In the order Home and the routine list them. */
export const ROUTINE_SLOTS = ['morning', 'evening'] as const satisfies readonly RoutineSlot[];

/** Each section's colour, on Home and on the routine: a sunny morning, a lavender evening. */
export const ROUTINE_SLOT_TINTS = {
  morning: 'sun',
  evening: 'lavender',
} as const satisfies Record<RoutineSlot, TintName>;

/** Each section's icon, beside its name. */
export const ROUTINE_SLOT_ICONS = {
  morning: 'sun',
  evening: 'moon',
} as const satisfies Record<RoutineSlot, IconName>;

/** The section a link asks the routine to open on, if it names one. */
export function parseRoutineSlot(value: unknown): RoutineSlot | undefined {
  return ROUTINE_SLOTS.find((slot) => slot === value);
}
