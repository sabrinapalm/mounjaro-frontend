import { useMemo, useState } from 'react';
import { LuGoal } from 'react-icons/lu';
import { useProfile } from '../context/ProfileContext';
import { useUnitSettings } from '../hooks/useUnitSettings';
import type { UserProfile, WeightEntry } from '../types';
import { calculateBmi } from '../utils/calculateBmi';
import { getLocalDate } from '../utils/dateHelpers';
import { EditGoalWeightModal } from './EditGoalWeightModal';
import './GoalProgress.css';

interface GoalProgressProps {
  weights: WeightEntry[];
  profile: UserProfile;
  onGoalWeightUpdated: (goalWeight: number) => Promise<void>;
}

const getGoalProgressSubtitle = ({
  progress,
  weightLost,
  weightToGo,
  formatWeight,
}: {
  progress: number;
  weightLost: number;
  weightToGo: number;
  formatWeight: (weightInKg: number) => string;
}) => {
  if (weightLost < 0) {
    return 'A little bump up is okay. Progress is not always linear — your next check-in is a fresh start.';
  }

  if (progress <= 0) {
    return 'Your goal journey has started. Add weight updates to watch your progress grow.';
  }

  if (progress < 25) {
    return `You’re ${progress}% of the way to your goal. Small steps still count.`;
  }

  if (progress < 50) {
    return `You’re ${progress}% of the way there. Those small wins are adding up.`;
  }

  if (progress < 75) {
    return `You’re ${progress}% of the way to your goal. That’s real progress.`;
  }

  if (progress < 100) {
    return `You’re ${progress}% of the way there. Only ${formatWeight(weightToGo)} to go.`;
  }

  return 'Goal reached. That’s a huge milestone — amazing work.';
};

const getFormattedWeightLost = ({
  weightLost,
  formatWeight,
}: {
  weightLost: number;
  formatWeight: (weightInKg: number) => string;
}) => {
  if (weightLost > 0) {
    return {
      text: `-${formatWeight(weightLost)}`,
      className: 'positive',
    };
  }

  if (weightLost < 0) {
    return {
      text: `+${formatWeight(Math.abs(weightLost))}`,
      className: 'negative',
    };
  }

  return {
    text: formatWeight(0),
    className: '',
  };
};

export const GoalProgress = ({ weights, profile, onGoalWeightUpdated }: GoalProgressProps) => {
  const { goalWeight, height } = profile;

  const { unitSystem } = useProfile();
  const { weightUnit, displayWeightFromKg } = useUnitSettings(unitSystem);

  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  const formatWeight = (weightInKg: number) => {
    return `${displayWeightFromKg(weightInKg)} ${weightUnit}`;
  };

  const goalData = useMemo(() => {
    if (weights.length === 0 || typeof goalWeight !== 'number') {
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

  if (!goalData || typeof goalWeight !== 'number') {
    return null;
  }

  const { progress, startWeight, weightLost, weightToGo, currentWeight } = goalData;

  const subtitle = getGoalProgressSubtitle({
    progress,
    weightLost,
    weightToGo,
    formatWeight,
  });

  const formattedWeightLost = getFormattedWeightLost({
    weightLost,
    formatWeight,
  });

  const handleOpenEditGoal = () => {
    setGoalError(null);
    setIsEditGoalOpen(true);
  };

  const handleCloseEditGoal = () => {
    if (isSavingGoal) {
      return;
    }

    setIsEditGoalOpen(false);
  };

  const handleUpdateGoalWeight = async (newGoalWeight: number) => {
    setGoalError(null);
    setIsSavingGoal(true);

    try {
      await onGoalWeightUpdated(newGoalWeight);
      setIsEditGoalOpen(false);
    } catch (err) {
      setGoalError(err instanceof Error ? err.message : 'Unable to update goal weight');
      throw err;
    } finally {
      setIsSavingGoal(false);
    }
  };

  const bmi = typeof height === 'number' ? calculateBmi(currentWeight, height) : '—';

  return (
    <section className='goal-progress-card'>
      <div className='goal-progress-summary'>
        <div className='goal-progress-copy'>
          <p className='goal-progress-title'>Goal Progress</p>
          <p className='goal-progress-subtitle'>{subtitle}</p>
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
          <span className='stat-value'>{formatWeight(startWeight)}</span>
        </div>

        <div className='goal-progress-stat'>
          <span className='stat-label'>Goal Weight</span>
          <span className='stat-value'>{formatWeight(goalWeight)}</span>
        </div>

        <div className='goal-progress-stat'>
          <span className='stat-label'>Weight Lost</span>
          <span className={`stat-value ${formattedWeightLost.className}`.trim()}>
            {formattedWeightLost.text}
          </span>
        </div>

        <div className='goal-progress-stat'>
          <span className='stat-label'>Weight to Go</span>
          <span className='stat-value'>{formatWeight(weightToGo)}</span>
        </div>

        <div className='goal-progress-stat'>
          <span className='stat-label'>BMI</span>
          <span className='stat-value'>{bmi}</span>
        </div>
      </div>

      <div className='goal-progress-target-card'>
        <div className='target-card-icon' aria-hidden='true'>
          <LuGoal size={38} color='currentColor' />
        </div>

        <div className='target-card-text'>
          <span className='target-card-label'>Goal Weight</span>
          <span className='target-card-value'>{formatWeight(goalWeight)}</span>
        </div>

        <button type='button' className='target-card__add-button' onClick={handleOpenEditGoal}>
          Edit Goal
        </button>
      </div>

      <EditGoalWeightModal
        open={isEditGoalOpen}
        currentGoalWeight={goalWeight}
        isSubmitting={isSavingGoal}
        error={goalError}
        onClose={handleCloseEditGoal}
        onSubmit={handleUpdateGoalWeight}
      />
    </section>
  );
};
