import { useMemo, useState } from 'react';
import { FiActivity } from 'react-icons/fi';
import { LuPlus } from 'react-icons/lu';
import { Button } from '../../../shared/components/Button';
import {
  HistoryCard,
  HistoryCardHeader,
  HistoryDeleteButton,
  HistoryEmptyState,
  HistoryGroup,
} from '../../../shared/components/historyCard';
import { ConfirmDialog } from '../../../shared/components/modals/ConfirmDialog';
import { ViewAllButton } from '../../../shared/components/ViewAllButton';
import { useUnitSettings } from '../../../shared/hooks/useUnitSettings';
import type { CreateWeightInput, WeightEntry } from '../../../shared/types';
import { formatDateLabel, getDateValueFromDateTime } from '../../../shared/utils/dateHelpers';
import { useProfile } from '../../profile/ProfileContext';
import { useAddWeightModal } from '../hooks/useAddWeightModal';
import {
  getNextWeightHistoryCount,
  getWeightChangeInDisplayUnits,
  groupWeightsByMonth,
  sortWeightsNewestFirst,
} from '../utils/weightHistoryUtils';
import './WeightTracker.css';

type WeightTrackerVariant = 'compact' | 'full';

const COMPACT_LIMIT = 3;
const INITIAL_HISTORY_LIMIT = 3;
const HISTORY_PAGE_SIZE = 10;

interface WeightTrackerProps {
  weights: WeightEntry[];
  onWeightAdded: (weight: CreateWeightInput) => Promise<void>;
  onDeleteWeight: (id: string, dateTime: string) => Promise<void>;
  onViewAll?: () => void;
  title?: string;
  summaryLabel?: string;
  variant?: WeightTrackerVariant;
  showAddButton?: boolean;
}

export const WeightTracker = ({
  weights,
  onWeightAdded,
  onDeleteWeight,
  onViewAll,
  title = 'Recent measurements',
  summaryLabel = 'Weight change',
  variant = 'compact',
  showAddButton = true,
}: WeightTrackerProps) => {
  const { unitSystem } = useProfile();
  const { weightUnit, displayWeightFromKg, convertWeightFromKg } = useUnitSettings(unitSystem);

  const addWeightModal = useAddWeightModal({ onWeightAdded });

  const [error, setError] = useState<string | null>(null);
  const [weightToDelete, setWeightToDelete] = useState<WeightEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(INITIAL_HISTORY_LIMIT);

  const sortedWeights = useMemo(() => {
    return sortWeightsNewestFirst(weights);
  }, [weights]);

  const sortedWeightIndexById = useMemo(
    () => new Map(sortedWeights.map((entry, index) => [entry.id, index])),
    [sortedWeights]
  );

  const weightEntryCountByDate = useMemo(() => {
    return sortedWeights.reduce((counts, entry) => {
      const dateValue = getDateValueFromDateTime(entry.dateTime);

      counts.set(dateValue, (counts.get(dateValue) ?? 0) + 1);
      return counts;
    }, new Map<string, number>());
  }, [sortedWeights]);

  const visibleWeights = useMemo(() => {
    return variant === 'compact'
      ? sortedWeights.slice(0, COMPACT_LIMIT)
      : sortedWeights.slice(0, visibleHistoryCount);
  }, [sortedWeights, variant, visibleHistoryCount]);

  const visibleWeightGroups = useMemo(() => groupWeightsByMonth(visibleWeights), [visibleWeights]);

  const shouldShowViewAll =
    variant === 'compact' && sortedWeights.length > COMPACT_LIMIT && Boolean(onViewAll);
  const shouldShowMore = variant === 'full' && visibleWeights.length < sortedWeights.length;

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
    <HistoryCard
      className={`history-card--${variant} weight-tracker-card weight-tracker-card--${variant}`}
    >
      <HistoryCardHeader
        title={title}
        summary={
          variant === 'full' ? (
            <>
              {sortedWeights.length} {sortedWeights.length === 1 ? 'measurement' : 'measurements'}
            </>
          ) : weightLoss !== null && weightLossLabel ? (
            <>
              {summaryLabel}:{' '}
              <span className={weightLoss > 0 ? 'positive' : 'negative'}>{weightLossLabel}</span>
            </>
          ) : null
        }
        action={
          showAddButton ? (
            <Button
              icon={<LuPlus />}
              variant='outline'
              color='secondary'
              onClick={addWeightModal.openModal}
            >
              Add weight
            </Button>
          ) : null
        }
      />

      {error ? (
        <p className='history-card__error' role='alert'>
          {error}
        </p>
      ) : null}

      {visibleWeights.length === 0 ? (
        <HistoryEmptyState icon={<FiActivity size={24} />} tone='accent'>
          No measurements recorded yet
        </HistoryEmptyState>
      ) : variant === 'full' ? (
        <div className='weight-tracker-card__history'>
          {visibleWeightGroups.map((group) => (
            <HistoryGroup key={group.key} label={group.label}>
              {group.weights.map((entry) => {
                const entryIndex = sortedWeightIndexById.get(entry.id);
                const previousEntry =
                  entryIndex !== undefined ? sortedWeights[entryIndex + 1] : undefined;
                const changeInKg = previousEntry ? entry.weight - previousEntry.weight : null;
                const change = previousEntry
                  ? getWeightChangeInDisplayUnits(
                      entry.weight,
                      previousEntry.weight,
                      convertWeightFromKg
                    )
                  : null;
                const isWeightGain = changeInKg !== null && changeInKg > 0;
                const isWeightLoss = changeInKg !== null && changeInKg < 0;
                const dateValue = getDateValueFromDateTime(entry.dateTime);
                const hasSameDayEntry = (weightEntryCountByDate.get(dateValue) ?? 0) > 1;
                const displayDate = formatDateLabel(entry.dateTime);
                const displayDateTime = hasSameDayEntry
                  ? `${displayDate} · ${new Date(entry.dateTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}`
                  : displayDate;

                return (
                  <li
                    key={entry.id}
                    className={[
                      'history-card__row weight-tracker-card__item',
                      variant === 'full' ? 'weight-tracker-card__item--full' : '',
                    ].join(' ')}
                  >
                    {variant === 'full' ? (
                      <div className='history-card__history-row weight-tracker-card__history-row'>
                        <span className='weight-tracker-card__icon'>
                          <FiActivity size={18} />
                        </span>
                        <div className='weight-tracker-card__primary-data'>
                          <span className='history-card__date weight-tracker-card__date'>
                            {displayDateTime}
                          </span>
                          <span className='history-card__value weight-tracker-card__weight'>
                            {displayWeightFromKg(entry.weight)} {weightUnit}
                          </span>
                        </div>
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
                        <HistoryDeleteButton
                          className='weight-tracker-card__delete-button'
                          label={`Delete weight from ${displayDateTime}`}
                          onClick={() => handleOpenDeleteDialog(entry)}
                        />
                      </div>
                    ) : (
                      <>
                        <div className='weight-tracker-card__icon'>
                          <FiActivity size={20} />
                        </div>
                        <span className='history-card__date weight-tracker-card__date'>
                          {displayDate}
                        </span>
                        <span className='history-card__value weight-tracker-card__weight'>
                          {displayWeightFromKg(entry.weight)} {weightUnit}
                        </span>
                        <span className='weight-tracker-card__change'>
                          {change !== null ? `${change.toFixed(1)} ${weightUnit}` : '—'}
                        </span>
                        <HistoryDeleteButton
                          className='weight-tracker-card__delete-button'
                          label={`Delete weight from ${displayDate}`}
                          onClick={() => handleOpenDeleteDialog(entry)}
                        />
                      </>
                    )}
                  </li>
                );
              })}
            </HistoryGroup>
          ))}
        </div>
      ) : (
        <ul className='history-card__list weight-tracker-card__list'>
          {visibleWeights.map((entry) => {
            const entryIndex = sortedWeightIndexById.get(entry.id);
            const previousEntry =
              entryIndex !== undefined ? sortedWeights[entryIndex + 1] : undefined;
            const changeInKg = previousEntry ? entry.weight - previousEntry.weight : null;
            const change = previousEntry
              ? getWeightChangeInDisplayUnits(
                  entry.weight,
                  previousEntry.weight,
                  convertWeightFromKg
                )
              : null;
            const isWeightGain = changeInKg !== null && changeInKg > 0;
            const isWeightLoss = changeInKg !== null && changeInKg < 0;
            const displayDate = formatDateLabel(entry.dateTime);

            return (
              <li className='history-card__row weight-tracker-card__item' key={entry.id}>
                <div className='weight-tracker-card__icon'>
                  <FiActivity size={20} />
                </div>
                <span className='history-card__date weight-tracker-card__date'>{displayDate}</span>
                <span className='history-card__value weight-tracker-card__weight'>
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
                <HistoryDeleteButton
                  className='weight-tracker-card__delete-button'
                  label={`Delete weight from ${displayDate}`}
                  onClick={() => handleOpenDeleteDialog(entry)}
                />
              </li>
            );
          })}
        </ul>
      )}

      {shouldShowViewAll ? (
        <footer className='history-card__footer'>
          <ViewAllButton title='View all' onClick={onViewAll} />
        </footer>
      ) : null}
      {shouldShowMore ? (
        <footer className='history-card__footer'>
          <Button
            variant='text'
            onClick={() =>
              setVisibleHistoryCount((currentCount) =>
                getNextWeightHistoryCount(currentCount, sortedWeights.length, HISTORY_PAGE_SIZE)
              )
            }
          >
            Show more ({sortedWeights.length - visibleWeights.length} remaining)
          </Button>
        </footer>
      ) : null}

      {addWeightModal.modal}

      <ConfirmDialog
        open={Boolean(weightToDelete)}
        title='Delete weight entry?'
        message={
          weightToDelete
            ? `This will delete your ${displayWeightFromKg(weightToDelete.weight)} ${weightUnit} entry from ${formatDateLabel(weightToDelete.dateTime)}.`
            : ''
        }
        confirmLabel='Delete'
        cancelLabel='Cancel'
        variant='danger'
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </HistoryCard>
  );
};
