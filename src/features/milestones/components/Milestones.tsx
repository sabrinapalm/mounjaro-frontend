import { FiCheck, FiLock, FiStar, FiTarget, FiTrendingDown, FiZap } from 'react-icons/fi';
import { LuPartyPopper } from 'react-icons/lu';
import type { ShotEntry, WeightEntry } from '../../../shared/types';
import { type Milestone, useMilestones } from '../hooks/useMilestones';
import './Milestones.css';
import { Button } from '../../../shared/components/Button';

type MilestonesVariant = 'compact' | 'full';

interface MilestonesProps {
  weights: WeightEntry[];
  shots: ShotEntry[];
  startWeight?: number | null;
  goalWeight?: number | null;
  onViewAll?: () => void;
  variant?: MilestonesVariant;
}

const COMPACT_LIMIT = 3;

const getMilestoneIcon = (icon: Milestone['icon']) => {
  if (icon === 'target') {
    return <FiTarget size={22} />;
  }

  if (icon === 'trend') {
    return <FiTrendingDown size={22} />;
  }

  if (icon === 'zap') {
    return <FiZap size={22} />;
  }

  if (icon === 'party') {
    return <LuPartyPopper size={22} />;
  }

  return <FiStar size={22} />;
};

export const Milestones = ({
  weights,
  shots,
  startWeight,
  goalWeight,
  onViewAll,
  variant = 'compact',
}: MilestonesProps) => {
  const { visibleMilestones } = useMilestones({
    weights,
    shots,
    startWeight,
    goalWeight,
  });

  const isCompact = variant === 'compact';

  const displayedMilestones = isCompact
    ? visibleMilestones.slice(0, COMPACT_LIMIT)
    : visibleMilestones;

  const shouldShowViewAll = isCompact && visibleMilestones.length > COMPACT_LIMIT && onViewAll;

  return (
    <section className={`milestones-card milestones-card--${variant}`}>
      <header className='milestones-card__header'>
        <h2 className='milestones-card__title'>Milestones</h2>
        {shouldShowViewAll ? (
          <Button variant='text' onClick={onViewAll}>
            View all
          </Button>
        ) : null}
      </header>

      <ul className='milestones-card__list'>
        {displayedMilestones.map((milestone) => (
          <li
            key={milestone.id}
            className={['milestones-card__item', `milestones-card__item--${milestone.status}`].join(
              ' '
            )}
          >
            <div className='milestones-card__icon'>{getMilestoneIcon(milestone.icon)}</div>

            <div className='milestones-card__content'>
              <div className='milestones-card__text-row'>
                <div>
                  <h3 className='milestones-card__item-title'>{milestone.title}</h3>
                  <p className='milestones-card__description'>{milestone.description}</p>
                </div>

                {milestone.status === 'completed' ? (
                  <span className='milestones-card__status milestones-card__status--completed'>
                    <FiCheck size={20} />
                  </span>
                ) : milestone.status === 'locked' ? (
                  <span className='milestones-card__status milestones-card__status--locked'>
                    <FiLock size={20} />
                  </span>
                ) : (
                  <span className='milestones-card__progress-value'>
                    {Math.round(milestone.progress ?? 0)}%
                  </span>
                )}
              </div>

              {milestone.status === 'inProgress' ? (
                <div className='milestones-card__progress-track' aria-hidden='true'>
                  <span
                    className='milestones-card__progress-fill'
                    style={{ width: `${milestone.progress ?? 0}%` }}
                  />
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
