import { create } from 'zustand';

import { ROUTINE_VISITS_BEFORE_OFFER } from '@/constants/reminders';
import { track } from '@/lib/analytics';
import { localDayKey } from '@/lib/dates';
import { logInDevelopment } from '@/lib/errors';
import {
  cancelReminders,
  readPermission,
  requestPermission,
  scheduleReminders,
  type PermissionState,
} from '@/lib/notifications';
import { fetchScanDates } from '@/lib/progress';
import { afterScanOffer as chooseAfterScanOffer, type AfterScanOffer } from '@/lib/reminderOffer';
import { planReminders, type PlannedReminder } from '@/lib/reminderPlan';
import {
  clearReminderSettings,
  DEFAULT_REMINDER_SETTINGS,
  readReminderSettings,
  writeReminderSettings,
  type ReminderSettings,
} from '@/lib/reminderSettings';
import { useAuthStore, type ActionResult } from '@/stores/useAuthStore';
import { useScanStore } from '@/stores/useScanStore';

export interface WeeklyReminderChanges {
  reminder_enabled?: boolean;
  reminder_weekday?: number;
  reminder_hour?: number;
}

interface ReminderState {
  loaded: boolean;
  permission: PermissionState;
  settings: ReminderSettings;
  /**
   * The plan last scheduled, soonest first, for the reminders card on Home.
   * Null until one has been made. Kept in memory only: it's rebuilt on every
   * app open.
   */
  plan: PlannedReminder[] | null;
  /** The last attempt to make the plan failed, most likely offline. */
  planFailed: boolean;

  /** Reads the settings and the permission. Never asks for permission. */
  load: () => Promise<void>;
  /** Which reminders question, if any, follows a scan's results (see reminderOffer.ts). */
  afterScanOffer: () => AfterScanOffer | null;
  /** Shows the system prompt (only after the in-app explanation) and schedules if allowed. */
  askPermission: () => Promise<PermissionState>;
  dismissIntro: () => void;
  /**
   * Not now to the daily reminders question after a scan: it isn't asked
   * again, nor is the routine tab's offer of the same reminder.
   */
  dismissAfterScanOffer: () => void;
  update: (
    changes: Partial<Pick<ReminderSettings, 'enabled' | 'streak' | 'routine' | 'routineTimes'>>,
  ) => void;
  /** The weekly reminder's switch, day and hour live on the profile. */
  updateWeekly: (changes: WeeklyReminderChanges) => Promise<ActionResult>;
  recordRoutineVisit: () => void;
  dismissRoutineOffer: () => void;
  /** Rebuilds the schedule from scratch. Cheap; call it whenever something changes. */
  reschedule: () => Promise<void>;
  reset: () => void;
}

// Outside the store: bookkeeping no screen renders.
let rescheduling: Promise<void> | null = null;
let rescheduleAgain = false;
let generation = 0;

export const useReminderStore = create<ReminderState>()((set, get) => {
  const saveSettings = (changes: Partial<ReminderSettings>) => {
    const settings = { ...get().settings, ...changes };
    set({ settings });
    void writeReminderSettings(settings);
  };

  const run = async () => {
    const started = generation;
    const { permission, settings } = get();
    const profile = useAuthStore.getState().profile;
    if (permission !== 'granted' || !profile) return;
    if (get().planFailed) set({ planFailed: false });

    let scanDates: string[];
    try {
      scanDates = await fetchScanDates();
    } catch (error: unknown) {
      // Offline: the schedule made last time stays as it is.
      logInDevelopment('Could not read scan dates for reminders', error);
      if (started === generation) set({ planFailed: true });
      return;
    }
    if (started !== generation) return;

    const now = new Date();
    const today = localDayKey(now);
    // Reminders already delivered today, so today gets no other.
    const deliveredToday = settings.scheduled.filter(
      (time) => time <= now.getTime() && localDayKey(new Date(time)) === today,
    );
    const plan = planReminders({
      now,
      enabled: settings.enabled,
      weekly: {
        enabled: profile.reminder_enabled,
        weekday: profile.reminder_weekday,
        hour: profile.reminder_hour,
      },
      streakEnabled: settings.streak,
      routine: settings.routine,
      routineTimes: settings.routineTimes,
      scanDates,
      usedDays: deliveredToday.length > 0 ? [today] : [],
    });

    try {
      await scheduleReminders(plan);
      if (started !== generation) return;
      saveSettings({
        scheduled: [...deliveredToday, ...plan.map((reminder) => reminder.date.getTime())],
      });
      set({ plan });
    } catch (error: unknown) {
      logInDevelopment('Could not schedule reminders', error);
      // Some of the old plan may have been cancelled already, so it can't be shown.
      if (started === generation) set({ plan: null, planFailed: true });
    }
  };

  return {
    loaded: false,
    permission: 'undetermined',
    settings: DEFAULT_REMINDER_SETTINGS,
    plan: null,
    planFailed: false,

    load: async () => {
      const started = generation;
      try {
        const [settings, permission] = await Promise.all([
          readReminderSettings(),
          readPermission(),
        ]);
        if (started !== generation) return;
        set({ loaded: true, settings, permission });
      } catch (error: unknown) {
        logInDevelopment('Could not load reminder settings', error);
        if (started === generation) set({ loaded: true });
      }
    },

    afterScanOffer: () => {
      const { loaded, permission, settings } = get();
      return chooseAfterScanOffer({ loaded, permission, settings });
    },

    askPermission: async () => {
      saveSettings({ introSeen: true });
      // Never the system prompt again once refused: Settings is the way back.
      if (get().permission === 'denied') return 'denied';
      try {
        const permission = await requestPermission();
        track('notification_permission', { granted: permission === 'granted' });
        set({ permission });
        if (permission === 'granted') await get().reschedule();
        return permission;
      } catch (error: unknown) {
        logInDevelopment('Could not ask for notification permission', error);
        return get().permission;
      }
    },

    dismissIntro: () => saveSettings({ introSeen: true }),

    // It explained reminders too, so the weekly explanation needn't follow.
    dismissAfterScanOffer: () =>
      saveSettings({ afterScanOfferDismissed: true, routineOfferDismissed: true, introSeen: true }),

    update: (changes) => {
      saveSettings(changes);
      void get().reschedule();
    },

    updateWeekly: async (changes) => {
      const result = await useAuthStore.getState().updateProfile(changes);
      if (result.ok) void get().reschedule();
      return result;
    },

    recordRoutineVisit: () => {
      const visits = get().settings.routineVisits;
      // Only counted up to the point where the offer appears.
      if (visits < ROUTINE_VISITS_BEFORE_OFFER) saveSettings({ routineVisits: visits + 1 });
    },

    dismissRoutineOffer: () => saveSettings({ routineOfferDismissed: true }),

    reschedule: () => {
      // One at a time; a request made meanwhile runs once more afterwards.
      if (rescheduling) {
        rescheduleAgain = true;
        return rescheduling;
      }
      const request = (async () => {
        do {
          rescheduleAgain = false;
          await run();
        } while (rescheduleAgain);
      })();
      rescheduling = request;
      void request.finally(() => {
        if (rescheduling === request) rescheduling = null;
      });
      return request;
    },

    reset: () => {
      generation += 1;
      rescheduling = null;
      rescheduleAgain = false;
      set({
        loaded: false,
        permission: 'undetermined',
        settings: DEFAULT_REMINDER_SETTINGS,
        plan: null,
        planFailed: false,
      });
      void clearReminderSettings();
      cancelReminders().catch((error: unknown) => {
        logInDevelopment('Could not cancel reminders', error);
      });
    },
  };
});

// A completed scan moves the weekly reminder to a week after it.
useScanStore.subscribe((state, previous) => {
  if (state.analysis.stage === 'complete' && previous.analysis.stage !== 'complete') {
    void useReminderStore.getState().reschedule();
  }
});

// Reminders belong to the account that set them up. A different user starts afresh.
useAuthStore.subscribe((state, previous) => {
  if (previous.user && state.user?.id !== previous.user.id) {
    useReminderStore.getState().reset();
    void useReminderStore.getState().load();
  }
});
