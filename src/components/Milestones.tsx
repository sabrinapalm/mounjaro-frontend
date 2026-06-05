import { useMemo } from 'react';
import { FiCheck, FiLock, FiStar, FiTarget, FiTrendingDown, FiZap } from 'react-icons/fi';
import type { ShotEntry, WeightEntry } from '../types';
import './Milestones.css';

type MilestoneStatus = 'completed' | 'inProgress' | 'locked';

type Milestone = {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  progress?: number;
  icon: 'star' | 'target' | 'trend' | 'zap';
};

interface MilestonesProps {
  weights: WeightEntry[];
  shots: ShotEntry[];
  startWeight?: number | null;
  goalWeight?: number | null;
  maxVisible?: number;
  onViewAll?: () => void;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const clampProgress = (value: number) => {
  return Math.min(Math.max(value, 0), 100);
};

const getLatestWeight = (weights: WeightEntry[]) => {
  return [...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
};

const getFirstShotDate = (shots: ShotEntry[]) => {
  return [...shots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    ?.date;
};

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

  return <FiStar size={22} />;
};

const getWeightLossMilestoneStatus = (currentLoss: number, targetLoss: number): MilestoneStatus => {
  if (currentLoss >= targetLoss) {
    return 'completed';
  }

  if (currentLoss > 0) {
    return 'inProgress';
  }

  return 'locked';
};

const getWeightLossDescription = (currentLoss: number, targetLoss: number) => {
  if (currentLoss >= targetLoss) {
    return 'Achieved';
  }

  if (currentLoss > 0) {
    return `${Math.max(targetLoss - currentLoss, 0).toFixed(1)} kg to go`;
  }

  return `${targetLoss.toFixed(1)} kg to go`;
};

export const Milestones = ({
  weights,
  shots,
  startWeight,
  goalWeight,
  maxVisible = 5,
  onViewAll,
}: MilestonesProps) => {
  const milestones = useMemo<Milestone[]>(() => {
    const latestWeightEntry = getLatestWeight(weights);
    const latestWeight = latestWeightEntry?.weight ?? null;

    const hasStartWeight = typeof startWeight === 'number' && startWeight > 0;
    const hasGoalWeight = typeof goalWeight === 'number' && goalWeight > 0;
    const hasLatestWeight = typeof latestWeight === 'number';

    const currentLoss = hasStartWeight && hasLatestWeight ? startWeight - latestWeight : 0;
    const safeCurrentLoss = Math.max(currentLoss, 0);

    const goalLoss = hasStartWeight && hasGoalWeight ? startWeight - goalWeight : 0;
    const goalProgress = goalLoss > 0 ? clampProgress((safeCurrentLoss / goalLoss) * 100) : 0;

    const firstShotDate = getFirstShotDate(shots);

    const first5KgStatus = getWeightLossMilestoneStatus(safeCurrentLoss, 5);
    const first10PercentTarget = goalLoss > 0 ? goalLoss * 0.1 : 0;
    const first10PercentStatus =
      first10PercentTarget > 0
        ? getWeightLossMilestoneStatus(safeCurrentLoss, first10PercentTarget)
        : 'locked';

    const fifteenKgStatus = getWeightLossMilestoneStatus(safeCurrentLoss, 15);
    const twentyKgStatus = getWeightLossMilestoneStatus(safeCurrentLoss, 20);

    const goalWeightStatus: MilestoneStatus =
      hasGoalWeight && hasLatestWeight && latestWeight <= goalWeight
        ? 'completed'
        : goalProgress > 0
          ? 'inProgress'
          : 'locked';

    return [
      {
        id: 'first-shot',
        title: 'First shot logged',
        description: firstShotDate
          ? `Achieved on ${formatDate(firstShotDate)}`
          : 'Log your first injection',
        status: firstShotDate ? 'completed' : 'locked',
        icon: 'zap',
      },
      {
        id: 'first-5-kg',
        title: 'First 5 kg lost',
        description: getWeightLossDescription(safeCurrentLoss, 5),
        status: first5KgStatus,
        progress: clampProgress((safeCurrentLoss / 5) * 100),
        icon: 'star',
      },
      {
        id: 'first-10-percent',
        title: 'First 10% of goal',
        description:
          first10PercentTarget > 0
            ? getWeightLossDescription(safeCurrentLoss, first10PercentTarget)
            : 'Add a goal weight',
        status: first10PercentStatus,
        progress:
          first10PercentTarget > 0
            ? clampProgress((safeCurrentLoss / first10PercentTarget) * 100)
            : 0,
        icon: 'target',
      },
      {
        id: '15-kg-lost',
        title: '15 kg lost',
        description: getWeightLossDescription(safeCurrentLoss, 15),
        status: fifteenKgStatus,
        progress: clampProgress((safeCurrentLoss / 15) * 100),
        icon: 'trend',
      },
      {
        id: '20-kg-lost',
        title: '20 kg lost',
        description: getWeightLossDescription(safeCurrentLoss, 20),
        status: twentyKgStatus,
        progress: clampProgress((safeCurrentLoss / 20) * 100),
        icon: 'star',
      },
      {
        id: 'goal-weight',
        title: 'Goal weight',
        description:
          goalWeightStatus === 'completed'
            ? 'Achieved'
            : hasGoalWeight && hasLatestWeight
              ? `${Math.max(latestWeight - goalWeight, 0).toFixed(1)} kg to go`
              : 'Add your goal weight',
        status: goalWeightStatus,
        progress: goalProgress,
        icon: 'target',
      },
    ];
  }, [goalWeight, shots, startWeight, weights]);

  const visibleMilestones = milestones.slice(0, maxVisible);

  return (
    <section className='milestones-card'>
      <header className='milestones-card__header'>
        <h2 className='milestones-card__title'>Milestones</h2>

        {onViewAll ? (
          <button type='button' className='milestones-card__view-all' onClick={onViewAll}>
            View all
          </button>
        ) : null}
      </header>

      <ul className='milestones-card__list'>
        {visibleMilestones.map((milestone) => (
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
