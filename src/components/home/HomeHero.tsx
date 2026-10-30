import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, ChangePill, Icon, SunMark, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { startScan } from '@/lib/access';
import { calendarDaysBetween, formatDayMonth, formatShortDate } from '@/lib/dates';
import { nextScanDate, type ScanRecord } from '@/lib/progress';
import { layout, opacity, radius, shadows, sizes, spacing, useColors } from '@/theme/tokens';

export interface HomeHeroProps {
  /** Completed scans, oldest first. Empty before the first scan, or while they load. */
  records: ScanRecord[];
  /** Whether the history has loaded: an empty history only means "no scans yet" once it has. */
  loaded: boolean;
}

/**
 * The teal panel at the top of Home: where your skin stands and the next
 * step. With scans, the latest overall score large, a peach pill for how it
 * moved since the scan before, a meter for where it sits out of 100, and the
 * journey since the first scan; tapping any of that opens the scan's
 * results. Before the first scan, the sun mark and what the first scan is
 * for. Always "Scan my skin", which starts a scan the same way every scan
 * button does, with when the next weekly scan is suggested under it.
 */
export function HomeHero({ records, loaded }: HomeHeroProps) {
  const palette = useColors();
  const latest = records.length > 0 ? records[records.length - 1].result : null;
  const next = latest ? nextScanDate(latest.createdAt) : null;

  return (
    <View style={[styles.panel, { backgroundColor: palette.brand }, shadows.md]}>
      {latest ? (
        <LatestScore records={records} />
      ) : loaded ? (
        <View style={styles.first}>
          <SunMark width={sizes.hero.mark} on="brand" />
          <Text variant="h2" color="onBrand" align="center" accessibilityRole="header">
            {copy.home.hero.firstTitle}
          </Text>
          <Text color="onBrandSecondary" align="center">
            {copy.home.hero.firstBody}
          </Text>
        </View>
      ) : (
        <Text color="onBrandSecondary">{copy.home.scan.body}</Text>
      )}

      <View style={styles.action}>
        <Button
          label={copy.home.scan.title}
          accessibilityHint={copy.home.scan.hint}
          leadingIcon="camera"
          onPress={startScan}
          variant="onBrand"
          size="lg"
          fullWidth
        />
        {latest ? (
          <Text variant="bodySmall" color="onBrandSecondary" align="center">
            {next ? copy.home.hero.nextScan(next) : copy.home.hero.due}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** The latest score, its change and the journey so far. Opens that scan's results. */
function LatestScore({ records }: { records: ScanRecord[] }) {
  const palette = useColors();
  const first = records[0].result;
  const latest = records[records.length - 1].result;
  const previous = records.length > 1 ? records[records.length - 2].result : null;
  const change = previous ? latest.overall - previous.overall : null;
  const changeText = change !== null ? copy.home.hero.change(change) : null;
  const peach = palette.tints.peach;
  const meter = Math.min(100, Math.max(0, latest.overall));
  const days = calendarDaysBetween(first.createdAt, latest.createdAt);
  const journey = previous
    ? copy.home.hero.journey(
        copy.progress.journey(latest.overall - first.overall, copy.progress.journeySpan(days)),
      )
    : copy.home.hero.oneScan;

  return (
    <Pressable
      onPress={() => router.push(`/progress/${latest.scanId}`)}
      accessibilityRole="button"
      accessibilityLabel={copy.home.latest.label(
        latest.overall,
        copy.home.latestDate(formatShortDate(latest.createdAt)),
        ...(changeText ? [changeText, journey] : [journey]),
      )}
      accessibilityHint={copy.home.latest.hint}
      style={({ pressed }) => [styles.score, pressed ? styles.pressed : null]}
    >
      <View style={styles.labelRow}>
        <Text variant="label" color="onBrandSecondary" style={styles.label}>
          {copy.home.hero.scoreLabel(formatDayMonth(latest.createdAt))}
        </Text>
        <View style={styles.link}>
          <Text variant="label" color="onBrand">
            {copy.home.hero.seeResults}
          </Text>
          <Icon name="chevronRight" size={sizes.icon.md} color="onBrand" />
        </View>
      </View>

      <View style={styles.numberRow}>
        <Text variant="score" color="onBrand">
          {latest.overall}
        </Text>
        {change !== null && changeText ? (
          <ChangePill
            points={change}
            label={changeText}
            background={peach.fill}
            ink={peach.onFill}
          />
        ) : null}
      </View>

      {/* Where the score sits out of 100. Decorative: the number says it. */}
      <View
        style={[styles.meter, { backgroundColor: palette.brandTrack }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View
          style={[
            styles.meterFill,
            { width: `${meter}%`, backgroundColor: palette.tints.mint.fill },
          ]}
        />
      </View>

      <Text variant="bodySmall" color="onBrandSecondary">
        {journey}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.lg,
    padding: layout.cardPadding,
    borderRadius: radius.xl,
  },
  first: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  score: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    flex: 1,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  numberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.md,
    rowGap: spacing.xs,
  },
  meter: {
    height: sizes.hero.meter,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  action: {
    gap: spacing.sm,
  },
});
