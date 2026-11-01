import type { WeightEntry } from '../../../shared/types';

export type WeightLossAchievementStatus = 'completed' | 'upcoming' | 'locked';

export type WeightLossAchievement = {
  id: string;
  thresholdKg: number;
  status: WeightLossAchievementStatus;
  progress: number;
  remainingKg: number;
  achievedAt?: string;
};

export type WeightLossMilestones = {
  achievements: WeightLossAchievement[];
  nextAchievement: WeightLossAchievement | null;
  currentLossKg: number | null;
};

const WEIGHT_LOSS_INTERVAL_KG = 5;
const DEFAULT_ADDITIONAL_LOCKED_ACHIEVEMENTS = 2;

const isValidWeight = (weight: unknown): weight is number =>
  typeof weight === 'number' && Number.isFinite(weight) && weight > 0;

const clampProgress = (progress: number) => Math.min(Math.max(progress, 0), 100);

export const generateWeightLossMilestones = (
  weights: WeightEntry[],
  startWeight: number | null | undefined,
  additionalLockedAchievements = DEFAULT_ADDITIONAL_LOCKED_ACHIEVEMENTS
): WeightLossMilestones => {
  if (!isValidWeight(startWeight)) {
    return { achievements: [], nextAchievement: null, currentLossKg: null };
  }

  const validWeights = weights
    .filter((entry) => isValidWeight(entry.weight) && Number.isFinite(Date.parse(entry.dateTime)))
    .sort((first, second) => Date.parse(first.dateTime) - Date.parse(second.dateTime));

  const latestWeight = validWeights.at(-1);

  if (!latestWeight) {
    return { achievements: [], nextAchievement: null, currentLossKg: null };
  }

  const currentLossKg = startWeight - latestWeight.weight;
  const achievementDates = new Map<number, string>();

  for (const entry of validWeights) {
    const recordedLoss = startWeight - entry.weight;

    for (
      let thresholdKg = WEIGHT_LOSS_INTERVAL_KG;
      thresholdKg <= recordedLoss;
      thresholdKg += WEIGHT_LOSS_INTERVAL_KG
    ) {
      if (!achievementDates.has(thresholdKg)) {
        achievementDates.set(thresholdKg, entry.dateTime);
      }
    }
  }

  const highestAchievedThreshold = achievementDates.size * WEIGHT_LOSS_INTERVAL_KG;
  const nextThreshold = highestAchievedThreshold + WEIGHT_LOSS_INTERVAL_KG;
  const intervalStart = nextThreshold - WEIGHT_LOSS_INTERVAL_KG;
  const nextProgress = clampProgress(
    ((currentLossKg - intervalStart) / WEIGHT_LOSS_INTERVAL_KG) * 100
  );
  const lockedCount = Math.max(0, Math.floor(additionalLockedAchievements));

  const completedAchievements: WeightLossAchievement[] = [...achievementDates.entries()].map(
    ([thresholdKg, achievedAt]) => ({
      id: `weight-loss-${thresholdKg}kg`,
      thresholdKg,
      status: 'completed',
      progress: 100,
      remainingKg: 0,
      achievedAt,
    })
  );

  const nextAchievement: WeightLossAchievement = {
    id: `weight-loss-${nextThreshold}kg`,
    thresholdKg: nextThreshold,
    status: 'upcoming',
    progress: nextProgress,
    remainingKg: Math.max(nextThreshold - currentLossKg, 0),
  };

  const lockedAchievements = Array.from({ length: lockedCount }, (_, index) => {
    const thresholdKg = nextThreshold + WEIGHT_LOSS_INTERVAL_KG * (index + 1);

    return {
      id: `weight-loss-${thresholdKg}kg`,
      thresholdKg,
      status: 'locked' as const,
      progress: 0,
      remainingKg: Math.max(thresholdKg - currentLossKg, 0),
    };
  });

  return {
    achievements: [...completedAchievements, nextAchievement, ...lockedAchievements],
    nextAchievement,
    currentLossKg,
  };
};
