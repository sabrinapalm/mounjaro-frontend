import { useMemo, useState } from 'react';
import { LuGoal } from 'react-icons/lu';
import { useUnitSettings } from '../hooks/useUnitSettings';
import type { UserProfile, WeightEntry } from '../types';
import { calculateBmi } from '../utils/calculateBmi';
import { getTimestamp } from '../utils/dateHelpers';
import { EditGoalWeightModal } from './modals/EditGoalWeightModal';
import './GoalProgress.css';
import { Button } from './general/Button';

interface GoalProgressProps {
  weights: WeightEntry[];
  profile: UserProfile;
  onGoalWeightUpdated: (goalWeight: number) => Promise<void>;
}

const getWeightDateTime = (entry: WeightEntry) => {
  return entry.dateTime ?? entry.dateTime;
};

const getWeightTimestamp = (entry: WeightEntry) => {
  const timestamp = getTimestamp(getWeightDateTime(entry));

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const timestampFromId = entry.id?.split('_')[1];

  return timestampFromId ? Number(timestampFromId) : 0;
};

const getGoalProgressSubtitle = ({
  hasWeights,
  hasGoalWeight,
  progress,
  weightLost,
  weightToGo,
  formatWeight,
}: {
  hasWeights: boolean;
  hasGoalWeight: boolean;
  progress: number;
  weightLost: number;
  weightToGo: number;
  formatWeight: (weightInKg: number) => string;
}) => {
  if (!hasGoalWeight) {
    return 'Set a goal weight to start tracking your progress toward it.';
  }

  if (!hasWeights) {
    return 'Add your first weight check-in to start seeing your goal progress.';
  }

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
  weightLost: number | null;
  formatWeight: (weightInKg: number) => string;
}) => {
  if (weightLost === null) {
    return {
      text: '—',
      className: '',
    };
  }

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
  const { goalWeight, height, unitSystem } = profile;

  const { weightUnit, displayWeightFromKg } = useUnitSettings(unitSystem ?? 'metric');

  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  const hasGoalWeight = typeof goalWeight === 'number';
  const hasWeights = weights.length > 0;

  const formatWeight = (weightInKg: number | null) => {
    if (typeof weightInKg !== 'number') {
      return '—';
    }

    return `${displayWeightFromKg(weightInKg)} ${weightUnit}`;
  };

  const goalData = useMemo(() => {
    const sortedWeights = [...weights].sort(
      (firstWeight, secondWeight) =>
        getWeightTimestamp(firstWeight) - getWeightTimestamp(secondWeight)
    );

    const firstWeightEntry = sortedWeights[0] ?? null;
    const latestWeightEntry = sortedWeights[sortedWeights.length - 1] ?? null;

    const startWeight = profile.startWeight ?? firstWeightEntry?.weight ?? null;
    const currentWeight = latestWeightEntry?.weight ?? null;

    if (typeof goalWeight !== 'number') {
      return {
        startWeight,
        currentWeight,
        totalToLose: null,
        weightLost: null,
        weightToGo: null,
        progress: 0,
      };
    }

    if (typeof startWeight !== 'number') {
      return {
        startWeight: null,
        currentWeight,
        totalToLose: null,
        weightLost: null,
        weightToGo: null,
        progress: 0,
      };
    }

    const weightForProgress = currentWeight ?? startWeight;
    const totalToLose = startWeight - goalWeight;
    const weightLost = startWeight - weightForProgress;
    const weightToGo = Math.max(0, weightForProgress - goalWeight);

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

  const { progress, startWeight, weightLost, weightToGo, currentWeight } = goalData;

  const subtitle = getGoalProgressSubtitle({
    hasWeights,
    hasGoalWeight,
    progress,
    weightLost: weightLost ?? 0,
    weightToGo: weightToGo ?? 0,
    formatWeight: (weightInKg) => formatWeight(weightInKg),
  });

  const formattedWeightLost = getFormattedWeightLost({
    weightLost,
    formatWeight: (weightInKg) => formatWeight(weightInKg),
  });

  const handleOpenEditGoal = () => {
    setGoalError(null);
    setIsEditGoalOpen(true);
  };

  const handleCloseEditGoal = () => {
    if (isSavingGoal) {
      return;
    }

    setGoalError(null);
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

  const bmi =
    typeof height === 'number' && typeof currentWeight === 'number'
      ? calculateBmi(currentWeight, height)
      : '—';

  const modalGoalWeight =
    typeof goalWeight === 'number'
      ? goalWeight
      : typeof profile.startWeight === 'number'
        ? profile.startWeight
        : 0;

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

        <Button variant='outline' color='primary' onClick={handleOpenEditGoal}>
          {hasGoalWeight ? 'Edit Goal' : 'Set Goal'}{' '}
        </Button>
      </div>

      <EditGoalWeightModal
        open={isEditGoalOpen}
        currentGoalWeight={modalGoalWeight}
        isSubmitting={isSavingGoal}
        error={goalError}
        onClose={handleCloseEditGoal}
        onSubmit={handleUpdateGoalWeight}
      />
    </section>
  );
};
