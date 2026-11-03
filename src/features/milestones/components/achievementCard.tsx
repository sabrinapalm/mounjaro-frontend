import { LuCheck, LuChevronRight, LuLockKeyhole } from 'react-icons/lu';
import type { Milestone } from '../milestoneTypes';
import {
  formatAchievementDate,
  getAchievementState,
  getAchievementStatus,
} from '../utils/achievementPresentation';
import { AchievementIcon } from './achievementIcon';

type AchievementCardProps = {
  milestone: Milestone;
  onSelect: (milestone: Milestone) => void;
  badge?: boolean;
};

export const AchievementProgress = ({ milestone }: { milestone: Milestone }) => (
  <div
    className='achievement-progress'
    role='progressbar'
    aria-label={`Progress to ${milestone.title}`}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={milestone.progress ?? 0}
  >
    <span style={{ width: `${milestone.progress ?? 0}%` }} />
  </div>
);

export const AchievementCard = ({ milestone, onSelect, badge = false }: AchievementCardProps) => {
  const state = getAchievementState(milestone);
  const date = formatAchievementDate(milestone.achievementDate, true);
  const status = getAchievementStatus(milestone);
  return (
    <li
      className={`${badge ? 'achievement-badge' : 'achievement-card'} achievement-state--${state}`}
    >
      <button
        type='button'
        className={badge ? 'achievement-badge__button' : 'achievement-card__button'}
        onClick={() => onSelect(milestone)}
        aria-haspopup='dialog'
        aria-label={`${milestone.title} · ${status} · View details`}
      >
        <span className='achievement-emblem' aria-hidden='true'>
          {badge ? (
            <>
              {state === 'locked' ? (
                <LuLockKeyhole size={16} />
              ) : (
                <AchievementIcon icon={milestone.icon} size={16} />
              )}
              <span className='achievement-badge__amount'>
                {milestone.title.replace(/ lost$/, '')}
              </span>
            </>
          ) : state === 'locked' ? (
            <LuLockKeyhole size={24} />
          ) : (
            <AchievementIcon icon={milestone.icon} />
          )}
          {state === 'completed' && (
            <span className='achievement-emblem__check'>
              <LuCheck size={12} />
            </span>
          )}
        </span>
        <span className='achievement-card__copy'>
          <span className='achievement-card__title'>{milestone.title}</span>
          <span className='achievement-card__status'>{status}</span>
          {state === 'completed' ? (
            date && <span className='achievement-card__description'>Achieved {date}</span>
          ) : (
            <span className='achievement-card__description'>{milestone.description}</span>
          )}
          {state === 'inProgress' && <AchievementProgress milestone={milestone} />}
        </span>
        {!badge && (
          <LuChevronRight className='achievement-card__arrow' size={16} aria-hidden='true' />
        )}
      </button>
    </li>
  );
};
