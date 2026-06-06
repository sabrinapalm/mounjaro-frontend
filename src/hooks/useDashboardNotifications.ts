import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useUnitSettings } from '../hooks/useUnitSettings';
import type { UserProfile, WeightEntry } from '../types';
import type { DashboardSummary } from './useDashboardSummary';
import type { Milestone } from './useMilestones';

export type DashboardNotificationType = 'milestone' | 'weight' | 'shot' | 'goal';

export type DashboardNotification = {
  id: string;
  type: DashboardNotificationType;
  title: string;
  message: string;
  priority: number;
};

type UseDashboardNotificationsParams = {
  profile: UserProfile;
  weights: WeightEntry[];
  milestones: Milestone[];
  summary: DashboardSummary;
};

const getWeightDateTime = (entry: WeightEntry) => {
  return entry.dateTime ?? entry.date;
};

const getWeightTimestamp = (entry: WeightEntry) => {
  const timestamp = dayjs(getWeightDateTime(entry)).valueOf();

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const timestampFromId = entry.id?.split('_')[1];

  return timestampFromId ? Number(timestampFromId) : 0;
};

const getDaysSince = (dateTime: string) => {
  const date = dayjs(dateTime).startOf('day');
  const today = dayjs().startOf('day');

  return today.diff(date, 'day');
};

export const useDashboardNotifications = ({
  profile,
  weights,
  milestones,
  summary,
}: UseDashboardNotificationsParams) => {
  const { weightUnit, displayWeightFromKg } = useUnitSettings(profile.unitSystem ?? 'metric');

  return useMemo<DashboardNotification[]>(() => {
    const notifications: DashboardNotification[] = [];

    const recentlyCompletedMilestones = milestones
      .filter((milestone) => milestone.status === 'completed')
      .slice(0, 2);

    recentlyCompletedMilestones.forEach((milestone, index) => {
      notifications.push({
        id: `milestone-${milestone.id}`,
        type: 'milestone',
        title: 'Milestone unlocked',
        message: `You unlocked “${milestone.title}”.`,
        priority: 100 - index,
      });
    });

    const latestWeight = [...weights].sort(
      (a, b) => getWeightTimestamp(b) - getWeightTimestamp(a)
    )[0];

    if (!latestWeight) {
      notifications.push({
        id: 'weight-first-check-in',
        type: 'weight',
        title: 'Add your first weight',
        message: 'Log your first weight to start seeing progress and milestones.',
        priority: 90,
      });
    } else {
      const daysSinceLatestWeight = getDaysSince(getWeightDateTime(latestWeight));

      if (daysSinceLatestWeight >= 7) {
        notifications.push({
          id: 'weight-check-in',
          type: 'weight',
          title: 'Time for a check-in',
          message: `It has been ${daysSinceLatestWeight} days since your last weight update.`,
          priority: 80,
        });
      }
    }

    if (summary.nextShotLabel.toLowerCase().includes('tomorrow')) {
      notifications.push({
        id: 'shot-tomorrow',
        type: 'shot',
        title: 'Shot coming up',
        message: 'Your next shot looks like it is due tomorrow.',
        priority: 70,
      });
    }

    if (
      typeof profile.goalWeight === 'number' &&
      typeof summary.currentWeight === 'number' &&
      summary.currentWeight > profile.goalWeight
    ) {
      const weightToGo = summary.currentWeight - profile.goalWeight;

      if (weightToGo <= 3) {
        notifications.push({
          id: 'goal-close',
          type: 'goal',
          title: 'So close now',
          message: `You are only ${displayWeightFromKg(weightToGo)} ${weightUnit} away from your goal.`,
          priority: 75,
        });
      }
    }

    return notifications.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }, [
    displayWeightFromKg,
    milestones,
    profile.goalWeight,
    summary.currentWeight,
    summary.nextShotLabel,
    weightUnit,
    weights,
  ]);
};
