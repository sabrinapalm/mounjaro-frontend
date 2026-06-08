import { useMemo, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { FiActivity } from 'react-icons/fi';
import { useProfile } from '../context/ProfileContext';
import { useUnitSettings } from '../hooks/useUnitSettings';
import type { CreateWeightInput, WeightEntry } from '../types';
import { formatDateLabel, getTimestamp } from '../utils/dateHelpers';
import { AddWeightModal } from './AddWeightModal';
import { ConfirmDialog } from './ConfirmDialog';
import './WeightTracker.css';
import { LuPlus } from 'react-icons/lu';
import { Button } from './general/Button';
import { ViewAllButton } from './general/ViewAllButton';

type WeightTrackerVariant = 'compact' | 'full';

const COMPACT_LIMIT = 3;

interface WeightTrackerProps {
  weights: WeightEntry[];
  onWeightAdded: (weight: CreateWeightInput) => Promise<void>;
  onDeleteWeight: (id: string, dateTime: string) => Promise<void>;
  onViewAll?: () => void;
  title?: string;
  summaryLabel?: string;
  variant?: WeightTrackerVariant;
}

const getWeightDateTime = (entry: WeightEntry) => {
  return entry.dateTime;
};

const getWeightTimestamp = (entry: WeightEntry) => {
  const dateTime = getWeightDateTime(entry);
  const timestamp = getTimestamp(dateTime);

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const timestampFromId = entry.id?.split('_')[1];

  return timestampFromId ? Number(timestampFromId) : 0;
};

export const WeightTracker = ({
  weights,
  onWeightAdded,
  onDeleteWeight,
  onViewAll,
  title = 'Recent Weights',
  summaryLabel = 'Total weight loss',
  variant = 'compact',
}: WeightTrackerProps) => {
  const { unitSystem } = useProfile();
  const { weightUnit, displayWeightFromKg, convertWeightFromKg } = useUnitSettings(unitSystem);

  const [error, setError] = useState<string | null>(null);
  const [isAddWeightModalOpen, setIsAddWeightModalOpen] = useState(false);
  const [isAddingWeight, setIsAddingWeight] = useState(false);
  const [weightToDelete, setWeightToDelete] = useState<WeightEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedWeights = useMemo(() => {
    return [...weights].sort((a, b) => getWeightTimestamp(b) - getWeightTimestamp(a));
  }, [weights]);

  const visibleWeights = useMemo(() => {
    return variant === 'compact' ? sortedWeights.slice(0, COMPACT_LIMIT) : sortedWeights;
  }, [sortedWeights, variant]);

  const shouldShowViewAll =
    variant === 'compact' && sortedWeights.length > COMPACT_LIMIT && Boolean(onViewAll);

  const weightLoss = useMemo(() => {
    if (sortedWeights.length < 2) {
      return null;
    }

    const latestWeight = sortedWeights[0].weight;
    const firstWeight = sortedWeights[sortedWeights.length - 1].weight;

    return firstWeight - latestWeight;
  }, [sortedWeights]);

  const weightLossLabel = useMemo(() => {
    if (weightLoss === null) {
      return null;
    }

    return `${weightLoss > 0 ? '-' : '+'}${displayWeightFromKg(Math.abs(weightLoss))} ${weightUnit}`;
  }, [displayWeightFromKg, weightLoss, weightUnit]);

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

  const handleAddWeight = async (newWeight: CreateWeightInput) => {
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
      await onDeleteWeight(weightToDelete.id, weightToDelete.dateTime);
      setWeightToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete weight');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className={`weight-tracker-card weight-tracker-card--${variant}`}>
      <header className='weight-tracker-card__header'>
        <div>
          <h2 className='weight-tracker-card__title'>{title}</h2>

          {weightLoss !== null && weightLossLabel ? (
            <p className='weight-tracker-card__summary'>
              {summaryLabel}:{' '}
              <span className={weightLoss > 0 ? 'positive' : 'negative'}>{weightLossLabel}</span>
            </p>
          ) : null}
        </div>

        <Button
          icon={<LuPlus />}
          variant='outline'
          color='secondary'
          onClick={handleOpenAddWeightModal}
        >
          Add Weight
        </Button>
      </header>

      {error && !isAddWeightModalOpen ? (
        <p className='weight-tracker-card__error'>{error}</p>
      ) : null}

      {visibleWeights.length === 0 ? (
        <div className='weight-tracker-card__empty-state'>
          <div className='weight-tracker-card__empty-icon'>
            <FiActivity size={24} />
          </div>

          <p>No weights recorded yet</p>
        </div>
      ) : (
        <ul className='weight-tracker-card__list'>
          {visibleWeights.map((entry) => {
            const entryIndex = sortedWeights.findIndex(
              (weightEntry) => weightEntry.id === entry.id
            );
            const nextEntry = entryIndex >= 0 ? sortedWeights[entryIndex + 1] : undefined;

            const changeInKg = nextEntry ? entry.weight - nextEntry.weight : null;
            const change = changeInKg !== null ? convertWeightFromKg(changeInKg) : null;
            const isWeightGain = changeInKg !== null && changeInKg > 0;
            const isWeightLoss = changeInKg !== null && changeInKg < 0;
            const displayDate = formatDateLabel(getWeightDateTime(entry));

            return (
              <li key={entry.id} className='weight-tracker-card__item'>
                <div className='weight-tracker-card__icon'>
                  <FiActivity size={20} />
                </div>

                <span className='weight-tracker-card__date'>{displayDate}</span>

                <span className='weight-tracker-card__weight'>
                  {displayWeightFromKg(entry.weight)} {weightUnit}
                </span>

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
                    {change.toFixed(1)} {weightUnit}
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
                  aria-label={`Delete weight from ${displayDate}`}
                  onClick={() => handleOpenDeleteDialog(entry)}
                >
                  <AiOutlineDelete size={20} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {shouldShowViewAll ? (
        <footer className='weight-tracker-card__footer'>
          <ViewAllButton title='View all' onClick={onViewAll} />
        </footer>
      ) : null}

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
            ? `This will delete your ${displayWeightFromKg(weightToDelete.weight)} ${weightUnit} entry from ${formatDateLabel(
                getWeightDateTime(weightToDelete)
              )}.`
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
