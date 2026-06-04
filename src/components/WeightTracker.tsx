import { useEffect, useState, type FormEvent } from 'react';
import type { WeightEntry } from '../types';
import './WeightTracker.css';

interface WeightTrackerProps {
  weights: WeightEntry[];
  onWeightAdded: (weight: WeightEntry) => Promise<void>;
  onDeleteWeight: (id: string, date: string) => Promise<void>;
}

export const WeightTracker = ({
  weights,
  onWeightAdded,
  onDeleteWeight,
}: WeightTrackerProps) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<string>('');
  const [recentWeights, setRecentWeights] = useState<WeightEntry[]>([]);
  const [weightLoss, setWeightLoss] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentWeights();
  }, [weights]);

  const loadRecentWeights = () => {
    const sorted = [...weights].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setRecentWeights(sorted.slice(0, 5));

    if (sorted.length >= 2) {
      const latestWeight = sorted[0].weight;
      const firstWeight = sorted[sorted.length - 1].weight;
      setWeightLoss(firstWeight - latestWeight);
    } else {
      setWeightLoss(null);
    }
  };

  const getWeekNumber = (date: Date): { week: number; year: number } => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { week, year: d.getUTCFullYear() };
  };

  const handleAddWeight = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!date || !weight) return;

    const selectedDate = new Date(date);
    const { week, year } = getWeekNumber(selectedDate);

    const newWeight: WeightEntry = {
      id: `weight_${Date.now()}`,
      date,
      weight: parseFloat(weight),
      week,
      year,
    };

    try {
      await onWeightAdded(newWeight);
      setDate(new Date().toISOString().split('T')[0]);
      setWeight('');
    } catch (err) {
      setError((err as Error)?.message || 'Unable to add weight');
    }
  };

  return (
    <div className="weight-tracker">
      <h2>Weight Tracker</h2>

      <div className="tracker-summary">
        {weightLoss !== null && (
          <div className="summary-item">
            <span className="label">Total Weight Loss</span>
            <span className={`value ${weightLoss > 0 ? 'positive' : 'neutral'}`}>
              {weightLoss > 0 ? '-' : ''}
              {Math.abs(weightLoss).toFixed(1)} kg
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleAddWeight} className="weight-form">
        <div className="form-group">
          <label htmlFor="weight-date">Date</label>
          <input
            id="weight-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="weight-input">Weight (kg)</label>
          <input
            id="weight-input"
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g., 85.5"
            required
          />
        </div>

        {error && <p className="tracker-error">{error}</p>}
        <button type="submit" className="btn-add">
          Add Weight
        </button>
      </form>

      <div className="recent-weights">
        <h3>Recent Weights</h3>
        {recentWeights.length === 0 ? (
          <p className="empty-state">No weights recorded yet</p>
        ) : (
          <ul className="weights-list">
            {recentWeights.map((entry, index) => {
              const nextEntry = recentWeights[index + 1];
              const change = nextEntry ? (entry.weight - nextEntry.weight).toFixed(1) : null;
              return (
                <li key={entry.id} className="weight-item">
                  <div className="weight-info">
                    <span className="weight-date">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    <span className="weight-value">{entry.weight} kg</span>
                    {change && (
                      <span className={`weight-change ${parseFloat(change) > 0 ? 'negative' : 'positive'}`}>
                        {parseFloat(change) > 0 ? '+' : ''}
                        {change} kg
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteWeight(entry.id, entry.date)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
