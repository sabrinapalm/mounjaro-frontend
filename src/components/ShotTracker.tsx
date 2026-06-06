import { useMemo, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { PiSyringeBold } from 'react-icons/pi';
import type { ShotEntry } from '../types';
import { AddShotModal } from './AddShotModal';
import { ConfirmDialog } from './ConfirmDialog';
import './ShotTracker.css';

type ShotTrackerVariant = 'compact' | 'full';

interface ShotTrackerProps {
  shots: ShotEntry[];
  onShotAdded: (shot: ShotEntry) => Promise<void>;
  onDeleteShot: (id: string, date: string) => Promise<void>;
  title?: string;
  summaryLabel?: string;
  variant?: ShotTrackerVariant;
}

export const ShotTracker = ({
  shots,
  onShotAdded,
  onDeleteShot,
  title = 'Recent Shots',
  summaryLabel = 'Total shots',
  variant = 'compact',
}: ShotTrackerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isAddShotModalOpen, setIsAddShotModalOpen] = useState(false);
  const [isAddingShot, setIsAddingShot] = useState(false);
  const [shotToDelete, setShotToDelete] = useState<ShotEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedShots = useMemo(() => {
    return [...shots].sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();

      return bTime - aTime;
    });
  }, [shots]);

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

  const handleAddShot = async (newShot: ShotEntry) => {
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
      await onDeleteShot(shotToDelete.id, shotToDelete.date);
      setShotToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete shot');
    } finally {
      setIsDeleting(false);
    }
  };

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

      {sortedShots.length === 0 ? (
        <div className='shot-tracker-card__empty-state'>
          <div className='shot-tracker-card__empty-icon'>
            <PiSyringeBold size={24} />
          </div>

          <p>No shots recorded yet</p>
        </div>
      ) : (
        <ul className='shot-tracker-card__list'>
          {sortedShots.map((shot) => (
            <li key={shot.id} className='shot-tracker-card__item'>
              <div className='shot-tracker-card__icon'>
                <PiSyringeBold size={22} />
              </div>

              <span className='shot-tracker-card__date'>
                {new Date(shot.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>

              <span className='shot-tracker-card__dosage'>{shot.dosage.toFixed(1)} mg</span>
              <span className='shot-tracker-card__site'>{shot.injectionSite || '-'}</span>

              <button
                type='button'
                className='shot-tracker-card__delete-button'
                aria-label={`Delete shot from ${new Date(shot.date).toLocaleDateString()}`}
                onClick={() => handleOpenDeleteDialog(shot)}
              >
                <AiOutlineDelete size={20} />
              </button>
            </li>
          ))}
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
            ? `This will delete your ${shotToDelete.dosage} mg shot from ${new Date(
                shotToDelete.date
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
