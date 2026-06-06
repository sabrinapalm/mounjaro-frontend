import { useEffect, useRef, useState } from 'react';
import { LuBell, LuCalendarHeart, LuGoal, LuPartyPopper, LuScale } from 'react-icons/lu';
import type {
  DashboardNotification,
  DashboardNotificationType,
} from '../hooks/useDashboardNotifications';
import './DashboardNotifications.css';

type DashboardNotificationsProps = {
  notifications: DashboardNotification[];
};

const getNotificationIcon = (type: DashboardNotificationType) => {
  if (type === 'milestone') {
    return <LuPartyPopper size={18} />;
  }

  if (type === 'weight') {
    return <LuScale size={18} />;
  }

  if (type === 'shot') {
    return <LuCalendarHeart size={18} />;
  }

  return <LuGoal size={18} />;
};

export const DashboardNotifications = ({ notifications }: DashboardNotificationsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.length;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
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

      const notificationButton = document.querySelector('[data-notifications-trigger="true"]');

      if (notificationButton?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div className='dashboard-notifications'>
      <button
        type='button'
        className='dashboard-topbar-button'
        aria-label='Notifications'
        aria-expanded={isOpen}
        data-notifications-trigger='true'
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

              <span>{unreadCount} new</span>
            </div>

            {notifications.length === 0 ? (
              <div className='dashboard-notifications__empty'>
                <p>No notifications right now.</p>
                <span>You’re all caught up.</span>
              </div>
            ) : (
              <ul className='dashboard-notifications__list'>
                {notifications.map((notification) => (
                  <li key={notification.id} className='dashboard-notifications__item'>
                    <div className='dashboard-notifications__icon'>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className='dashboard-notifications__content'>
                      <h3>{notification.title}</h3>
                      <p>{notification.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
