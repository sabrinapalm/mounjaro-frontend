import { useEffect, useState } from 'react';
import { IoScaleOutline } from 'react-icons/io5';
import { LuCalendarHeart, LuSyringe } from 'react-icons/lu';
import { RiEmotionHappyLine } from 'react-icons/ri';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { apiClient } from '../services/apiClient';
import type { AppData, ShotEntry, UserProfile, WeightEntry } from '../types';
import { formatDateLabel } from '../utils/dateHelpers';
import './Dashboard.css';
import { GoalProgress } from './GoalProgress';
import { Milestones } from './Milestones';
import { ShotTracker } from './ShotTracker';
import { WeightGraph } from './WeightGraph';
import { WeightTracker } from './WeightTracker';

type DashboardProps = {
  profile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
};

export const Dashboard = ({ profile, onProfileUpdated }: DashboardProps) => {
  const [data, setData] = useState<AppData>({ shots: [], weights: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatKg = (value: number) => `${value.toFixed(1)} kg`;

  const currentWeightLabel = summary.currentWeight !== null ? formatKg(summary.currentWeight) : '—';

  const totalWeightLossLabel =
    summary.totalWeightLoss !== null
      ? summary.totalWeightLoss >= 0
        ? `-${formatKg(summary.totalWeightLoss)}`
        : `+${formatKg(Math.abs(summary.totalWeightLoss))}`
      : '—';

  const totalWeightLossClassName =
    summary.totalWeightLoss !== null && summary.totalWeightLoss < 0
      ? 'total-weight-loss weight-gain'
      : 'total-weight-loss';

  const currentWeightDateLabel = summary.currentWeightDate
    ? `${formatDateLabel(summary.currentWeightDate)}`
    : 'No weight recorded';

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
      setError((err as Error)?.message || 'Unabl  e to delete weight');
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

  return (
    <div className='dashboard'>
      {error && <p className='dashboard-error'>{error}</p>}
      {loading && null}
      <div className='dashboard-header'>
        <div>
          <h1>Dashboard</h1>
          <p>Small steps, real progress. You’re doing great, {profile?.displayName || ''}!</p>
        </div>
        <div className='dashboard-header-date'>Today, {summary.todayLabel}</div>
      </div>

      <div className='dashboard-summary-cards'>
        <div className='dashboard-card'>
          <div className='dashboard-card-icon dashboard-card-icon-weight'>
            <RiEmotionHappyLine size={38} color='currentColor' aria-hidden='true' />
          </div>
          <div className='dashboard-card-copy'>
            <span className='dashboard-card-label'>Current Weight</span>
            <span className='dashboard-card-value'>{currentWeightLabel}</span>
            <span className='dashboard-card-meta'>{currentWeightDateLabel}</span>
          </div>
        </div>

        <div className='dashboard-card'>
          <div className='dashboard-card-icon dashboard-card-icon-loss'>
            <IoScaleOutline size={38} color='currentColor' aria-hidden='true' />
          </div>
          <div className='dashboard-card-copy'>
            <span className='dashboard-card-label'>Total Weight Loss</span>
            <span className={`dashboard-card-value ${totalWeightLossClassName}`}>
              {totalWeightLossLabel}
            </span>
            <span className='dashboard-card-meta'>Since first entry</span>
          </div>
        </div>

        <div className='dashboard-card'>
          <div className='dashboard-card-icon dashboard-card-icon-calendar'>
            <LuCalendarHeart size={38} color='currentColor' aria-hidden='true' />
          </div>
          <div className='dashboard-card-copy'>
            <span className='dashboard-card-label'>Next Shot</span>
            <span className='dashboard-card-value'>{summary.nextShotLabel}</span>
            <span className='dashboard-card-meta'>{summary.nextShotMeta}</span>
          </div>
        </div>

        <div className='dashboard-card'>
          <div className='dashboard-card-icon dashboard-card-icon-dose'>
            <LuSyringe size={38} color='currentColor' aria-hidden='true' />
          </div>
          <div className='dashboard-card-copy'>
            <span className='dashboard-card-label'>Current Dose</span>
            <span className='dashboard-card-value'>{summary.currentDose}</span>
            <span className='dashboard-card-meta'>{summary.currentDoseMeta}</span>
          </div>
        </div>
      </div>

      <GoalProgress
        weights={data.weights}
        profile={profile}
        onGoalWeightUpdated={handleGoalWeightUpdated}
      />

      <div className='dashboard-grid'>
        <div className='tracker-section'>
          <ShotTracker
            shots={data.shots}
            onShotAdded={handleShotAdded}
            onDeleteShot={handleDeleteShot}
          />
        </div>

        <div className='tracker-section'>
          <WeightTracker
            weights={data.weights}
            onWeightAdded={handleWeightAdded}
            onDeleteWeight={handleDeleteWeight}
          />
        </div>
      </div>

      <div className='dashboard-grid'>
        <WeightGraph weights={data.weights} />
        <Milestones
          weights={data.weights}
          shots={data.shots}
          startWeight={profile?.startWeight ?? null}
          goalWeight={profile?.goalWeight ?? null}
          maxVisible={5}
        />
      </div>
    </div>
  );
};
