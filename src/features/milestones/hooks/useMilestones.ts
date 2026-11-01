import { useCallback, useMemo } from 'react';
import { useUnitSettings } from '../../../shared/hooks/useUnitSettings';
import type { ShotEntry, WeightEntry } from '../../../shared/types';
import {
  formatDateLabel,
  getDateValueFromDateTime,
  getTimestamp,
} from '../../../shared/utils/dateHelpers';
import { useProfile } from '../../profile/ProfileContext';

export type MilestoneStatus = 'completed' | 'inProgress' | 'locked';

export type MilestoneIcon = 'star' | 'target' | 'trend' | 'zap' | 'party';

export type Milestone = {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  progress?: number;
  icon: MilestoneIcon;
  order: number;
};

type UseMilestonesParams = {
  weights: WeightEntry[];
  shots: ShotEntry[];
  startWeight?: number | null;
  goalWeight?: number | null;
  maxVisible?: number;
};

const clampProgress = (value: number) => {
  return Math.min(Math.max(value, 0), 100);
};

const getWeightDateTime = (entry: WeightEntry) => {
  return entry.dateTime ?? entry.dateTime;
};

const getWeightTimestamp = (entry: WeightEntry) => {
  const timestamp = getTimestamp(getWeightDateTime(entry));

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const timestampFromId = entry.id?.split('_')[1];

  return timestampFromId ? Number(timestampFromId) : 0;
};

const getShotTimestamp = (entry: ShotEntry) => {
  const timestamp = getTimestamp(entry.dateTime);

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const timestampFromId = entry.id?.split('_')[1];

  return timestampFromId ? Number(timestampFromId) : 0;
};

const getLatestWeight = (weights: WeightEntry[]) => {
  return [...weights].sort((a, b) => getWeightTimestamp(b) - getWeightTimestamp(a))[0];
};

const getFirstShotDate = (shots: ShotEntry[]) => {
  return [...shots].sort((a, b) => getShotTimestamp(a) - getShotTimestamp(b))[0]?.dateTime;
};

const getFirstWeightDateTime = (weights: WeightEntry[]) => {
  const firstWeight = [...weights].sort((a, b) => getWeightTimestamp(a) - getWeightTimestamp(b))[0];

  return firstWeight ? getWeightDateTime(firstWeight) : undefined;
};

const getWeightLossMilestoneStatus = (currentLoss: number, targetLoss: number): MilestoneStatus => {
  if (currentLoss >= targetLoss) {
    return 'completed';
  }

  if (currentLoss > 0) {
    return 'inProgress';
  }

  return 'locked';
};

const getProgressMilestoneStatus = (progress: number, targetProgress: number): MilestoneStatus => {
  if (progress >= targetProgress) {
    return 'completed';
  }

  if (progress > 0) {
    return 'inProgress';
  }

  return 'locked';
};

const getCountMilestoneStatus = (count: number, target: number): MilestoneStatus => {
  if (count >= target) {
    return 'completed';
  }

  if (count > 0) {
    return 'inProgress';
  }

  return 'locked';
};

const getWeightLossDescription = (
  currentLoss: number,
  targetLoss: number,
  formatWeight: (weightInKg: number) => string
) => {
  if (currentLoss >= targetLoss) {
    return 'Unlocked';
  }

  if (currentLoss > 0) {
    return `${formatWeight(Math.max(targetLoss - currentLoss, 0))} left`;
  }

  return `${formatWeight(targetLoss)} to unlock`;
};

const getGoalProgressDescription = (progress: number, targetProgress: number) => {
  if (progress >= targetProgress) {
    return 'Unlocked';
  }

  if (progress > 0) {
    return `${Math.max(targetProgress - progress, 0).toFixed(0)}% left`;
  }

  return `Reach ${targetProgress}% of your goal`;
};

const getWeightEntryDescription = (count: number, target: number) => {
  if (count >= target) {
    return 'Unlocked';
  }

  if (count > 0) {
    return `${Math.max(target - count, 0)} weight entries left`;
  }

  return `Log ${target} weight entries`;
};

const getTrendWinDescription = (trendWins: number, target: number) => {
  if (trendWins >= target) {
    return 'Unlocked';
  }

  if (trendWins > 0) {
    return `${Math.max(target - trendWins, 0)} lower weigh-ins left`;
  }

  return `Have ${target} weigh-ins lower than the previous one`;
};

const getUniqueWeightDays = (weights: WeightEntry[]) => {
  return new Set(
    weights.map((weight) => {
      return getDateValueFromDateTime(getWeightDateTime(weight));
    })
  ).size;
};

const getTrendWins = (weights: WeightEntry[]) => {
  const sortedWeights = [...weights].sort((a, b) => getWeightTimestamp(a) - getWeightTimestamp(b));

  return sortedWeights.reduce((wins, weight, index) => {
    const previousWeight = sortedWeights[index - 1];

    if (!previousWeight) {
      return wins;
    }

    return weight.weight < previousWeight.weight ? wins + 1 : wins;
  }, 0);
};

const sortMilestones = (milestones: Milestone[]) => {
  const statusRank: Record<MilestoneStatus, number> = {
    inProgress: 0,
    locked: 1,
    completed: 2,
  };

  return [...milestones].sort((a, b) => {
    const statusDifference = statusRank[a.status] - statusRank[b.status];

    if (statusDifference !== 0) {
      return statusDifference;
    }

    if (a.status === 'inProgress' && b.status === 'inProgress') {
      return (b.progress ?? 0) - (a.progress ?? 0);
    }

    return a.order - b.order;
  });
};

export const useMilestones = ({
  weights,
  shots,
  startWeight,
  goalWeight,
  maxVisible,
}: UseMilestonesParams) => {
  const { unitSystem } = useProfile();
  const { weightUnit, displayWeightFromKg } = useUnitSettings(unitSystem);

  const formatWeight = useCallback(
    (weightInKg: number) => {
      return `${displayWeightFromKg(weightInKg)} ${weightUnit}`;
    },
    [displayWeightFromKg, weightUnit]
  );

  const milestones = useMemo<Milestone[]>(() => {
    const latestWeightEntry = getLatestWeight(weights);
    const latestWeight = latestWeightEntry?.weight ?? null;

    const hasStartWeight = typeof startWeight === 'number' && startWeight > 0;
    const hasGoalWeight = typeof goalWeight === 'number' && goalWeight > 0;
    const hasLatestWeight = typeof latestWeight === 'number';

    const currentLoss = hasStartWeight && hasLatestWeight ? startWeight - latestWeight : 0;
    const safeCurrentLoss = Math.max(currentLoss, 0);

    const goalLoss = hasStartWeight && hasGoalWeight ? startWeight - goalWeight : 0;
    const goalProgress = goalLoss > 0 ? clampProgress((safeCurrentLoss / goalLoss) * 100) : 0;

    const firstShotDate = getFirstShotDate(shots);
    const firstWeightDateTime = getFirstWeightDateTime(weights);

    const uniqueWeightDays = getUniqueWeightDays(weights);
    const trendWins = getTrendWins(weights);

    const goalWeightStatus: MilestoneStatus =
      hasGoalWeight && hasLatestWeight && latestWeight <= goalWeight
        ? 'completed'
        : goalProgress > 0
          ? 'inProgress'
          : 'locked';

    return [
      {
        id: 'journey-started',
        title: 'Journey started',
        description: firstShotDate
          ? `Started on ${formatDateLabel(firstShotDate)}`
          : 'Log your first injection when your journey begins',
        status: firstShotDate ? 'completed' : 'locked',
        icon: 'zap',
        order: 1,
      },
      {
        id: 'first-weight-entry',
        title: 'First weight entry',
        description: firstWeightDateTime
          ? `First weight logged on ${formatDateLabel(firstWeightDateTime)}`
          : 'Log your first weight',
        status: firstWeightDateTime ? 'completed' : 'locked',
        icon: 'star',
        order: 2,
      },
      {
        id: 'getting-consistent',
        title: 'Getting consistent',
        description: getWeightEntryDescription(uniqueWeightDays, 3),
        status: getCountMilestoneStatus(uniqueWeightDays, 3),
        progress: clampProgress((uniqueWeightDays / 3) * 100),
        icon: 'star',
        order: 3,
      },
      {
        id: 'data-bestie',
        title: 'Data bestie',
        description: getWeightEntryDescription(uniqueWeightDays, 7),
        status: getCountMilestoneStatus(uniqueWeightDays, 7),
        progress: clampProgress((uniqueWeightDays / 7) * 100),
        icon: 'star',
        order: 4,
      },
      {
        id: 'trend-spotter',
        title: 'Trend spotter',
        description: getTrendWinDescription(trendWins, 2),
        status: getCountMilestoneStatus(trendWins, 2),
        progress: clampProgress((trendWins / 2) * 100),
        icon: 'trend',
        order: 5,
      },
      {
        id: 'downward-momentum',
        title: 'Downward momentum',
        description: getTrendWinDescription(trendWins, 5),
        status: getCountMilestoneStatus(trendWins, 5),
        progress: clampProgress((trendWins / 5) * 100),
        icon: 'trend',
        order: 6,
      },
      {
        id: 'first-kg',
        title: unitSystem === 'metric' ? 'First kilo down' : 'First pounds down',
        description: getWeightLossDescription(safeCurrentLoss, 1, formatWeight),
        status: getWeightLossMilestoneStatus(safeCurrentLoss, 1),
        progress: clampProgress(safeCurrentLoss * 100),
        icon: 'star',
        order: 7,
      },
      {
        id: 'five-kg',
        title: `${formatWeight(5)} lighter`,
        description: getWeightLossDescription(safeCurrentLoss, 5, formatWeight),
        status: getWeightLossMilestoneStatus(safeCurrentLoss, 5),
        progress: clampProgress((safeCurrentLoss / 5) * 100),
        icon: 'trend',
        order: 8,
      },
      {
        id: 'ten-kg',
        title: `${formatWeight(10)} milestone`,
        description: getWeightLossDescription(safeCurrentLoss, 10, formatWeight),
        status: getWeightLossMilestoneStatus(safeCurrentLoss, 10),
        progress: clampProgress((safeCurrentLoss / 10) * 100),
        icon: 'trend',
        order: 9,
      },
      {
        id: 'fifteen-kg',
        title: `${formatWeight(15)} milestone`,
        description: getWeightLossDescription(safeCurrentLoss, 15, formatWeight),
        status: getWeightLossMilestoneStatus(safeCurrentLoss, 15),
        progress: clampProgress((safeCurrentLoss / 15) * 100),
        icon: 'trend',
        order: 10,
      },
      {
        id: 'twenty-kg',
        title: `${formatWeight(20)} milestone`,
        description: getWeightLossDescription(safeCurrentLoss, 20, formatWeight),
        status: getWeightLossMilestoneStatus(safeCurrentLoss, 20),
        progress: clampProgress((safeCurrentLoss / 20) * 100),
        icon: 'star',
        order: 11,
      },
      {
        id: 'goal-10-percent',
        title: 'First 10% of goal',
        description:
          goalLoss > 0 ? getGoalProgressDescription(goalProgress, 10) : 'Add a goal weight',
        status: goalLoss > 0 ? getProgressMilestoneStatus(goalProgress, 10) : 'locked',
        progress: goalLoss > 0 ? clampProgress((goalProgress / 10) * 100) : 0,
        icon: 'target',
        order: 12,
      },
      {
        id: 'goal-25-percent',
        title: 'Quarter way there',
        description:
          goalLoss > 0 ? getGoalProgressDescription(goalProgress, 25) : 'Add a goal weight',
        status: goalLoss > 0 ? getProgressMilestoneStatus(goalProgress, 25) : 'locked',
        progress: goalLoss > 0 ? clampProgress((goalProgress / 25) * 100) : 0,
        icon: 'target',
        order: 13,
      },
      {
        id: 'goal-50-percent',
        title: 'Halfway hero',
        description:
          goalLoss > 0 ? getGoalProgressDescription(goalProgress, 50) : 'Add a goal weight',
        status: goalLoss > 0 ? getProgressMilestoneStatus(goalProgress, 50) : 'locked',
        progress: goalLoss > 0 ? clampProgress((goalProgress / 50) * 100) : 0,
        icon: 'target',
        order: 14,
      },
      {
        id: 'goal-75-percent',
        title: 'So close now',
        description:
          goalLoss > 0 ? getGoalProgressDescription(goalProgress, 75) : 'Add a goal weight',
        status: goalLoss > 0 ? getProgressMilestoneStatus(goalProgress, 75) : 'locked',
        progress: goalLoss > 0 ? clampProgress((goalProgress / 75) * 100) : 0,
        icon: 'target',
        order: 15,
      },
      {
        id: 'goal-weight',
        title: 'Goal reached',
        description:
          goalWeightStatus === 'completed'
            ? 'You reached your goal weight'
            : hasGoalWeight && hasLatestWeight
              ? `${formatWeight(Math.max(latestWeight - goalWeight, 0))} left`
              : 'Add your goal weight',
        status: goalWeightStatus,
        progress: goalProgress,
        icon: 'party',
        order: 16,
      },
    ];
  }, [formatWeight, goalWeight, shots, startWeight, unitSystem, weights]);

  const sortedMilestones = useMemo(() => {
    return sortMilestones(milestones);
  }, [milestones]);

  const visibleMilestones = useMemo(() => {
    return typeof maxVisible === 'number'
      ? sortedMilestones.slice(0, maxVisible)
      : sortedMilestones;
  }, [maxVisible, sortedMilestones]);

  return {
    milestones: sortedMilestones,
    visibleMilestones,
  };
};
