import { useCallback, useEffect, useState } from 'react';
import type { AppData, ShotEntry, WeightEntry } from '../types';
import { apiClient } from '../services/apiClient';
import { ShotTracker } from './ShotTracker';
import { WeightTracker } from './WeightTracker';
import { WeightGraph } from './WeightGraph';
import './Dashboard.css';

interface DashboardProps {}

export const Dashboard = ({}: DashboardProps) => {
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
    void loadData();
  }, [loadData]);

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
      <div className="dashboard-header">
        <div>
          <h1>Mounjaro Companion</h1>
          <p>Track your progress with Mounjaro shots and weight loss</p>
        </div>
      </div>

        {error && <p className="dashboard-error">{error}</p>}
        {loading && <p className="dashboard-loading">Loading data...</p>}

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
