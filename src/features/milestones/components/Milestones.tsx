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
  const { visibleMilestones, weightLossMilestones, nextWeightLossMilestone } = useMilestones({
    weights,
    shots,
    startWeight,
    goalWeight,
  });

  const isCompact = variant === 'compact';

  const displayedMilestones = isCompact
    ? visibleMilestones.slice(0, COMPACT_LIMIT)
    : visibleMilestones.filter((milestone) => !milestone.id.startsWith('weight-loss-'));

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

      {!isCompact ? (
        <>
          <section className='milestones-card__next'>
            <div className='milestones-card__next-copy'>
              <p className='milestones-card__eyebrow'>Next weight achievement</p>
              {nextWeightLossMilestone ? (
                <>
                  <h3 className='milestones-card__next-title'>{nextWeightLossMilestone.title}</h3>
                  <p className='milestones-card__next-remaining'>
                    {nextWeightLossMilestone.remaining}
                  </p>
                  <div
                    className='milestones-card__next-progress'
                    role='progressbar'
                    aria-label={`Progress to ${nextWeightLossMilestone.title}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={nextWeightLossMilestone.progress}
                  >
                    <span style={{ width: `${nextWeightLossMilestone.progress}%` }} />
                  </div>
                </>
              ) : (
                <p className='milestones-card__empty'>
                  Add a starting weight and your first weight entry to see your next 5 kg
                  achievement.
                </p>
              )}
            </div>
          </section>

          <section className='milestones-card__achievements'>
            <h3 className='milestones-card__section-title'>Weight-loss achievements</h3>
            {weightLossMilestones.length > 0 ? (
              <ul className='milestones-card__grid'>
                {weightLossMilestones.map((milestone) => {
                  const isCompleted = milestone.status === 'completed';
                  const isUpcoming = milestone.weightLossStatus === 'upcoming';
                  const StateIcon = isCompleted ? FiCheck : isUpcoming ? FiTrendingDown : FiLock;

                  return (
                    <li
                      key={milestone.id}
                      className={[
                        'milestones-card__achievement',
                        `milestones-card__achievement--${isCompleted ? 'completed' : isUpcoming ? 'upcoming' : 'locked'}`,
                      ].join(' ')}
                    >
                      <div className='milestones-card__achievement-icon'>
                        <StateIcon size={19} />
                      </div>
                      <h4 className='milestones-card__achievement-title'>{milestone.title}</h4>
                      <p className='milestones-card__achievement-status'>
                        {isCompleted ? 'Achieved' : isUpcoming ? 'Up next' : 'Locked'}
                      </p>
                      {isCompleted && milestone.achievementDate ? (
                        <p className='milestones-card__achievement-date'>{milestone.description}</p>
                      ) : null}
                      {isUpcoming ? (
                        <>
                          <p className='milestones-card__achievement-remaining'>
                            {milestone.description}
                          </p>
                          <div
                            className='milestones-card__achievement-progress'
                            role='progressbar'
                            aria-label={`Progress to ${milestone.title}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={milestone.progress ?? 0}
                          >
                            <span style={{ width: `${milestone.progress ?? 0}%` }} />
                          </div>
                        </>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className='milestones-card__empty'>
                Weight-loss achievements will appear after you add a starting weight and a
                measurement.
              </p>
            )}
          </section>
        </>
      ) : null}

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
