import { useMemo } from 'react';
import type { UserProfile, WeightEntry } from '../types';
import { getLocalDate } from '../utils/dateHelpers';
import './GoalProgress.css';
import { LuGoal } from 'react-icons/lu';
import { calculateBmi } from '../utils/calculateBmi';
import { formatKg } from '../utils/formatKg';
import { formatWeightLost } from '../utils/formatWeightLoss';

interface GoalProgressProps {
  weights: WeightEntry[];
  profile: UserProfile;
}

export const GoalProgress = ({ weights, profile }: GoalProgressProps) => {
  const { goalWeight, height } = profile;
  const goalData = useMemo(() => {
    if (weights.length === 0) {
      return null;
    }

    const sortedWeights = [...weights].sort(
      (a, b) => getLocalDate(a.date).getTime() - getLocalDate(b.date).getTime()
    );

    const startWeight = profile.startWeight ?? sortedWeights[0].weight;
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
  }, [weights, profile.startWeight, goalWeight]);

  if (!goalData) {
    return null;
  }

  const { progress, startWeight, weightLost, weightToGo, currentWeight } = goalData;

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
        <div className='goal-progress-stat'>
          <span className='stat-label'>BMI</span>
          <span className='stat-value'>{calculateBmi(currentWeight, height)}</span>
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
