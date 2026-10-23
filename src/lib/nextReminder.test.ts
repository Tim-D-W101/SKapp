import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BANNED_TERMS } from '../../supabase/functions/analyze-scan/prompt.ts';
import { copy } from '../constants/copy.ts';
import type { PlannedReminder } from './reminderPlan.ts';

import {
  relativeDay,
  reminderName,
  remindersCardState,
  type RemindersCardInputs,
  type ReminderName,
} from './nextReminder.ts';

// A zone with daylight saving, set before any date is made, so the
// calendar-day checks give the same answers on every machine.
process.env.TZ = 'Europe/London';

/** As in constants/reminders.ts. */
const ROUTINE_HOURS = { morning: 8, evening: 20 } as const;

/** Friday 23 October 2026, 10:30 local time. */
const NOW = new Date(2026, 9, 23, 10, 30);

function reminder(kind: PlannedReminder['kind'], date: Date): PlannedReminder {
  return { kind, date, title: 'Title', body: 'Body' };
}

/** Allowed, switched on, and a plan already made: the usual state once the app is open. */
function inputs(changes: Partial<RemindersCardInputs> = {}): RemindersCardInputs {
  return {
    now: NOW,
    loaded: true,
    permission: 'granted',
    enabled: true,
    plan: [],
    planFailed: false,
    routineHours: ROUTINE_HOURS,
    ...changes,
  };
}

describe('remindersCardState', () => {
  const plan = [
    reminder('routine', new Date(2026, 9, 23, 20)),
    reminder('weekly', new Date(2026, 9, 25, 19)),
  ];

  it('waits for the settings and the permission to be read', () => {
    assert.deepEqual(remindersCardState(inputs({ loaded: false, plan })), { kind: 'loading' });
  });

  it('asks for permission before anything else, whatever is switched on', () => {
    assert.deepEqual(remindersCardState(inputs({ permission: 'undetermined', plan })), {
      kind: 'needsPermission',
    });
    assert.deepEqual(
      remindersCardState(inputs({ permission: 'undetermined', enabled: false, plan: null })),
      { kind: 'needsPermission' },
    );
  });

  it('points to the phone settings once notifications were refused', () => {
    assert.deepEqual(remindersCardState(inputs({ permission: 'denied', plan })), {
      kind: 'blocked',
    });
  });

  it('is off when the master switch is, even with an old plan', () => {
    assert.deepEqual(remindersCardState(inputs({ enabled: false, plan })), { kind: 'off' });
    assert.deepEqual(remindersCardState(inputs({ enabled: false, plan: null, planFailed: true })), {
      kind: 'off',
    });
  });

  it('waits for the first plan, or says it failed', () => {
    assert.deepEqual(remindersCardState(inputs({ plan: null })), { kind: 'loading' });
    assert.deepEqual(remindersCardState(inputs({ plan: null, planFailed: true })), {
      kind: 'failed',
    });
  });

  it('keeps showing the last plan when a later attempt failed', () => {
    assert.deepEqual(remindersCardState(inputs({ plan, planFailed: true })), {
      kind: 'next',
      name: 'evening',
      date: plan[0].date,
    });
  });

  it('shows the soonest reminder still to come', () => {
    const passed = reminder('routine', new Date(2026, 9, 23, 8));
    assert.deepEqual(remindersCardState(inputs({ plan: [passed, ...plan] })), {
      kind: 'next',
      name: 'evening',
      date: plan[0].date,
    });
  });

  it('has nothing to show when nothing in the plan is still to come', () => {
    assert.deepEqual(remindersCardState(inputs({ plan: [] })), { kind: 'none' });
    const passed = [reminder('routine', new Date(2026, 9, 23, 8)), reminder('weekly', NOW)];
    assert.deepEqual(remindersCardState(inputs({ plan: passed })), { kind: 'none' });
  });
});

describe('reminderName', () => {
  it('names the weekly and streak reminders by their kind', () => {
    assert.equal(reminderName(reminder('weekly', NOW), ROUTINE_HOURS), 'weekly');
    assert.equal(reminderName(reminder('streak', NOW), ROUTINE_HOURS), 'streak');
  });

  it('tells a morning routine reminder from an evening one by its hour', () => {
    const morning = reminder('routine', new Date(2026, 9, 24, ROUTINE_HOURS.morning));
    const evening = reminder('routine', new Date(2026, 9, 24, ROUTINE_HOURS.evening));
    assert.equal(reminderName(morning, ROUTINE_HOURS), 'morning');
    assert.equal(reminderName(evening, ROUTINE_HOURS), 'evening');
  });
});

describe('relativeDay', () => {
  it('is today for later the same day', () => {
    assert.deepEqual(relativeDay(new Date(2026, 9, 23, 23, 59), NOW), { kind: 'today' });
  });

  it('is tomorrow for any time the next day, even just after midnight', () => {
    assert.deepEqual(relativeDay(new Date(2026, 9, 24, 0, 1), NOW), { kind: 'tomorrow' });
    assert.deepEqual(relativeDay(new Date(2026, 9, 24, 20), NOW), { kind: 'tomorrow' });
  });

  it('names the day for the rest of the coming week', () => {
    // Sunday 25 October: the clocks go back an hour overnight in London.
    assert.deepEqual(relativeDay(new Date(2026, 9, 25, 19), NOW), { kind: 'weekday', weekday: 0 });
    assert.deepEqual(relativeDay(new Date(2026, 9, 29, 8), NOW), { kind: 'weekday', weekday: 4 });
  });

  it('is later from a week away', () => {
    assert.deepEqual(relativeDay(new Date(2026, 9, 30, 8), NOW), { kind: 'later' });
    assert.deepEqual(relativeDay(new Date(2026, 10, 5, 19), NOW), { kind: 'later' });
  });

  it('counts calendar days across the spring change too', () => {
    // Saturday 28 March 2027, the night before the clocks go forward.
    const saturday = new Date(2027, 2, 27, 22);
    assert.deepEqual(relativeDay(new Date(2027, 2, 28, 8), saturday), { kind: 'tomorrow' });
    assert.deepEqual(relativeDay(new Date(2027, 2, 29, 8), saturday), {
      kind: 'weekday',
      weekday: 1,
    });
  });
});

describe('the reminders card copy', () => {
  const words = copy.home.reminders;

  it('says what is next and when', () => {
    assert.equal(
      words.next('morning', { kind: 'tomorrow' }, '8:00 am', '24 Oct 2026'),
      'Next reminder: Morning routine, tomorrow at 8:00 am',
    );
    assert.equal(
      words.next('evening', { kind: 'today' }, '8:00 pm', '23 Oct 2026'),
      'Next reminder: Evening routine, today at 8:00 pm',
    );
    assert.equal(
      words.next('weekly', { kind: 'weekday', weekday: 0 }, '7:00 pm', '25 Oct 2026'),
      'Next reminder: Weekly scan, Sunday at 7:00 pm',
    );
    assert.equal(
      words.next('streak', { kind: 'weekday', weekday: 6 }, '6:00 pm', '31 Oct 2026'),
      'Next reminder: Weekly streak, Saturday at 6:00 pm',
    );
    assert.equal(
      words.next('weekly', { kind: 'later' }, '7:00 pm', '1 Nov 2026'),
      'Next reminder: Weekly scan, 1 Nov 2026 at 7:00 pm',
    );
  });

  it('names every day of the week the way the day picker does', () => {
    for (const day of copy.settings.reminders.weekdays) {
      assert.equal(
        words.next('weekly', { kind: 'weekday', weekday: day.value }, '9:00 am', 'date'),
        `Next reminder: Weekly scan, ${day.name} at 9:00 am`,
      );
    }
  });

  it('stays within the cosmetic vocabulary', () => {
    const names: ReminderName[] = ['weekly', 'streak', 'morning', 'evening'];
    const strings = [
      words.title,
      words.off,
      words.none,
      words.noneBody,
      words.loadFailed,
      words.turnOn,
      words.change,
      words.changeHint,
      words.turnOnHint,
      words.cardLabel(words.off),
      ...names.map((name) => words.next(name, { kind: 'today' }, '8:00 am', 'date')),
    ];
    for (const text of strings) {
      for (const term of BANNED_TERMS) {
        assert.doesNotMatch(text, new RegExp(`\\b${term}`, 'i'), `"${term}" in "${text}"`);
      }
    }
  });
});
