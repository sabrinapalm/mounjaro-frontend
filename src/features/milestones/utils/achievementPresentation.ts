import { getTimestamp } from '../../../shared/utils/dateHelpers';
import type { Milestone } from '../milestoneTypes';

export const getFeaturedAchievement = (milestones: Milestone[]) => {
  const completed = milestones.filter((milestone) => milestone.status === 'completed');
  return (
    [...completed].sort((first, second) => {
      const firstDate = first.achievementDate ? getTimestamp(first.achievementDate) : Number.NaN;
      const secondDate = second.achievementDate ? getTimestamp(second.achievementDate) : Number.NaN;
      const dateDifference =
        (Number.isFinite(secondDate) ? secondDate : 0) -
        (Number.isFinite(firstDate) ? firstDate : 0);
      if (dateDifference !== 0) return dateDifference;
      const weightDifference =
        Number(second.id.startsWith('weight-loss-')) - Number(first.id.startsWith('weight-loss-'));
      return weightDifference || second.order - first.order || first.id.localeCompare(second.id);
    })[0] ?? null
  );
};

export const groupAchievements = (milestones: Milestone[]) => ({
  goal: milestones
    .filter((milestone) => milestone.id.startsWith('goal-'))
    .sort((a, b) => a.order - b.order),
  journey: milestones
    .filter(
      (milestone) => !milestone.id.startsWith('weight-loss-') && !milestone.id.startsWith('goal-')
    )
    .sort((a, b) => a.order - b.order),
});

export const formatAchievementDate = (date: string | undefined, compact = false) => {
  if (!date || !Number.isFinite(getTimestamp(date))) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: compact ? 'short' : 'long',
    year: 'numeric',
  }).format(new Date(date));
};

export const getAchievementState = (milestone: Milestone) =>
  milestone.weightLossStatus === 'upcoming' ? 'inProgress' : milestone.status;

export const getAchievementStatus = (milestone: Milestone) =>
  milestone.status === 'completed'
    ? 'Unlocked'
    : milestone.weightLossStatus === 'upcoming'
      ? 'Up next'
      : milestone.status === 'inProgress'
        ? 'In progress'
        : 'Locked';

export const getAchievementCondition = (milestone: Milestone) => {
  if (milestone.id.startsWith('weight-loss-'))
    return `Record ${milestone.title} from your starting weight.`;
  if (milestone.id.startsWith('goal-') && milestone.id !== 'goal-weight') {
    const percentage = milestone.id.replace('goal-', '').replace('-percent', '');
    return `Reach ${percentage}% of the journey from your starting weight to your goal weight.`;
  }
  switch (milestone.id) {
    case 'goal-weight':
      return 'Record a measurement at or below your goal weight.';
    case 'journey-started':
      return 'Log your first injection.';
    case 'first-weight-entry':
      return 'Log your first weight measurement.';
    case 'getting-consistent':
      return 'Log measurements on 3 different days.';
    case 'data-bestie':
      return 'Log measurements on 7 different days.';
    case 'trend-spotter':
      return 'Record 2 weigh-ins lower than the previous measurement.';
    case 'downward-momentum':
      return 'Record 5 weigh-ins lower than the previous measurement.';
    default:
      return milestone.title;
  }
};
