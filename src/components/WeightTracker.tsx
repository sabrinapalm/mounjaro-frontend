import { useMemo, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { FiActivity } from 'react-icons/fi';
import type { WeightEntry } from '../types';
import { AddWeightModal } from './AddWeightModal';
import { ConfirmDialog } from './ConfirmDialog';
import './WeightTracker.css';

interface WeightTrackerProps {
  weights: WeightEntry[];
  onWeightAdded: (weight: WeightEntry) => Promise<void>;
  onDeleteWeight: (id: string, date: string) => Promise<void>;
}

export const WeightTracker = ({ weights, onWeightAdded, onDeleteWeight }: WeightTrackerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isAddWeightModalOpen, setIsAddWeightModalOpen] = useState(false);
  const [isAddingWeight, setIsAddingWeight] = useState(false);
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

  const handleOpenAddWeightModal = () => {
    setError(null);
    setIsAddWeightModalOpen(true);
  };

  const handleCloseAddWeightModal = () => {
    if (isAddingWeight) {
      return;
    }

    setIsAddWeightModalOpen(false);
  };

  const handleAddWeight = async (newWeight: WeightEntry) => {
    setError(null);
    setIsAddingWeight(true);

    try {
      await onWeightAdded(newWeight);
      setIsAddWeightModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add weight');
      throw err;
    } finally {
      setIsAddingWeight(false);
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
    <section className='weight-tracker-card'>
      <header className='weight-tracker-card__header'>
        <div>
          <h2 className='weight-tracker-card__title'>Recent Weights</h2>

          {weightLoss !== null && (
            <p className='weight-tracker-card__summary'>
              Total weight loss:{' '}
              <span className={weightLoss > 0 ? 'positive' : 'negative'}>
                {weightLoss > 0 ? '-' : '+'}
                {Math.abs(weightLoss).toFixed(1)} kg
              </span>
            </p>
          )}
        </div>

        <button
          type='button'
          className='weight-tracker-card__add-button'
          onClick={handleOpenAddWeightModal}
        >
          Add Weight
        </button>
      </header>

      {error && !isAddWeightModalOpen && <p className='weight-tracker-card__error'>{error}</p>}

      {recentWeights.length === 0 ? (
        <div className='weight-tracker-card__empty-state'>
          <div className='weight-tracker-card__empty-icon'>
            <FiActivity size={24} />
          </div>

          <p>No weights recorded yet</p>
        </div>
      ) : (
        <ul className='weight-tracker-card__list'>
          {recentWeights.map((entry, index) => {
            const nextEntry = recentWeights[index + 1];
            const change = nextEntry ? entry.weight - nextEntry.weight : null;
            const isWeightGain = change !== null && change > 0;
            const isWeightLoss = change !== null && change < 0;

            return (
              <li key={entry.id} className='weight-tracker-card__item'>
                <div className='weight-tracker-card__icon'>
                  <FiActivity size={20} />
                </div>

                <span className='weight-tracker-card__date'>
                  {new Date(entry.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>

                <span className='weight-tracker-card__weight'>{entry.weight.toFixed(1)} kg</span>

                {change !== null ? (
                  <span
                    className={[
                      'weight-tracker-card__change',
                      isWeightGain ? 'weight-tracker-card__change--negative' : '',
                      isWeightLoss ? 'weight-tracker-card__change--positive' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {isWeightGain ? '+' : ''}
                    {change.toFixed(1)} kg
                    <span aria-hidden='true'>{isWeightLoss ? '↓' : '↑'}</span>
                  </span>
                ) : (
                  <span className='weight-tracker-card__change weight-tracker-card__change--muted'>
                    —
                  </span>
                )}

                <button
                  type='button'
                  className='weight-tracker-card__delete-button'
                  aria-label={`Delete weight from ${new Date(entry.date).toLocaleDateString()}`}
                  onClick={() => handleOpenDeleteDialog(entry)}
                >
                  <AiOutlineDelete size={20} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <AddWeightModal
        open={isAddWeightModalOpen}
        isSubmitting={isAddingWeight}
        error={error}
        onClose={handleCloseAddWeightModal}
        onWeightAdded={handleAddWeight}
      />

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
    </section>
  );
};
