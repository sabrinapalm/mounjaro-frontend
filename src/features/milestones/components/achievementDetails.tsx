import { useEffect, useRef } from 'react';
import { LuX } from 'react-icons/lu';
import type { Milestone } from '../milestoneTypes';
import {
  formatAchievementDate,
  getAchievementCondition,
  getAchievementStatus,
} from '../utils/achievementPresentation';
import { AchievementProgress } from './achievementCard';
import { AchievementIcon } from './achievementIcon';

type AchievementDetailsProps = { milestone: Milestone; onClose: () => void };

export const AchievementDetails = ({ milestone, onClose }: AchievementDetailsProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const date = formatAchievementDate(milestone.achievementDate);
  useEffect(() => {
    const dialog = dialogRef.current;
    const originalOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const close = () => {
    dialogRef.current?.close();
    onClose();
  };
  return (
    <dialog
      ref={dialogRef}
      className='achievement-details'
      aria-labelledby='achievement-details-title'
      aria-describedby='achievement-details-condition'
      onKeyDown={(event) => {
        // The close button is the dialog's only focusable control.
        if (event.key === 'Tab') {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <button
        ref={closeButtonRef}
        type='button'
        className='achievement-details__close'
        onClick={close}
        aria-label='Close achievement details'
      >
        <LuX size={22} />
      </button>
      <div className='achievement-emblem achievement-emblem--detail' aria-hidden='true'>
        <AchievementIcon icon={milestone.icon} size={30} />
      </div>
      <p className='achievement-eyebrow'>{getAchievementStatus(milestone)}</p>
      <h2 id='achievement-details-title'>{milestone.title}</h2>
      <p id='achievement-details-condition'>{getAchievementCondition(milestone)}</p>
      {milestone.status === 'completed' ? (
        <p className='achievement-details__date'>
          {date ? `Achieved ${date}` : 'Unlock date unavailable'}
        </p>
      ) : (
        <div className='achievement-details__progress'>
          <p>{milestone.description}</p>
          {milestone.progress !== undefined && (
            <>
              <AchievementProgress milestone={milestone} />
              <span>{Math.round(milestone.progress)}% complete</span>
            </>
          )}
        </div>
      )}
      {milestone.id.startsWith('goal-') && (
        <p className='achievement-details__note'>Based on your current goal weight.</p>
      )}
    </dialog>
  );
};
