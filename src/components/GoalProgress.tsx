import { LuGoal } from 'react-icons/lu';
import type { UserProfile, WeightEntry } from '../types';
import { Button } from './general/Button';
import { EditGoalWeightModal } from './modals/EditGoalWeightModal';
import './GoalProgress.css';
import { useGoalProgress } from '../hooks/useGoalProgess';

interface GoalProgressProps {
  weights: WeightEntry[];
  profile: UserProfile;
  onGoalWeightUpdated: (goalWeight: number) => Promise<void>;
}

export const GoalProgress = ({ weights, profile, onGoalWeightUpdated }: GoalProgressProps) => {
  const {
    bmi,
    formattedWeightLost,
    goalError,
    hasGoalWeight,
    isEditGoalOpen,
    isSavingGoal,
    modalGoalWeight,
    progress,
    startWeight,
    subtitle,
    weightToGo,
    formatWeight,
    handleCloseEditGoal,
    handleOpenEditGoal,
    handleUpdateGoalWeight,
  } = useGoalProgress({
    weights,
    profile,
    onGoalWeightUpdated,
  });

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
          <span className='stat-value'>{formatWeight(profile.goalWeight)}</span>
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
          <span className='target-card-value'>{formatWeight(profile.goalWeight)}</span>
        </div>

        <Button variant='outline' color='primary' onClick={handleOpenEditGoal}>
          {hasGoalWeight ? 'Edit Goal' : 'Set Goal'}
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
