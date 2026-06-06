import { useEffect, useState } from 'react';
import { LuBell, LuLogOut, LuMenu, LuMoon, LuSun } from 'react-icons/lu';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { apiClient } from '../services/apiClient';
import type { AppData, ShotEntry, UserProfile, WeightEntry } from '../types';
import './Dashboard.css';
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
  const [data, setData] = useState<AppData>({ shots: [], weights: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SidebarSection>('dashboard');

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [shots, weights] = await Promise.all([apiClient.getShots(), apiClient.getWeights()]);

        if (!isMounted) {
          return;
        }

        setData({ shots, weights });
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError((err as Error)?.message || 'Unable to load data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useDashboardSummary({
    shots: data.shots,
    weights: data.weights,
  });

  const handleNavigate = (section: SidebarSection) => {
    setActiveSection(section);
    setIsMobileSidebarOpen(false);
  };

  const handleShotAdded = async (shot: ShotEntry) => {
    setLoading(true);
    setError(null);

    try {
      const savedShot = await apiClient.createShot(shot);

      setData((previous) => ({
        ...previous,
        shots: [...previous.shots, savedShot],
      }));
    } catch (err) {
      setError((err as Error)?.message || 'Unable to save shot');
    } finally {
      setLoading(false);
    }
  };

  const handleWeightAdded = async (weight: WeightEntry) => {
    setLoading(true);
    setError(null);

    try {
      const savedWeight = await apiClient.createWeight(weight);

      setData((previous) => ({
        ...previous,
        weights: [...previous.weights, savedWeight],
      }));
    } catch (err) {
      setError((err as Error)?.message || 'Unable to save weight');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShot = async (id: string, date: string) => {
    setError(null);

    try {
      await apiClient.deleteShot(id, date);

      setData((previous) => ({
        ...previous,
        shots: previous.shots.filter((shot) => shot.id !== id),
      }));
    } catch (err) {
      setError((err as Error)?.message || 'Unable to delete shot');
    }
  };

  const handleDeleteWeight = async (id: string, date: string) => {
    setError(null);

    try {
      await apiClient.deleteWeight(id, date);

      setData((previous) => ({
        ...previous,
        weights: previous.weights.filter((weight) => weight.id !== id),
      }));
    } catch (err) {
      setError((err as Error)?.message || 'Unable to delete weight');
    }
  };

  const handleGoalWeightUpdated = async (goalWeight: number) => {
    setError(null);

    try {
      const savedProfile = await apiClient.updateGoalWeight(goalWeight);
      onProfileUpdated(savedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update goal weight');
      throw err;
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'shots':
        return (
          <ShotsPage
            shots={data.shots}
            onShotAdded={handleShotAdded}
            onDeleteShot={handleDeleteShot}
          />
        );

      case 'weight':
        return (
          <WeightPage
            weights={data.weights}
            onWeightAdded={handleWeightAdded}
            onDeleteWeight={handleDeleteWeight}
          />
        );

      case 'milestones':
        return <MilestonesPage weights={data.weights} shots={data.shots} profile={profile} />;

      case 'profile':
        return <ProfileSettingsPage profile={profile} onProfileUpdated={onProfileUpdated} />;

      case 'dashboard':
      default:
        return (
          <DashboardOverview
            profile={profile}
            summary={summary}
            shots={data.shots}
            weights={data.weights}
            onShotAdded={handleShotAdded}
            onWeightAdded={handleWeightAdded}
            onDeleteShot={handleDeleteShot}
            onDeleteWeight={handleDeleteWeight}
            onGoalWeightUpdated={handleGoalWeightUpdated}
            onViewAllMilestones={() => handleNavigate('milestones')}
          />
        );
    }
  };

  return (
    <div className='dashboard-shell'>
      <Sidebar
        activeSection={activeSection}
        isMobileOpen={isMobileSidebarOpen}
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

            <button type='button' className='dashboard-topbar-button' aria-label='Notifications'>
              <LuBell size={20} />
              <span className='dashboard-topbar-badge'>2</span>
            </button>

            <button
              type='button'
              className='dashboard-profile-button'
              onClick={() => handleNavigate('profile')}
              aria-label='Open profile settings'
            >
              <span className='dashboard-profile-avatar'>
                {profile.displayName?.charAt(0).toUpperCase() || 'U'}
              </span>

              <span className='dashboard-profile-name'>{profile.displayName || 'Profile'}</span>
            </button>

            <button type='button' className='dashboard-signout-button' onClick={onSignOut}>
              Sign out
            </button>

            <button
              type='button'
              className='dashboard-signout-icon-button'
              onClick={onSignOut}
              aria-label='Sign out'
            >
              <LuLogOut size={20} />
            </button>
          </div>
        </div>

        {error && <p className='dashboard-error'>{error}</p>}
        {loading && null}

        {renderActiveSection()}
      </main>
    </div>
  );
};
