import { type FormEvent, useMemo, useState } from 'react';
import type { WeightEntry } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import './WeightTracker.css';
import { AiOutlineDelete } from 'react-icons/ai';

interface WeightTrackerProps {
  weights: WeightEntry[];
  onWeightAdded: (weight: WeightEntry) => Promise<void>;
  onDeleteWeight: (id: string, date: string) => Promise<void>;
}

export const WeightTracker = ({ weights, onWeightAdded, onDeleteWeight }: WeightTrackerProps) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [weightToDelete, setWeightToDelete] = useState<WeightEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const recentWeights = useMemo(() => {
    return [...weights]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [weights]);

  const weightLoss = useMemo(() => {
    const sortedWeights = [...weights].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (sortedWeights.length < 2) {
      return null;
    }

    const latestWeight = sortedWeights[0].weight;
    const firstWeight = sortedWeights[sortedWeights.length - 1].weight;

    return firstWeight - latestWeight;
  }, [weights]);

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

    if (!date || !weight) {
      return;
    }

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
      setError(err instanceof Error ? err.message : 'Unable to add weight');
    }
  };

  const handleOpenDeleteDialog = (entry: WeightEntry) => {
    setError(null);
    setWeightToDelete(entry);
  };

  const handleCloseDeleteDialog = () => {
    if (isDeleting) {
      return;
    }

    setWeightToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!weightToDelete) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await onDeleteWeight(weightToDelete.id, weightToDelete.date);
      setWeightToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete weight');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='weight-tracker'>
      <h2>Weight Tracker</h2>

      <div className='tracker-summary'>
        {weightLoss !== null && (
          <div className='summary-item'>
            <span className='label'>Total Weight Loss</span>
            <span className={`value ${weightLoss > 0 ? 'positive' : 'negative'}`}>
              {weightLoss > 0 ? '-' : '+'}
              {Math.abs(weightLoss).toFixed(1)} kg
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleAddWeight} className='weight-form'>
        <div className='form-group'>
          <label htmlFor='weight-date'>Date</label>
          <input
            id='weight-date'
            type='date'
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='weight-input'>Weight (kg)</label>
          <input
            id='weight-input'
            type='number'
            step='0.1'
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            placeholder='e.g., 85.5'
            required
          />
        </div>

        {error && <p className='tracker-error'>{error}</p>}

        <button type='submit' className='button button-accent'>
          Add Weight
        </button>
      </form>

      <div className='recent-weights'>
        <h3>Recent Weights</h3>

        {recentWeights.length === 0 ? (
          <p className='empty-state'>No weights recorded yet</p>
        ) : (
          <ul className='weights-list'>
            {recentWeights.map((entry, index) => {
              const nextEntry = recentWeights[index + 1];
              const change = nextEntry ? (entry.weight - nextEntry.weight).toFixed(1) : null;

              return (
                <li key={entry.id} className='weight-item'>
                  <div className='weight-info'>
                    <span className='weight-date'>{new Date(entry.date).toLocaleDateString()}</span>

                    <span className='weight-value'>{entry.weight} kg</span>

                    {change && (
                      <span
                        className={`weight-change ${
                          parseFloat(change) > 0 ? 'negative' : 'positive'
                        }`}
                      >
                        {parseFloat(change) > 0 ? '+' : ''}
                        {change} kg
                      </span>
                    )}
                  </div>
                  <button
                    type='button'
                    onClick={() => handleOpenDeleteDialog(entry)}
                    className='btn-delete'
                  >
                    <AiOutlineDelete size={20} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(weightToDelete)}
        title='Delete weight entry?'
        message={
          weightToDelete
            ? `This will delete your ${weightToDelete.weight} kg entry from ${new Date(
                weightToDelete.date
              ).toLocaleDateString()}.`
            : ''
        }
        confirmLabel='Delete'
        cancelLabel='Cancel'
        variant='danger'
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </div>
  );
};
