import { useLocalSearchParams } from 'expo-router';

import { PaywallScreen } from '@/components/paywall/PaywallScreen';
import { parsePaywallTrigger } from '@/constants/subscription';

export default function Paywall() {
  const { trigger } = useLocalSearchParams<{ trigger?: string }>();
  return <PaywallScreen trigger={parsePaywallTrigger(trigger)} />;
}
