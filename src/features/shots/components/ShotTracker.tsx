import { useMemo, useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { PiSyringeBold } from 'react-icons/pi';
import { useIntl } from 'react-intl';
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
const INITIAL_HISTORY_LIMIT = 3;
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
  title = 'Recent shots',
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
          'history-card__row shot-tracker-card__item',
          variant === 'full' ? 'shot-tracker-card__item--full' : '',
        ].join(' ')}
      >
        {variant === 'full' ? (
          <>
            <div className='history-card__history-row shot-tracker-card__history-row'>
              <span className='shot-tracker-card__icon'>
                <PiSyringeBold size={19} />
              </span>
              <div className='shot-tracker-card__primary-data'>
                <span className='history-card__date shot-tracker-card__date'>{shotDateLabel}</span>
                <span className='history-card__value shot-tracker-card__dosage'>
                  {shot.dosage.toFixed(1)} mg
                </span>
              </div>
              <span className='shot-tracker-card__site'>
                {shot.injectionSite ? formatMessage(messages[shot.injectionSite]) : '-'}
              </span>
              <HistoryDeleteButton
                className='shot-tracker-card__delete-button'
                label={`Delete shot from ${shotDateLabel}`}
                onClick={() => handleOpenDeleteDialog(shot)}
              />
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

            <span className='history-card__date shot-tracker-card__date'>{shotDateLabel}</span>

            <span className='history-card__value shot-tracker-card__dosage'>
              {shot.dosage.toFixed(1)} mg
            </span>

            <span className='shot-tracker-card__site'>
              {shot.injectionSite ? formatMessage(messages[shot.injectionSite]) : '-'}
            </span>

            <HistoryDeleteButton
              className='shot-tracker-card__delete-button'
              label={`Delete shot from ${shotDateLabel}`}
              onClick={() => handleOpenDeleteDialog(shot)}
            />
          </>
        )}
      </li>
    );
  };

  return (
    <HistoryCard
      className={`history-card--${variant} shot-tracker-card shot-tracker-card--${variant}`}
    >
      <HistoryCardHeader
        title={title}
        summary={
          <>
            {' '}
            {summaryLabel}: <span>{totalShots}</span>
          </>
        }
        action={
          showAddButton ? (
            <Button icon={<LuPlus size={22} />} onClick={addShotModal.openModal}>
              Add shot
            </Button>
          ) : null
        }
      />

      {error ? (
        <p className='history-card__error' role='alert'>
          {error}
        </p>
      ) : null}

      {visibleShots.length === 0 ? (
        <HistoryEmptyState icon={<PiSyringeBold size={24} />}>
          No shots recorded yet
        </HistoryEmptyState>
      ) : (
        <>
          {variant === 'full' ? (
            <div className='shot-tracker-card__history'>
              {visibleShotGroups.map((group) => (
                <HistoryGroup key={group.key} label={group.label}>
                  {group.shots.map(renderShot)}
                </HistoryGroup>
              ))}
            </div>
          ) : (
            <ul className='history-card__list shot-tracker-card__list'>
              {visibleShots.map(renderShot)}
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
    </HistoryCard>
  );
};
