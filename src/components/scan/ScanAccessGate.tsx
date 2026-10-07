import { Redirect } from 'expo-router';
import { useState, type ReactNode } from 'react';

import { LoadingState, Screen } from '@/components/ui';
import { copy } from '@/constants/copy';
import { useScanAccess } from '@/lib/access';

export interface ScanAccessGateProps {
  children: ReactNode;
}

/**
 * Lets a new scan start only with the free scan or a subscription, and opens
 * the paywall otherwise. The entry points already check; this catches any
 * other way into the camera. The server checks again before any analysis.
 */
export function ScanAccessGate({ children }: ScanAccessGateProps) {
  const access = useScanAccess();
  // Once allowed, allowed for as long as this screen is mounted. The camera
  // stays mounted under the results while a scan finishes, and the free scan
  // being used up then must not send anyone to the paywall.
  const [allowed, setAllowed] = useState(access === 'allowed');
  if (access === 'allowed' && !allowed) setAllowed(true);

  if (allowed) return children;
  if (access === 'subscribe') {
    return <Redirect href={{ pathname: '/paywall', params: { trigger: 'scan' } }} />;
  }
  return (
    <Screen>
      <LoadingState variant="spinner" accessibilityLabel={copy.scan.checkingAccess} />
    </Screen>
  );
}
