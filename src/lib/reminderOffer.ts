import type { PermissionState } from '@/lib/notifications';
import type { ReminderSettings } from '@/lib/reminderSettings';

/**
 * Which reminders question, if any, follows a scan's results. Pure, with
 * type-only imports, so it can be checked in plain Node.
 *
 * - `daily`: "Do you want daily reminders?", then the person's own time,
 *   picked right there. Asked after a scan while no daily routine reminder
 *   is set, until it's answered: Not now (or Back) ends it for good, and
 *   setting a reminder means there's nothing left to ask. Settings and
 *   Home's reminders card can always set one later.
 * - `weekly`: the older explanation of the weekly scan reminder, before the
 *   system prompt. Only when the daily question doesn't apply and
 *   notifications have never been asked about.
 *
 * Never more than one of them after a scan, and never once notifications
 * were refused: the system wouldn't ask again, so only the phone's settings
 * can turn them back on.
 */
export type AfterScanOffer = 'daily' | 'weekly';

export interface AfterScanOfferInputs {
  /** The reminder settings and the permission have been read. */
  loaded: boolean;
  permission: PermissionState;
  settings: Pick<ReminderSettings, 'enabled' | 'routine' | 'introSeen' | 'afterScanOfferDismissed'>;
}

export function afterScanOffer({
  loaded,
  permission,
  settings,
}: AfterScanOfferInputs): AfterScanOffer | null {
  if (!loaded || permission === 'denied') return null;
  // The master switch off is a choice too, so nothing is asked over it.
  if (settings.enabled && settings.routine === 'off' && !settings.afterScanOfferDismissed) {
    return 'daily';
  }
  if (permission === 'undetermined' && !settings.introSeen) return 'weekly';
  return null;
}
