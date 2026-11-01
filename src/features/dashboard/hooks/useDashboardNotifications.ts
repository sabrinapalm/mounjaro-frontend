import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useUnitSettings } from '../../../shared/hooks/useUnitSettings';
import type { CheckInEntry, ShotEntry, UserProfile, WeightEntry } from '../../../shared/types';
import type { DashboardSummary } from './useDashboardSummary';

export type DashboardNotificationType = 'weight' | 'shot' | 'goal' | 'check-in';

export type DashboardNotificationTone = 'success' | 'warning' | 'info';

export type DashboardNotificationAction =
  | 'add-weight'
  | 'view-weight'
  | 'view-shots'
  | 'view-profile'
  | 'add-check-in';

export type DashboardNotification = {
  id: string;
  type: DashboardNotificationType;
  tone: DashboardNotificationTone;
  title: string;
  message: string;
  priority: number;
  action?: {
    label: string;
    target: DashboardNotificationAction;
  };
  isDismissible?: boolean;
};

type UseDashboardNotificationsParams = {
  profile: UserProfile;
  weights: WeightEntry[];
  shots: ShotEntry[];
  checkIns: CheckInEntry[];
  summary: DashboardSummary;
  dismissedNotificationIds?: string[];
};

const SHOT_INTERVAL_DAYS = 7;

const getWeightDateTime = (entry: WeightEntry) => {
  return entry.dateTime;
};

const getWeightTimestamp = (entry: WeightEntry) => {
  const timestamp = dayjs(entry.dateTime).valueOf();

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const timestampFromId = entry.id?.split('_')[1];

  return timestampFromId ? Number(timestampFromId) : 0;
};

const getShotTimestamp = (entry: ShotEntry) => {
  const timestamp = dayjs(entry.dateTime).valueOf();

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const timestampFromId = entry.id?.split('_')[1];

  return timestampFromId ? Number(timestampFromId) : 0;
};

const getCheckInTimestamp = (entry: CheckInEntry) => {
  const timestamp = dayjs(entry.dateTime).valueOf();

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

const getDaysUntil = (dateTime: string) => {
  const date = dayjs(dateTime).startOf('day');
  const today = dayjs().startOf('day');

  return date.diff(today, 'day');
};

const hasCheckInToday = (checkIns: CheckInEntry[]) => {
  const today = dayjs();

  return checkIns.some((checkIn) => {
    return dayjs(checkIn.dateTime).isSame(today, 'day');
  });
};

export const useDashboardNotifications = ({
  profile,
  weights,
  shots,
  checkIns,
  summary,
  dismissedNotificationIds = [],
}: UseDashboardNotificationsParams) => {
  const { weightUnit, displayWeightFromKg } = useUnitSettings(profile.unitSystem ?? 'metric');

  return useMemo<DashboardNotification[]>(() => {
    const notifications: DashboardNotification[] = [];
    const dismissedIds = new Set(dismissedNotificationIds);

    const addNotification = (notification: DashboardNotification) => {
      if (dismissedIds.has(notification.id)) {
        return;
      }

      notifications.push(notification);
    };

    const latestCheckIn = [...checkIns].sort(
      (a, b) => getCheckInTimestamp(b) - getCheckInTimestamp(a)
    )[0];

    if (!latestCheckIn) {
      addNotification({
        id: 'check-in-first',
        type: 'check-in',
        tone: 'info',
        title: 'Add your first daily check-in',
        message:
          'Log how you feel today to start finding patterns in hunger, energy and side effects.',
        priority: 88,
        action: {
          label: 'Add check-in',
          target: 'add-check-in',
        },
        isDismissible: false,
      });
    } else if (!hasCheckInToday(checkIns)) {
      const daysSinceLatestCheckIn = getDaysSince(latestCheckIn.dateTime);

      addNotification({
        id: 'check-in-today',
        type: 'check-in',
        tone: daysSinceLatestCheckIn >= 2 ? 'warning' : 'info',
        title: 'Daily check-in missing',
        message:
          daysSinceLatestCheckIn === 1
            ? 'You have not added today’s check-in yet.'
            : `It has been ${daysSinceLatestCheckIn} days since your last daily check-in.`,
        priority: daysSinceLatestCheckIn >= 2 ? 87 : 72,
        action: {
          label: 'Add check-in',
          target: 'add-check-in',
        },
        isDismissible: true,
      });
    }

    const latestWeight = [...weights].sort(
      (a, b) => getWeightTimestamp(b) - getWeightTimestamp(a)
    )[0];

    if (!latestWeight) {
      addNotification({
        id: 'weight-first-check-in',
        type: 'weight',
        tone: 'info',
        title: 'Add your first weight',
        message: 'Log your first weight to start seeing progress and insights.',
        priority: 90,
        action: {
          label: 'Go to weight',
          target: 'add-weight',
        },
        isDismissible: false,
      });
    } else {
      const daysSinceLatestWeight = getDaysSince(getWeightDateTime(latestWeight));

      if (daysSinceLatestWeight >= 7) {
        addNotification({
          id: 'weight-check-in',
          type: 'weight',
          tone: 'warning',
          title: 'Time for a check-in',
          message: `It has been ${daysSinceLatestWeight} days since your last weight update.`,
          priority: 80,
          action: {
            label: 'Go to weight',
            target: 'add-weight',
          },
          isDismissible: true,
        });
      }
    }

    const latestShot = [...shots].sort((a, b) => getShotTimestamp(b) - getShotTimestamp(a))[0];

    if (!latestShot) {
      addNotification({
        id: 'shot-first-log',
        type: 'shot',
        tone: 'info',
        title: 'Add your first shot',
        message: 'Log your first shot to keep track of your weekly schedule.',
        priority: 85,
        action: {
          label: 'Go to shots',
          target: 'view-shots',
        },
        isDismissible: false,
      });
    } else {
      const nextShotDate = dayjs(latestShot.dateTime).add(SHOT_INTERVAL_DAYS, 'day').toISOString();
      const daysUntilNextShot = getDaysUntil(nextShotDate);

      if (daysUntilNextShot < 0) {
        const overdueDays = Math.abs(daysUntilNextShot);

        addNotification({
          id: 'shot-overdue',
          type: 'shot',
          tone: 'warning',
          title: 'Shot overdue',
          message:
            overdueDays === 1
              ? 'Your next shot looks like it was due yesterday.'
              : `Your next shot looks like it was due ${overdueDays} days ago.`,
          priority: 95,
          action: {
            label: 'Go to shots',
            target: 'view-shots',
          },
          isDismissible: true,
        });
      }

      if (daysUntilNextShot === 0) {
        addNotification({
          id: 'shot-today',
          type: 'shot',
          tone: 'warning',
          title: 'Shot due today',
          message: 'Your next shot looks like it is due today.',
          priority: 94,
          action: {
            label: 'Go to shots',
            target: 'view-shots',
          },
          isDismissible: true,
        });
      }

      if (daysUntilNextShot === 1) {
        addNotification({
          id: 'shot-tomorrow',
          type: 'shot',
          tone: 'info',
          title: 'Shot coming up',
          message: 'Your next shot looks like it is due tomorrow.',
          priority: 70,
          action: {
            label: 'Go to shots',
            target: 'view-shots',
          },
          isDismissible: true,
        });
      }
    }

    if (
      typeof profile.goalWeight === 'number' &&
      typeof summary.currentWeight === 'number' &&
      summary.currentWeight <= profile.goalWeight
    ) {
      addNotification({
        id: 'goal-reached',
        type: 'goal',
        tone: 'success',
        title: 'Goal reached',
        message: `You reached your goal weight of ${displayWeightFromKg(
          profile.goalWeight
        )} ${weightUnit}.`,
        priority: 98,
        action: {
          label: 'View progress',
          target: 'view-weight',
        },
        isDismissible: true,
      });
    } else if (
      typeof profile.goalWeight === 'number' &&
      typeof summary.currentWeight === 'number' &&
      summary.currentWeight > profile.goalWeight
    ) {
      const weightToGo = summary.currentWeight - profile.goalWeight;

      if (weightToGo <= 3) {
        addNotification({
          id: 'goal-close',
          type: 'goal',
          tone: 'success',
          title: 'So close now',
          message: `You are only ${displayWeightFromKg(weightToGo)} ${weightUnit} away from your goal.`,
          priority: 75,
          action: {
            label: 'View progress',
            target: 'view-weight',
          },
          isDismissible: true,
        });
      }
    }

    return notifications.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }, [
    checkIns,
    dismissedNotificationIds,
    displayWeightFromKg,
    profile.goalWeight,
    shots,
    summary.currentWeight,
    weightUnit,
    weights,
  ]);
};
