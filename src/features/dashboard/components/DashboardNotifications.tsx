import { useEffect, useRef, useState } from 'react';
import { LuBell, LuCalendarHeart, LuCheck, LuGoal, LuScale, LuX } from 'react-icons/lu';
import type {
  DashboardNotification,
  DashboardNotificationAction,
  DashboardNotificationType,
} from '../hooks/useDashboardNotifications';
import './DashboardNotifications.css';

type DashboardNotificationsProps = {
  notifications: DashboardNotification[];
  onDismissNotification?: (notificationId: string) => void;
  onNotificationAction?: (action: DashboardNotificationAction) => void;
};

const getNotificationIcon = (type: DashboardNotificationType) => {
  if (type === 'weight') {
    return <LuScale size={18} />;
  }

  if (type === 'shot') {
    return <LuCalendarHeart size={18} />;
  }

  return <LuGoal size={18} />;
};

export const DashboardNotifications = ({
  notifications,
  onDismissNotification,
  onNotificationAction,
}: DashboardNotificationsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const unreadCount = notifications.length;
  const unreadLabel = unreadCount === 1 ? '1 new' : `${unreadCount} new`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (panelRef.current?.contains(target)) {
        return;
      }

      if (triggerRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  const handleNotificationClick = (action?: DashboardNotificationAction) => {
    if (!action) {
      return;
    }

    onNotificationAction?.(action);
    setIsOpen(false);
  };

  return (
    <div className='dashboard-notifications'>
      <button
        ref={triggerRef}
        type='button'
        className='dashboard-topbar-button'
        aria-label={unreadCount > 0 ? `Notifications, ${unreadLabel}` : 'Notifications'}
        aria-expanded={isOpen}
        aria-haspopup='dialog'
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <LuBell size={20} />

        {unreadCount > 0 ? <span className='dashboard-topbar-badge'>{unreadCount}</span> : null}
      </button>

      {isOpen ? (
        <>
          <button
            type='button'
            className='dashboard-notifications__backdrop'
            aria-label='Close notifications'
            onClick={() => setIsOpen(false)}
          />

          <div
            ref={panelRef}
            className='dashboard-notifications__panel'
            role='dialog'
            aria-label='Notifications'
          >
            <div className='dashboard-notifications__header'>
              <div>
                <h2>Notifications</h2>
                <p>Updates from your journey</p>
              </div>

              <span>{unreadLabel}</span>
            </div>

            {notifications.length === 0 ? (
              <div className='dashboard-notifications__empty'>
                <LuCheck size={22} />
                <p>No notifications right now.</p>
                <span>You’re all caught up.</span>
              </div>
            ) : (
              <ul className='dashboard-notifications__list'>
                {notifications.map((notification) => {
                  const action = notification.action?.target;

                  return (
                    <li key={notification.id} className='dashboard-notifications__list-item'>
                      <button
                        type='button'
                        className={`dashboard-notifications__item dashboard-notifications__item--${
                          notification.tone ?? 'info'
                        }`}
                        disabled={!action}
                        onClick={() => handleNotificationClick(action)}
                      >
                        <span className='dashboard-notifications__icon'>
                          {getNotificationIcon(notification.type)}
                        </span>

                        <span className='dashboard-notifications__content'>
                          <span className='dashboard-notifications__title'>
                            {notification.title}
                          </span>

                          <span className='dashboard-notifications__message'>
                            {notification.message}
                          </span>

                          {notification.action ? (
                            <span className='dashboard-notifications__hint'>
                              {notification.action.label}
                            </span>
                          ) : null}
                        </span>
                      </button>

                      {notification.isDismissible ? (
                        <button
                          type='button'
                          className='dashboard-notifications__dismiss'
                          aria-label={`Dismiss ${notification.title}`}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onDismissNotification?.(notification.id);
                          }}
                        >
                          <LuX size={16} />
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
