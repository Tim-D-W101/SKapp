import { useLocalSearchParams } from 'expo-router';

import { DailyReminderOfferScreen } from '@/components/scan/DailyReminderOfferScreen';
import { RemindersIntroScreen } from '@/components/scan/RemindersIntroScreen';

const NEXT_ROUTES = ['/', '/routine', '/progress'] as const;

export default function Reminders() {
  const { next, offer } = useLocalSearchParams<{ next?: string; offer?: string }>();
  const target = NEXT_ROUTES.find((route) => route === next) ?? '/';
  if (offer === 'weekly') return <RemindersIntroScreen next={target} />;
  return <DailyReminderOfferScreen next={target} />;
}
