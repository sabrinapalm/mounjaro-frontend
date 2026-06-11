import { useMemo, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { LuHeartPulse, LuPlus } from 'react-icons/lu';
import { useAddCheckInModal } from '../../hooks/useAddCheckInModal';
import type { CheckInEntry, CheckInLevel, CreateCheckInInput } from '../../types';
import { formatDateLabel, getTimestamp } from '../../utils/dateHelpers';
import { Button } from '../general/Button';
import { ViewAllButton } from '../general/ViewAllButton';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import './CheckInTracker.css';

type CheckInTrackerVariant = 'compact' | 'full';

const COMPACT_LIMIT = 3;

interface CheckInTrackerProps {
  checkIns: CheckInEntry[];
  onCheckInAdded: (checkIn: CreateCheckInInput) => Promise<void>;
  onDeleteCheckIn: (id: string, dateTime: string) => Promise<void>;
  onViewAll?: () => void;
  title?: string;
  summaryLabel?: string;
  variant?: CheckInTrackerVariant;
  showAddButton?: boolean;
}

const getAverageLevel = (checkIn: CheckInEntry) => {
  const levels = [
    checkIn.appetiteLevel,
    checkIn.hungerLevel,
    checkIn.energyLevel,
    checkIn.nauseaLevel,
    checkIn.moodLevel,
  ].filter((level): level is CheckInLevel => typeof level === 'number');

  if (levels.length === 0) {
    return null;
  }

  const total = levels.reduce((sum, level) => sum + level, 0);

  return total / levels.length;
};

const formatLevel = (level: number | null) => {
  if (level === null) {
    return '-';
  }

  return level.toFixed(1);
};

const getCheckInMeta = (checkIn: CheckInEntry) => {
  const sideEffectsCount = checkIn.sideEffects?.length ?? 0;

  if (sideEffectsCount > 0) {
    return `${sideEffectsCount} side effect${sideEffectsCount === 1 ? '' : 's'}`;
  }

  if (checkIn.notes) {
    return 'Has note';
  }

  return 'Daily check-in';
};

export const CheckInTracker = ({
  checkIns,
  onCheckInAdded,
  onDeleteCheckIn,
  onViewAll,
  title = 'Daily Check-ins',
  summaryLabel = 'Total check-ins',
  variant = 'compact',
  showAddButton = true,
}: CheckInTrackerProps) => {
  const addCheckInModal = useAddCheckInModal({ onCheckInAdded });

  const [error, setError] = useState<string | null>(null);
  const [checkInToDelete, setCheckInToDelete] = useState<CheckInEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedCheckIns = useMemo(() => {
    return [...checkIns].sort((firstCheckIn, secondCheckIn) => {
      const dateDifference =
        getTimestamp(secondCheckIn.dateTime) - getTimestamp(firstCheckIn.dateTime);

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return secondCheckIn.id.localeCompare(firstCheckIn.id);
    });
  }, [checkIns]);

  const visibleCheckIns = useMemo(() => {
    if (variant === 'compact') {
      return sortedCheckIns.slice(0, COMPACT_LIMIT);
    }

    return sortedCheckIns;
  }, [sortedCheckIns, variant]);

  const totalCheckIns = sortedCheckIns.length;

  const shouldShowViewAll =
    variant === 'compact' && sortedCheckIns.length > COMPACT_LIMIT && Boolean(onViewAll);

  const handleOpenDeleteDialog = (checkIn: CheckInEntry) => {
    setError(null);
    setCheckInToDelete(checkIn);
  };

  const handleCloseDeleteDialog = () => {
    if (isDeleting) {
      return;
    }

    setCheckInToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!checkInToDelete) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await onDeleteCheckIn(checkInToDelete.id, checkInToDelete.dateTime);
      setCheckInToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete check-in');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className={`check-in-tracker-card check-in-tracker-card--${variant}`}>
      <header className='check-in-tracker-card__header'>
        <div>
          <h2 className='check-in-tracker-card__title'>{title}</h2>

          <p className='check-in-tracker-card__summary'>
            {summaryLabel}: <span>{totalCheckIns}</span>
          </p>
        </div>

        {showAddButton ? (
          <Button
            icon={<LuPlus />}
            variant='outline'
            color='secondary'
            onClick={addCheckInModal.openModal}
          >
            Add check-in
          </Button>
        ) : null}
      </header>

      {error ? <p className='check-in-tracker-card__error'>{error}</p> : null}

      {visibleCheckIns.length === 0 ? (
        <div className='check-in-tracker-card__empty-state'>
          <div className='check-in-tracker-card__empty-icon'>
            <LuHeartPulse size={24} />
          </div>

          <p>No check-ins recorded yet</p>
        </div>
      ) : (
        <>
          <ul className='check-in-tracker-card__list'>
            {visibleCheckIns.map((checkIn) => {
              const checkInDateLabel = formatDateLabel(checkIn.dateTime);
              const averageLevel = getAverageLevel(checkIn);
              const checkInMeta = getCheckInMeta(checkIn);

              return (
                <li key={checkIn.id} className='check-in-tracker-card__item'>
                  <div className='check-in-tracker-card__icon'>
                    <LuHeartPulse size={22} />
                  </div>

                  <span className='check-in-tracker-card__date'>{checkInDateLabel}</span>

                  <span className='check-in-tracker-card__level'>
                    Avg <strong>{formatLevel(averageLevel)}</strong>
                  </span>

                  <span className='check-in-tracker-card__meta'>{checkInMeta}</span>

                  <button
                    type='button'
                    className='check-in-tracker-card__delete-button'
                    aria-label={`Delete check-in from ${checkInDateLabel}`}
                    onClick={() => handleOpenDeleteDialog(checkIn)}
                  >
                    <AiOutlineDelete size={20} />
                  </button>
                </li>
              );
            })}
          </ul>

          {shouldShowViewAll ? (
            <footer className='check-in-tracker-card__footer'>
              <ViewAllButton title='View all' onClick={onViewAll} />
            </footer>
          ) : null}
        </>
      )}

      {addCheckInModal.modal}

      <ConfirmDialog
        open={Boolean(checkInToDelete)}
        title='Delete check-in?'
        message={
          checkInToDelete
            ? `This will delete your check-in from ${formatDateLabel(checkInToDelete.dateTime)}.`
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
