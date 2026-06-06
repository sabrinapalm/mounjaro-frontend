import { useCallback, useState } from 'react';

const STORAGE_KEY = 'TRACKSY_DISMISSED_NOTIFICATIONS';

const readDismissedNotificationIds = (): string[] => {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);

    if (!value) {
      return [];
    }

    const parsedValue = JSON.parse(value);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter((id): id is string => typeof id === 'string' && Boolean(id));
  } catch {
    return [];
  }
};

export const useDismissedNotifications = () => {
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(
    readDismissedNotificationIds
  );

  const dismissNotification = useCallback((notificationId: string) => {
    setDismissedNotificationIds((currentIds) => {
      if (currentIds.includes(notificationId)) {
        return currentIds;
      }

      const nextIds = [...currentIds, notificationId];

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));

      return nextIds;
    });
  }, []);

  const clearDismissedNotifications = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setDismissedNotificationIds([]);
  }, []);

  return {
    dismissedNotificationIds,
    dismissNotification,
    clearDismissedNotifications,
  };
};
