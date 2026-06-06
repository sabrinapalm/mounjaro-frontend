import { useEffect, useRef, useState } from 'react';
import { LuMenu, LuMoon, LuSun } from 'react-icons/lu';
import { useUpdateGoalWeight } from '../hooks/queries/useProfileQuery';
import { useCreateShot, useDeleteShot, useShots } from '../hooks/queries/useShotsQuery';
import { useCreateWeight, useDeleteWeight, useWeights } from '../hooks/queries/useWeightsQuery';
import {
  type DashboardNotificationAction,
  useDashboardNotifications,
} from '../hooks/useDashboardNotifications';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useDismissedNotifications } from '../hooks/useDissmisedNotifications';
import type { CreateShotInput, CreateWeightInput, UserProfile } from '../types';
import { getQueryErrorMessage } from '../utils/queryErrorMessage';
import './Dashboard.css';
import { DashboardErrorNotice } from './DashboardErrorNotice';
import { DashboardNotifications } from './DashboardNotifications';
import { DashboardOverview } from './DashboardOverview';
import { MilestonesPage } from './MilestonesPage';
import { ProfileSettingsPage } from './ProfileSettingsPage';
import { ShotsPage } from './ShotsPage';
import { Sidebar, type SidebarSection } from './Sidebar';
import { WeightPage } from './WeightPage';

type DashboardProps = {
  profile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
  onSignOut: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
};

export const Dashboard = ({
  profile,
  onProfileUpdated,
  onSignOut,
  theme,
  onToggleTheme,
}: DashboardProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SidebarSection>('dashboard');
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const shotsQuery = useShots(true);
  const weightsQuery = useWeights(true);

  const createShotMutation = useCreateShot();
  const deleteShotMutation = useDeleteShot();

  const createWeightMutation = useCreateWeight();
  const deleteWeightMutation = useDeleteWeight();

  const updateGoalWeightMutation = useUpdateGoalWeight();

  const { dismissedNotificationIds, dismissNotification } = useDismissedNotifications();

  const shots = shotsQuery.data ?? [];
  const weights = weightsQuery.data ?? [];

  const isInitialLoading = shotsQuery.isLoading || weightsQuery.isLoading;

  const summary = useDashboardSummary({
    shots,
    weights,
  });

  const notifications = useDashboardNotifications({
    profile,
    weights,
    shots,
    summary,
    dismissedNotificationIds,
  });

  const hasQueryError = shotsQuery.isError || weightsQuery.isError;

  const queryErrorMessage = (() => {
    if (shotsQuery.isError) {
      return getQueryErrorMessage(shotsQuery.error, 'Your shots could not be loaded.');
    }

    if (weightsQuery.isError) {
      return getQueryErrorMessage(weightsQuery.error, 'Your weight entries could not be loaded.');
    }

    return null;
  })();

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  const handleRetryQueries = () => {
    if (shotsQuery.isError) {
      void shotsQuery.refetch();
    }

    if (weightsQuery.isError) {
      void weightsQuery.refetch();
    }
  };

  const handleNavigate = (section: SidebarSection) => {
    setActiveSection(section);
    setIsMobileSidebarOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleNotificationAction = (action: DashboardNotificationAction) => {
    if (action === 'add-weight' || action === 'view-weight') {
      handleNavigate('weight');
      return;
    }

    if (action === 'view-shots') {
      handleNavigate('shots');
      return;
    }

    if (action === 'view-profile') {
      handleNavigate('profile');
    }
  };

  const handleSignOut = () => {
    setIsProfileMenuOpen(false);
    onSignOut();
  };

  const handleShotAdded = async (shot: CreateShotInput) => {
    setDashboardError(null);

    try {
      await createShotMutation.mutateAsync(shot);
    } catch (err) {
      setDashboardError(err instanceof Error ? err.message : 'Unable to save shot.');
      throw err;
    }
  };

  const handleWeightAdded = async (weight: CreateWeightInput) => {
    setDashboardError(null);

    try {
      await createWeightMutation.mutateAsync(weight);
    } catch (err) {
      setDashboardError(err instanceof Error ? err.message : 'Unable to save weight.');
      throw err;
    }
  };

  const handleDeleteShot = async (id: string, date: string) => {
    setDashboardError(null);

    try {
      await deleteShotMutation.mutateAsync({ id, date });
    } catch (err) {
      setDashboardError(err instanceof Error ? err.message : 'Unable to delete shot.');
    }
  };

  const handleDeleteWeight = async (id: string, date: string) => {
    setDashboardError(null);

    try {
      await deleteWeightMutation.mutateAsync({ id, date });
    } catch (err) {
      setDashboardError(err instanceof Error ? err.message : 'Unable to delete weight.');
    }
  };

  const handleGoalWeightUpdated = async (goalWeight: number) => {
    setDashboardError(null);

    try {
      const savedProfile = await updateGoalWeightMutation.mutateAsync(goalWeight);
      onProfileUpdated(savedProfile);
    } catch (err) {
      setDashboardError(err instanceof Error ? err.message : 'Unable to update goal weight.');
      throw err;
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'shots':
        return (
          <ShotsPage shots={shots} onShotAdded={handleShotAdded} onDeleteShot={handleDeleteShot} />
        );

      case 'weight':
        return (
          <WeightPage
            weights={weights}
            onWeightAdded={handleWeightAdded}
            onDeleteWeight={handleDeleteWeight}
          />
        );

      case 'milestones':
        return <MilestonesPage weights={weights} shots={shots} profile={profile} />;

      case 'profile':
        return <ProfileSettingsPage profile={profile} onProfileUpdated={onProfileUpdated} />;

      default:
        return (
          <DashboardOverview
            profile={profile}
            summary={summary}
            shots={shots}
            weights={weights}
            onShotAdded={handleShotAdded}
            onWeightAdded={handleWeightAdded}
            onDeleteShot={handleDeleteShot}
            onDeleteWeight={handleDeleteWeight}
            onGoalWeightUpdated={handleGoalWeightUpdated}
            onViewAllMilestones={() => handleNavigate('milestones')}
            onViewAllShots={() => handleNavigate('shots')}
            onViewAllWeights={() => handleNavigate('weight')}
          />
        );
    }
  };

  return (
    <div className='dashboard-shell'>
      <Sidebar
        activeSection={activeSection}
        isMobileOpen={isMobileSidebarOpen}
        theme={theme}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        onNavigate={handleNavigate}
      />

      <main className='dashboard'>
        <div className='dashboard-topbar'>
          <button
            type='button'
            className='dashboard-mobile-menu-button'
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label='Open navigation menu'
          >
            <LuMenu size={22} />
          </button>

          <div className='dashboard-topbar-actions'>
            <button
              type='button'
              className='dashboard-topbar-button'
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <LuSun size={20} /> : <LuMoon size={20} />}
            </button>

            <DashboardNotifications
              notifications={notifications}
              onDismissNotification={dismissNotification}
              onNotificationAction={handleNotificationAction}
            />

            <div className='dashboard-profile-menu-wrapper' ref={profileMenuRef}>
              <button
                type='button'
                className='dashboard-profile-button'
                onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                aria-label='Open account menu'
                aria-haspopup='menu'
                aria-expanded={isProfileMenuOpen}
              >
                <span className='dashboard-profile-avatar'>
                  {profile.displayName?.charAt(0).toUpperCase() || 'U'}
                </span>

                <span className='dashboard-profile-name'>{profile.displayName || 'Profile'}</span>
              </button>

              {isProfileMenuOpen ? (
                <div className='dashboard-profile-menu' role='menu'>
                  <button
                    type='button'
                    className='dashboard-profile-menu__item'
                    role='menuitem'
                    onClick={() => handleNavigate('profile')}
                  >
                    Profile settings
                  </button>

                  <button
                    type='button'
                    className='dashboard-profile-menu__item dashboard-profile-menu__item--danger'
                    role='menuitem'
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {dashboardError ? (
          <DashboardErrorNotice title='Action failed' message={dashboardError} />
        ) : null}

        {hasQueryError && queryErrorMessage ? (
          <DashboardErrorNotice message={queryErrorMessage} onRetry={handleRetryQueries} />
        ) : null}

        {isInitialLoading ? null : renderActiveSection()}
      </main>
    </div>
  );
};
