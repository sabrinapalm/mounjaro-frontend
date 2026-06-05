import { useMemo } from 'react';
import type { WeightEntry } from '../types';
import { getLocalDate } from '../utils/dateHelpers';
import './GoalProgress.css';
import { LuGoal } from 'react-icons/lu';

interface GoalProgressProps {
  weights: WeightEntry[];
  goalWeight?: number;
}

const formatKg = (value: number) => `${value.toFixed(1)} kg`;

const formatWeightLost = (value: number): { text: string; className: string } => {
  if (value >= 0) {
    return { text: `-${formatKg(value)}`, className: '' };
  }
  return { text: `+${formatKg(Math.abs(value))}`, className: 'weight-gain' };
};

export const GoalProgress = ({ weights, goalWeight = 68 }: GoalProgressProps) => {
  const goalData = useMemo(() => {
    if (weights.length === 0) {
      return null;
    }

    const sortedWeights = [...weights].sort(
      (a, b) => getLocalDate(a.date).getTime() - getLocalDate(b.date).getTime()
    );

    const startWeight = sortedWeights[0].weight;
    const currentWeight = sortedWeights[sortedWeights.length - 1].weight;
    const totalToLose = startWeight - goalWeight;
    const weightLost = startWeight - currentWeight;
    const weightToGo = Math.max(0, currentWeight - goalWeight);

    const rawProgress = totalToLose > 0 ? (weightLost / totalToLose) * 100 : 0;
    const clampedProgress = Math.min(100, Math.max(0, rawProgress));

    return {
      startWeight,
      currentWeight,
      totalToLose,
      weightLost,
      weightToGo,
      progress: Math.round(clampedProgress),
    };
  }, [weights, goalWeight]);

  if (!goalData) {
    return null;
  }

  const { progress, startWeight, weightLost, weightToGo } = goalData;

  return (
    <section className='goal-progress-card'>
      <div className='goal-progress-summary'>
        <div className='goal-progress-copy'>
          <p className='goal-progress-title'>Goal Progress</p>
          <p className='goal-progress-subtitle'>You're doing great! Keep it up.</p>
        </div>
        <div className='goal-progress-value'>{progress}%</div>
      </div>

      <div className='goal-progress-bar-wrapper'>
        <div className='goal-progress-bar'>
          <div className='goal-progress-bar-fill' style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className='goal-progress-stat-grid'>
        <div className='goal-progress-stat'>
          <span className='stat-label'>Start Weight</span>
          <span className='stat-value'>{formatKg(startWeight)}</span>
        </div>
        <div className='goal-progress-stat'>
          <span className='stat-label'>Goal Weight</span>
          <span className='stat-value'>{formatKg(goalWeight)}</span>
        </div>
        <div className='goal-progress-stat'>
          <span className='stat-label'>Weight Lost</span>
          <span className={`stat-value ${formatWeightLost(weightLost).className}`}>
            {formatWeightLost(weightLost).text}
          </span>
        </div>
        <div className='goal-progress-stat'>
          <span className='stat-label'>Weight to Go</span>
          <span className='stat-value'>{formatKg(weightToGo)}</span>
        </div>
      </div>

      <div className='goal-progress-target-card'>
        <div className='target-card-icon' aria-hidden='true'>
          <LuGoal size={38} color='currentcolor' />
        </div>
        <div className='target-card-text'>
          <span className='target-card-label'>Goal Weight</span>
          <span className='target-card-value'>{formatKg(goalWeight)}</span>
        </div>
        <button type='button' className='target-card-button' disabled>
          Edit Goal
        </button>
      </div>
    </section>
  );
};
