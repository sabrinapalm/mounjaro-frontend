import { useCallback, useEffect, useState } from 'react';
import type { AppData, ShotEntry, UserProfile, WeightEntry } from '../types';
import { apiClient } from '../services/apiClient';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { formatDateLabel } from '../utils/dateHelpers';
import { ShotTracker } from './ShotTracker';
import { WeightTracker } from './WeightTracker';
import { WeightGraph } from './WeightGraph';
import { GoalProgress } from './GoalProgress';
import './Dashboard.css';
import { RiEmotionHappyLine } from 'react-icons/ri';
import { IoScaleOutline } from "react-icons/io5";
import { LuCalendarHeart } from "react-icons/lu";
import { LuSyringe } from "react-icons/lu";



export const Dashboard = ({ profile }: { profile: UserProfile }) => {
  console.log('** profile', profile)
  const [data, setData] = useState<AppData>({ shots: [], weights: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [shots, weights] = await Promise.all([
        apiClient.getShots(),
        apiClient.getWeights(),
      ]);
      setData({ shots, weights });
    } catch (err) {
      setError((err as Error)?.message || 'Unable to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const summary = useDashboardSummary({
    shots: data.shots,
    weights: data.weights,
  });

  const formatKg = (value: number) => `${value.toFixed(1)} kg`;

  const currentWeightLabel = summary.currentWeight !== null
    ? formatKg(summary.currentWeight)
    : '—';

  const totalWeightLossLabel = summary.totalWeightLoss !== null
    ? summary.totalWeightLoss >= 0
      ? `-${formatKg(summary.totalWeightLoss)}`
      : `+${formatKg(Math.abs(summary.totalWeightLoss))}`
    : '—';

  const totalWeightLossClassName =
    summary.totalWeightLoss !== null && summary.totalWeightLoss < 0
      ? 'total-weight-loss weight-gain'
      : 'total-weight-loss';

  const currentWeightDateLabel = summary.currentWeightDate
    ? `Last: ${formatDateLabel(summary.currentWeightDate)}`
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
      setError((err as Error)?.message || 'Unable to delete weight');
    }
  };

  return (
    <div className="dashboard">
      {error && <p className="dashboard-error">{error}</p>}
      {loading && <p className="dashboard-loading">Loading data...</p>}

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Here's your progress summary, {profile?.displayName || ''}!</p>
        </div>
        <div className="dashboard-header-date">
          Today, {summary.todayLabel}
        </div>
      </div>

      <div className="dashboard-summary-cards">
        <div className="dashboard-card">
            <div className="dashboard-card-icon dashboard-card-icon-weight">
          <RiEmotionHappyLine size={38} color="currentcolor" aria-hidden="true" />
          </div>
          <div className="dashboard-card-copy">
            <span className="dashboard-card-label">Current Weight</span>
            <span className="dashboard-card-value">{currentWeightLabel}</span>
            <span className="dashboard-card-meta">{currentWeightDateLabel}</span>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon dashboard-card-icon-loss">
            <IoScaleOutline size={38} color="currentcolor" aria-hidden="true" />
          </div>
          <div className="dashboard-card-copy">
            <span className="dashboard-card-label">Total Weight Loss</span>
            <span className={`dashboard-card-value ${totalWeightLossClassName}`}>{totalWeightLossLabel}</span>
            <span className="dashboard-card-meta">Since first entry</span>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon dashboard-card-icon-calendar">
            <LuCalendarHeart size={38} color="currentcolor" aria-hidden="true" />
          </div>
          <div className="dashboard-card-copy">
            <span className="dashboard-card-label">Next Shot</span>
            <span className="dashboard-card-value">{summary.nextShotLabel}</span>
            <span className="dashboard-card-meta">{summary.nextShotMeta}</span>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon dashboard-card-icon-dose">
            <LuSyringe size={38} color="currentcolor" aria-hidden="true" />
          </div>
          <div className="dashboard-card-copy">
            <span className="dashboard-card-label">Current Dose</span>
            <span className="dashboard-card-value">{summary.currentDose}</span>
            <span className="dashboard-card-meta">{summary.currentDoseMeta}</span>
          </div>
        </div>
      </div>

      <GoalProgress weights={data.weights} goalWeight={profile?.goalWeight} />

      <div className="dashboard-grid">
        <div className="tracker-section">
          <ShotTracker
            shots={data.shots}
            onShotAdded={handleShotAdded}
            onDeleteShot={handleDeleteShot}
          />
        </div>

        <div className="tracker-section">
          <WeightTracker
            weights={data.weights}
            onWeightAdded={handleWeightAdded}
            onDeleteWeight={handleDeleteWeight}
          />
        </div>
      </div>

      <div className="chart-section">
        <WeightGraph weights={data.weights} />
      </div>
    </div>
  );
};
