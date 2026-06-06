import { useMemo } from 'react';
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

const getDaysSince = (dateValue: string) => {
  const date = new Date(dateValue);
  const now = new Date();

  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return Math.floor((now.getTime() - date.getTime()) / 86400000);
};

export const useDashboardNotifications = ({
  profile,
  weights,
  milestones,
  summary,
}: UseDashboardNotificationsParams) => {
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
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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
      const daysSinceLatestWeight = getDaysSince(latestWeight.date);

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
          message: `You are only ${weightToGo.toFixed(1)} kg away from your goal.`,
          priority: 75,
        });
      }
    }

    return notifications.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }, [milestones, profile.goalWeight, summary.currentWeight, summary.nextShotLabel, weights]);
};
