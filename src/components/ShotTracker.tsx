import { useEffect, useState, type FormEvent } from 'react';
import type { ShotEntry } from '../types';
import './ShotTracker.css';

interface ShotTrackerProps {
  shots: ShotEntry[];
  onShotAdded: (shot: ShotEntry) => Promise<void>;
  onDeleteShot: (id: string, date: string) => Promise<void>;
}

export const ShotTracker = ({ shots, onShotAdded, onDeleteShot }: ShotTrackerProps) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dosage, setDosage] = useState<string>('2.5');
  const [recentShots, setRecentShots] = useState<ShotEntry[]>([]);
  const [totalShots, setTotalShots] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadRecentShots = () => {
    const sorted = [...shots].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setRecentShots(sorted.slice(0, 5));
    setTotalShots(sorted.length);
  };

  useEffect(() => {
    loadRecentShots();
  }, [shots]);

  const getWeekNumber = (date: Date): { week: number; year: number } => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { week, year: d.getUTCFullYear() };
  };

  const handleAddShot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!date || !dosage) return;

    const selectedDate = new Date(date);
    const { week, year } = getWeekNumber(selectedDate);

    const newShot: ShotEntry = {
      id: `shot_${Date.now()}`,
      date,
      dosage: parseFloat(dosage),
      week,
      year,
    };

    try {
      await onShotAdded(newShot);
      setDate(new Date().toISOString().split('T')[0]);
      setDosage('2.5');
    } catch (err) {
      setError((err as Error)?.message || 'Unable to add shot');
    }
  };

  return (
    <div className="shot-tracker">
      <h2>Mounjaro Shot Tracker</h2>

      <div className="tracker-summary">
        <div className="summary-item">
          <span className="label">Total Shots</span>
          <span className="value">{totalShots}</span>
        </div>
      </div>

      <form onSubmit={handleAddShot} className="shot-form">
        <div className="form-group">
          <label htmlFor="shot-date">Date</label>
          <input
            id="shot-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="shot-dosage">Dosage (mg)</label>
          <select
            id="shot-dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            required
          >
            <option value="2.5">2.5 mg</option>
            <option value="5">5 mg</option>
            <option value="7.5">7.5 mg</option>
            <option value="10">10 mg</option>
            <option value="12.5">12.5 mg</option>
            <option value="15">15 mg</option>
          </select>
        </div>

        {error && <p className="tracker-error">{error}</p>}
        <button type="submit" className="btn-add">
          Add Shot
        </button>
      </form>

      <div className="recent-shots">
        <h3>Recent Shots</h3>
        {recentShots.length === 0 ? (
          <p className="empty-state">No shots recorded yet</p>
        ) : (
          <ul className="shots-list">
            {recentShots.map((shot) => (
              <li key={shot.id} className="shot-item">
                <div className="shot-info">
                  <span className="shot-date">
                    {new Date(shot.date).toLocaleDateString()}
                  </span>
                  <span className="shot-dosage">{shot.dosage} mg</span>
                </div>
                <button
                  onClick={() => onDeleteShot(shot.id, shot.date)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
