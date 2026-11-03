import { useCallback, useMemo } from 'react';
import { useUnitSettings } from '../../../shared/hooks/useUnitSettings';
import type { ShotEntry, WeightEntry } from '../../../shared/types';
import { formatDateLabel } from '../../../shared/utils/dateHelpers';
import { useProfile } from '../../profile/ProfileContext';
import type { Milestone, MilestoneStatus } from '../milestoneTypes';
import { buildMilestones, getMilestoneAchievementDates } from '../utils/buildMilestones';
import { generateWeightLossMilestones } from '../utils/weightLossMilestones';

export type { Milestone, MilestoneIcon, MilestoneStatus } from '../milestoneTypes';

type UseMilestonesParams = {
  weights: WeightEntry[];
  shots: ShotEntry[];
  startWeight?: number | null;
  goalWeight?: number | null;
  maxVisible?: number;
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

  const formatWeightThreshold = useCallback(
    (weightInKg: number) => {
      const displayedWeight = displayWeightFromKg(weightInKg);
      const amount =
        Number(displayedWeight) % 1 === 0 ? Number(displayedWeight).toFixed(0) : displayedWeight;

      return `${amount} ${weightUnit}`;
    },
    [displayWeightFromKg, weightUnit]
  );

  const weightLossData = useMemo(
    () => generateWeightLossMilestones(weights, startWeight),
    [startWeight, weights]
  );

  const milestones = useMemo<Milestone[]>(() => {
    const params = { weights, shots, startWeight, goalWeight, unitSystem, formatWeight };
    const achievementDates = getMilestoneAchievementDates(params);
    return buildMilestones(params).map((milestone) => ({
      ...milestone,
      achievementDate:
        milestone.status === 'completed' ? achievementDates.get(milestone.id) : undefined,
    }));
  }, [formatWeight, goalWeight, shots, startWeight, unitSystem, weights]);

  const weightLossMilestones = useMemo<Milestone[]>(() => {
    return weightLossData.achievements.map((achievement) => ({
      id: achievement.id,
      title: `${formatWeightThreshold(achievement.thresholdKg)} lost`,
      description:
        achievement.status === 'completed' && achievement.achievedAt
          ? `Achieved on ${formatDateLabel(achievement.achievedAt)}`
          : achievement.status === 'upcoming'
            ? `${formatWeight(achievement.remainingKg)} to go`
            : `${formatWeight(achievement.thresholdKg)} to unlock`,
      status:
        achievement.status === 'completed'
          ? 'completed'
          : achievement.status === 'upcoming' && achievement.progress > 0
            ? 'inProgress'
            : 'locked',
      progress: achievement.progress,
      icon: 'trend',
      order: 7 + achievement.thresholdKg / 5,
      achievementDate: achievement.achievedAt,
      weightLossStatus: achievement.status,
    }));
  }, [formatWeight, formatWeightThreshold, weightLossData.achievements]);

  const nextWeightLossMilestone = useMemo(() => {
    const achievement = weightLossData.nextAchievement;

    return achievement
      ? {
          title: `${formatWeightThreshold(achievement.thresholdKg)} lost`,
          remaining: `${formatWeight(achievement.remainingKg)} to go`,
          progress: achievement.progress,
        }
      : null;
  }, [formatWeight, formatWeightThreshold, weightLossData.nextAchievement]);

  const sortedMilestones = useMemo(() => {
    return sortMilestones([...milestones, ...weightLossMilestones]);
  }, [milestones, weightLossMilestones]);

  const visibleMilestones = useMemo(() => {
    return typeof maxVisible === 'number'
      ? sortedMilestones.slice(0, maxVisible)
      : sortedMilestones;
  }, [maxVisible, sortedMilestones]);

  return {
    milestones: sortedMilestones,
    visibleMilestones,
    weightLossMilestones,
    nextWeightLossMilestone,
  };
};
