import type { UserProfile, WeightEntry } from '../types';
import { getTimestamp } from './dateHelpers';

export interface GoalProgressData {
  startWeight: number | null;
  currentWeight: number | null;
  totalToLose: number | null;
  weightLost: number | null;
  weightToGo: number | null;
  progress: number;
}

interface CalculateGoalProgressDataParams {
  weights: WeightEntry[];
  startWeight: UserProfile['startWeight'];
  goalWeight: UserProfile['goalWeight'];
}

interface GoalProgressSubtitleParams {
  hasWeights: boolean;
  hasGoalWeight: boolean;
  progress: number;
  weightLost: number | null;
  weightToGo: number | null;
  formatWeight: (weightInKg: number) => string;
}

interface FormattedWeightLostParams {
  weightLost: number | null;
  formatWeight: (weightInKg: number) => string;
}

interface GoalWeightModalValueParams {
  goalWeight: UserProfile['goalWeight'];
  startWeight: number | null;
  currentWeight: number | null;
}

export const getWeightTimestamp = (entry: WeightEntry) => {
  const timestamp = getTimestamp(entry.dateTime);

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const timestampFromId = entry.id?.split('_')[1];

  return timestampFromId ? Number(timestampFromId) : 0;
};

export const sortWeightsByDateTimeAscending = (weights: WeightEntry[]) => {
  return [...weights].sort(
    (firstWeight, secondWeight) =>
      getWeightTimestamp(firstWeight) - getWeightTimestamp(secondWeight)
  );
};

export const calculateGoalProgressData = ({
  weights,
  startWeight,
  goalWeight,
}: CalculateGoalProgressDataParams): GoalProgressData => {
  const sortedWeights = sortWeightsByDateTimeAscending(weights);

  const firstWeightEntry = sortedWeights[0] ?? null;
  const latestWeightEntry = sortedWeights[sortedWeights.length - 1] ?? null;

  const resolvedStartWeight = startWeight ?? firstWeightEntry?.weight ?? null;
  const currentWeight = latestWeightEntry?.weight ?? null;

  if (typeof goalWeight !== 'number') {
    return {
      startWeight: resolvedStartWeight,
      currentWeight,
      totalToLose: null,
      weightLost: null,
      weightToGo: null,
      progress: 0,
    };
  }

  if (typeof resolvedStartWeight !== 'number') {
    return {
      startWeight: null,
      currentWeight,
      totalToLose: null,
      weightLost: null,
      weightToGo: null,
      progress: 0,
    };
  }

  const weightForProgress = currentWeight ?? resolvedStartWeight;
  const totalToLose = resolvedStartWeight - goalWeight;
  const weightLost = resolvedStartWeight - weightForProgress;
  const weightToGo = Math.max(0, weightForProgress - goalWeight);

  const rawProgress = totalToLose > 0 ? (weightLost / totalToLose) * 100 : 0;
  const progress = Math.round(Math.min(100, Math.max(0, rawProgress)));

  return {
    startWeight: resolvedStartWeight,
    currentWeight,
    totalToLose,
    weightLost,
    weightToGo,
    progress,
  };
};

export const getGoalProgressSubtitle = ({
  hasWeights,
  hasGoalWeight,
  progress,
  weightLost,
  weightToGo,
  formatWeight,
}: GoalProgressSubtitleParams) => {
  if (!hasGoalWeight) {
    return 'Set a goal weight to start tracking your progress toward it.';
  }

  if (!hasWeights) {
    return 'Add your first weight check-in to start seeing your goal progress.';
  }

  if (typeof weightLost === 'number' && weightLost < 0) {
    return 'A little bump up is okay. Progress is not always linear — your next check-in is a fresh start.';
  }

  if (progress <= 0) {
    return 'Your goal journey has started. Add weight updates to watch your progress grow.';
  }

  if (progress < 25) {
    return `You’re ${progress}% of the way to your goal. Small steps still count.`;
  }

  if (progress < 50) {
    return `You’re ${progress}% of the way there. Those small wins are adding up.`;
  }

  if (progress < 75) {
    return `You’re ${progress}% of the way to your goal. That’s real progress.`;
  }

  if (progress < 100) {
    return `You’re ${progress}% of the way there. Only ${formatWeight(weightToGo ?? 0)} to go.`;
  }

  return 'Goal reached. That’s a huge milestone — amazing work.';
};

export const getFormattedWeightLost = ({ weightLost, formatWeight }: FormattedWeightLostParams) => {
  if (weightLost === null) {
    return {
      text: '—',
      className: '',
    };
  }

  if (weightLost > 0) {
    return {
      text: `-${formatWeight(weightLost)}`,
      className: 'positive',
    };
  }

  if (weightLost < 0) {
    return {
      text: `+${formatWeight(Math.abs(weightLost))}`,
      className: 'negative',
    };
  }

  return {
    text: formatWeight(0),
    className: '',
  };
};

export const getGoalWeightModalValue = ({
  goalWeight,
  startWeight,
  currentWeight,
}: GoalWeightModalValueParams) => {
  if (typeof goalWeight === 'number') {
    return goalWeight;
  }

  if (typeof currentWeight === 'number') {
    return currentWeight;
  }

  if (typeof startWeight === 'number') {
    return startWeight;
  }

  return 0;
};
