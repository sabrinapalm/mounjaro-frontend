import { useMemo, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { LuPlus } from 'react-icons/lu';
import { PiSyringeBold } from 'react-icons/pi';
import { useIntl } from 'react-intl';
import { Button } from '../../../shared/components/Button';
import { ConfirmDialog } from '../../../shared/components/modals/ConfirmDialog';
import { ViewAllButton } from '../../../shared/components/ViewAllButton';
import { messages } from '../../../shared/i18n/messages';
import type { CreateShotInput, ShotEntry } from '../../../shared/types';
import { formatDateLabel, getTimestamp } from '../../../shared/utils/dateHelpers';
import { useAddShotModal } from '../hooks/useAddShotModal';
import './ShotTracker.css';

type ShotTrackerVariant = 'compact' | 'full';

const COMPACT_LIMIT = 3;

interface ShotTrackerProps {
  shots: ShotEntry[];
  onShotAdded: (shot: CreateShotInput) => Promise<void>;
  onDeleteShot: (id: string, dateTime: string) => Promise<void>;
  onViewAll?: () => void;
  title?: string;
  showAddButton?: boolean;
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
  showAddButton = true,
  variant = 'compact',
}: ShotTrackerProps) => {
  const { formatMessage } = useIntl();

  const addShotModal = useAddShotModal({ onShotAdded });

  const [error, setError] = useState<string | null>(null);
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

  const shouldShowViewAll =
    variant === 'compact' && sortedShots.length > COMPACT_LIMIT && Boolean(onViewAll);

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

  return (
    <section className={`shot-tracker-card shot-tracker-card--${variant}`}>
      <header className='shot-tracker-card__header'>
        <div>
          <h2 className='shot-tracker-card__title'>{title}</h2>

          <p className='shot-tracker-card__summary'>
            {summaryLabel}: <span>{totalShots}</span>
          </p>
        </div>

        {showAddButton ? (
          <Button icon={<LuPlus size={22} />} onClick={addShotModal.openModal}>
            Add shot
          </Button>
        ) : null}
      </header>

      {error ? <p className='shot-tracker-card__error'>{error}</p> : null}

      {visibleShots.length === 0 ? (
        <div className='shot-tracker-card__empty-state'>
          <div className='shot-tracker-card__empty-icon'>
            <PiSyringeBold size={24} />
          </div>

          <p>No shots recorded yet</p>
        </div>
      ) : (
        <>
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
          </ul>

          {shouldShowViewAll ? (
            <footer className='shot-tracker-card__footer'>
              <ViewAllButton title='View all' onClick={onViewAll} />
            </footer>
          ) : null}
        </>
      )}

      {addShotModal.modal}

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
