import { useLocalSearchParams } from 'expo-router';

import { RoutineScreen } from '@/components/routine/RoutineScreen';
import { parseRoutineSlot } from '@/constants/routine';

export default function Routine() {
  const { slot } = useLocalSearchParams<{ slot?: string }>();
  return <RoutineScreen openSlot={parseRoutineSlot(slot)} />;
}
