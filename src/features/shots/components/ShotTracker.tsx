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
import { formatDateLabel } from '../../../shared/utils/dateHelpers';
import { useAddShotModal } from '../hooks/useAddShotModal';
import {
  getNextShotHistoryCount,
  groupShotsByMonth,
  sortShotsNewestFirst,
} from '../utils/shotHistoryUtils';
import { formatSideEffect } from '../utils/shotStatsUtils';
import './ShotTracker.css';

type ShotTrackerVariant = 'compact' | 'full';

const COMPACT_LIMIT = 3;
const INITIAL_HISTORY_LIMIT = 10;
const HISTORY_PAGE_SIZE = 10;

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
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(INITIAL_HISTORY_LIMIT);

  const sortedShots = useMemo(() => {
    return sortShotsNewestFirst(shots);
  }, [shots]);

  const visibleShots = useMemo(() => {
    if (variant === 'compact') {
      return sortedShots.slice(0, COMPACT_LIMIT);
    }

    return sortedShots.slice(0, visibleHistoryCount);
  }, [sortedShots, variant, visibleHistoryCount]);

  const visibleShotGroups = useMemo(() => groupShotsByMonth(visibleShots), [visibleShots]);

  const totalShots = sortedShots.length;

  const shouldShowViewAll =
    variant === 'compact' && sortedShots.length > COMPACT_LIMIT && Boolean(onViewAll);
  const shouldShowMore = variant === 'full' && visibleShots.length < totalShots;

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

  const renderShot = (shot: ShotEntry) => {
    const shotDateLabel = formatDateLabel(shot.dateTime);
    const hasDetails = Boolean(shot.notes?.trim() || shot.sideEffects?.length);

    return (
      <li
        key={shot.id}
        className={[
          'shot-tracker-card__item',
          variant === 'full' ? 'shot-tracker-card__item--full' : '',
        ].join(' ')}
      >
        {variant === 'full' ? (
          <>
            <div className='shot-tracker-card__history-row'>
              <span className='shot-tracker-card__icon'>
                <PiSyringeBold size={19} />
              </span>
              <div className='shot-tracker-card__primary-data'>
                <span className='shot-tracker-card__date'>{shotDateLabel}</span>
                <span className='shot-tracker-card__dosage'>{shot.dosage.toFixed(1)} mg</span>
              </div>
              <span className='shot-tracker-card__site'>
                {shot.injectionSite ? formatMessage(messages[shot.injectionSite]) : '-'}
              </span>
              <button
                type='button'
                className='shot-tracker-card__delete-button'
                aria-label={`Delete shot from ${shotDateLabel}`}
                onClick={() => handleOpenDeleteDialog(shot)}
              >
                <AiOutlineDelete size={19} />
              </button>
            </div>
            {hasDetails ? (
              <details className='shot-tracker-card__details'>
                <summary>View notes and side effects</summary>
                <div className='shot-tracker-card__details-content'>
                  {shot.sideEffects?.length ? (
                    <div>
                      <strong>Side effects</strong>
                      <ul>
                        {shot.sideEffects.map((sideEffect) => (
                          <li key={sideEffect}>{formatSideEffect(sideEffect)}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {shot.notes?.trim() ? (
                    <div>
                      <strong>Notes</strong>
                      <p>{shot.notes}</p>
                    </div>
                  ) : null}
                </div>
              </details>
            ) : null}
          </>
        ) : (
          <>
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
          </>
        )}
      </li>
    );
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
          {variant === 'full' ? (
            <div className='shot-tracker-card__history'>
              {visibleShotGroups.map((group) => (
                <section className='shot-tracker-card__month' key={group.key}>
                  <h3 className='shot-tracker-card__month-title'>{group.label}</h3>
                  <ul className='shot-tracker-card__list'>{group.shots.map(renderShot)}</ul>
                </section>
              ))}
            </div>
          ) : (
            <ul className='shot-tracker-card__list'>{visibleShots.map(renderShot)}</ul>
          )}

          {shouldShowViewAll ? (
            <footer className='shot-tracker-card__footer'>
              <ViewAllButton title='View all' onClick={onViewAll} />
            </footer>
          ) : null}
          {shouldShowMore ? (
            <footer className='shot-tracker-card__footer'>
              <Button
                variant='text'
                onClick={() =>
                  setVisibleHistoryCount((currentCount) =>
                    getNextShotHistoryCount(currentCount, totalShots, HISTORY_PAGE_SIZE)
                  )
                }
              >
                Show more ({totalShots - visibleShots.length} remaining)
              </Button>
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
