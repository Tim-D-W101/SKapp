import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip, Icon, SunMark, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import {
  AGE_BANDS,
  CONCERNS,
  GOALS,
  MAX_CONCERNS,
  SKIN_TYPES,
  type AgeBand,
  type Concern,
  type Goal,
  type SkinType,
} from '@/constants/onboarding';
import type { OnboardingAnswers } from '@/lib/onboarding';
import { layout, radius, sizes, spacing, useColors } from '@/theme/tokens';

import { ChoiceList, type ChoiceOption } from './ChoiceList';

const text = copy.onboarding;

const AGE_OPTIONS: readonly ChoiceOption<AgeBand>[] = AGE_BANDS.map((band) => ({
  value: band,
  label: text.ageBand.options[band],
}));

const SKIN_TYPE_OPTIONS: readonly ChoiceOption<SkinType>[] = SKIN_TYPES.map((type) => ({
  value: type,
  label: text.skinType.options[type].label,
  description: text.skinType.options[type].description,
}));

const GOAL_OPTIONS: readonly ChoiceOption<Goal>[] = GOALS.map((goal) => ({
  value: goal,
  label: text.goal.options[goal],
}));

interface StepBodyProps {
  title: string;
  body?: string;
  /** Shows the sun mark above the title, on the first and last steps. */
  mark?: boolean;
  children?: ReactNode;
}

/** Title, intro line and content for one step. Scrolls when a small screen needs it. */
function StepBody({ title, body, mark = false, children }: StepBodyProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.body}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {mark ? <SunMark /> : null}
      <View style={styles.intro}>
        <Text variant="h1" accessibilityRole="header">
          {title}
        </Text>
        {body ? <Text color="textSecondary">{body}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
}

export function WelcomeStep() {
  const palette = useColors();
  return (
    <StepBody title={text.welcome.title} body={text.welcome.body} mark>
      <View style={[styles.note, { backgroundColor: palette.surface }]}>
        <Icon name="info" size={sizes.icon.md} color="accentText" />
        <Text variant="bodySmall" color="textSecondary" style={styles.noteText}>
          {text.welcome.note}
        </Text>
      </View>
    </StepBody>
  );
}

interface SingleChoiceStepProps<T extends string> {
  value: T | null;
  onChange: (value: T) => void;
}

export function AgeBandStep({ value, onChange }: SingleChoiceStepProps<AgeBand>) {
  return (
    <StepBody title={text.ageBand.title} body={text.ageBand.body}>
      <ChoiceList
        options={AGE_OPTIONS}
        selected={value}
        onSelect={onChange}
        accessibilityLabel={text.ageBand.title}
      />
    </StepBody>
  );
}

export function SkinTypeStep({ value, onChange }: SingleChoiceStepProps<SkinType>) {
  return (
    <StepBody title={text.skinType.title} body={text.skinType.body}>
      <ChoiceList
        options={SKIN_TYPE_OPTIONS}
        selected={value}
        onSelect={onChange}
        accessibilityLabel={text.skinType.title}
      />
    </StepBody>
  );
}

export interface ConcernsStepProps {
  value: readonly Concern[];
  onToggle: (concern: Concern) => void;
  /** Set after a tap that would go past the maximum. */
  limitReached: boolean;
}

export function ConcernsStep({ value, onToggle, limitReached }: ConcernsStepProps) {
  return (
    <StepBody title={text.concerns.title} body={text.concerns.body}>
      <View style={styles.chips}>
        {CONCERNS.map((concern) => (
          <Chip
            key={concern}
            label={text.concerns.options[concern]}
            selected={value.includes(concern)}
            onPress={() => onToggle(concern)}
          />
        ))}
      </View>
      <View style={styles.counter} accessibilityLiveRegion="polite">
        <Text variant="bodySmall" color="textSecondary">
          {text.concerns.counter(value.length, MAX_CONCERNS)}
        </Text>
        {limitReached ? (
          <Text variant="bodySmall">{text.concerns.limitReached(MAX_CONCERNS)}</Text>
        ) : null}
      </View>
    </StepBody>
  );
}

export function GoalStep({ value, onChange }: SingleChoiceStepProps<Goal>) {
  return (
    <StepBody title={text.goal.title} body={text.goal.body}>
      <ChoiceList
        options={GOAL_OPTIONS}
        selected={value}
        onSelect={onChange}
        accessibilityLabel={text.goal.title}
      />
    </StepBody>
  );
}

export function ReadyStep({ answers }: { answers: OnboardingAnswers }) {
  const goal = answers.goal ? text.ready.goals[answers.goal] : null;
  let summary: string | undefined;
  if (goal) {
    summary =
      answers.skinType === null || answers.skinType === 'unsure'
        ? text.ready.summaryUnsure(goal)
        : text.ready.summary(text.ready.skinTypes[answers.skinType], goal);
  }

  return <StepBody title={text.ready.title} body={summary} mark />;
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    gap: spacing.lg,
    padding: layout.gutter,
  },
  intro: {
    gap: spacing.sm,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  noteText: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  counter: {
    gap: spacing.xs,
  },
});
