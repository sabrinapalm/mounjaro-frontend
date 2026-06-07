import { useMemo, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { PiSyringeBold } from 'react-icons/pi';
import type { CreateShotInput, ShotEntry } from '../types';
import { formatDateLabel, getTimestamp } from '../utils/dateHelpers';
import { AddShotModal } from './AddShotModal';
import { ConfirmDialog } from './ConfirmDialog';
import './ShotTracker.css';
import { useIntl } from 'react-intl';
import { messages } from '../i18n/messages';

type ShotTrackerVariant = 'compact' | 'full';

const COMPACT_LIMIT = 3;

interface ShotTrackerProps {
  shots: ShotEntry[];
  onShotAdded: (shot: CreateShotInput) => Promise<void>;
  onDeleteShot: (id: string, dateTime: string) => Promise<void>;
  onViewAll?: () => void;
  title?: string;
  summaryLabel?: string;
  variant?: ShotTrackerVariant;
}

export const ShotTracker = ({
  shots,
  onShotAdded,
  onDeleteShot,
  onViewAll,
  title = 'Recent Shots',
  summaryLabel = 'Total shots',
  variant = 'compact',
}: ShotTrackerProps) => {
  const { formatMessage } = useIntl();
  const [error, setError] = useState<string | null>(null);
  const [isAddShotModalOpen, setIsAddShotModalOpen] = useState(false);
  const [isAddingShot, setIsAddingShot] = useState(false);
  const [shotToDelete, setShotToDelete] = useState<ShotEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedShots = useMemo(() => {
    return [...shots].sort((firstShot, secondShot) => {
      const dateDifference = getTimestamp(secondShot.dateTime) - getTimestamp(firstShot.dateTime);

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return secondShot.id.localeCompare(firstShot.id);
    });
  }, [shots]);

  const visibleShots = useMemo(() => {
    if (variant === 'compact') {
      return sortedShots.slice(0, COMPACT_LIMIT);
    }

    return sortedShots;
  }, [sortedShots, variant]);

  const totalShots = sortedShots.length;

  const handleOpenAddShotModal = () => {
    setError(null);
    setIsAddShotModalOpen(true);
  };

  const handleCloseAddShotModal = () => {
    if (isAddingShot) {
      return;
    }

    setIsAddShotModalOpen(false);
  };

  const handleAddShot = async (newShot: CreateShotInput) => {
    setError(null);
    setIsAddingShot(true);

    try {
      await onShotAdded(newShot);
      setIsAddShotModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add shot');
      throw err;
    } finally {
      setIsAddingShot(false);
    }
  };
  const handleOpenDeleteDialog = (shot: ShotEntry) => {
    setError(null);
    setShotToDelete(shot);
  };

  const handleCloseDeleteDialog = () => {
    if (isDeleting) {
      return;
    }

    setShotToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!shotToDelete) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await onDeleteShot(shotToDelete.id, shotToDelete.dateTime);
      setShotToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete shot');
    } finally {
      setIsDeleting(false);
    }
  };

  const shouldShowViewAll =
    variant === 'compact' && sortedShots.length > COMPACT_LIMIT && onViewAll;

  return (
    <section className={`shot-tracker-card shot-tracker-card--${variant}`}>
      <header className='shot-tracker-card__header'>
        <div>
          <h2 className='shot-tracker-card__title'>{title}</h2>

          <p className='shot-tracker-card__summary'>
            {summaryLabel}: <span>{totalShots}</span>
          </p>
        </div>

        <button
          type='button'
          className='shot-tracker-card__add-button'
          onClick={handleOpenAddShotModal}
        >
          Add Shot
        </button>
      </header>

      {error && !isAddShotModalOpen && <p className='shot-tracker-card__error'>{error}</p>}

      {visibleShots.length === 0 ? (
        <div className='shot-tracker-card__empty-state'>
          <div className='shot-tracker-card__empty-icon'>
            <PiSyringeBold size={24} />
          </div>

          <p>No shots recorded yet</p>
        </div>
      ) : (
        <ul className='shot-tracker-card__list'>
          {visibleShots.map((shot) => {
            const shotDateLabel = formatDateLabel(shot.dateTime);

            return (
              <li key={shot.id} className='shot-tracker-card__item'>
                <div className='shot-tracker-card__icon'>
                  <PiSyringeBold size={22} />
                </div>
                <span className='shot-tracker-card__date'>{shotDateLabel}</span>
                <span className='shot-tracker-card__dosage'>{shot.dosage.toFixed(1)} mg</span>
                <span className='shot-tracker-card__site'>
                  {shot.injectionSite ? formatMessage(messages[shot.injectionSite]) : '-'}
                </span>
                <button
                  type='button'
                  className='shot-tracker-card__delete-button'
                  aria-label={`Delete shot from ${shotDateLabel}`}
                  onClick={() => handleOpenDeleteDialog(shot)}
                >
                  <AiOutlineDelete size={20} />
                </button>
              </li>
            );
          })}
          {shouldShowViewAll ? (
            <footer className='shot-tracker-card__footer'>
              <button
                type='button'
                className='shot-tracker-card__view-all-button'
                onClick={onViewAll}
              >
                View all
              </button>
            </footer>
          ) : null}
        </ul>
      )}

      <AddShotModal
        open={isAddShotModalOpen}
        isSubmitting={isAddingShot}
        error={error}
        onClose={handleCloseAddShotModal}
        onShotAdded={handleAddShot}
      />

      <ConfirmDialog
        open={Boolean(shotToDelete)}
        title='Delete shot?'
        message={
          shotToDelete
            ? `This will delete your ${shotToDelete.dosage} mg shot from ${formatDateLabel(
                shotToDelete.dateTime
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
