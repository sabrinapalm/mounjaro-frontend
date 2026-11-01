import { LuArrowUpRight, LuGoal } from 'react-icons/lu';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/ui/card';
import type { UserProfile, WeightEntry } from '../../../shared/types';
import { useGoalProgress } from '../hooks/useGoalProgress';
import { EditGoalWeightModal } from './modals/EditGoalWeightModal';
import './GoalProgress.css';

type GoalProgressProps = {
  weights: WeightEntry[];
  profile: UserProfile;
  onGoalWeightUpdated: (goalWeight: number) => Promise<void>;
};

const ringCircumference = 2 * Math.PI * 45;

export const GoalProgress = ({ weights, profile, onGoalWeightUpdated }: GoalProgressProps) => {
  const {
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

  const hasProgressData = hasGoalWeight && startWeight !== null;
  const ringProgress = hasProgressData ? progress : 0;
  const progressLabel = hasProgressData ? `${progress}%` : '—';

  return (
    <Card asChild>
      <section className='goal-progress-card' aria-labelledby='goal-progress-title'>
        <header className='goal-progress-card__header'>
          <div className='goal-progress-card__heading'>
            <span className='goal-progress-card__icon' aria-hidden='true'>
              <LuGoal />
            </span>
            <div>
              <p className='dashboard-card-label'>AIMING FOR</p>
              <h2 id='goal-progress-title'>Your goal</h2>
            </div>
          </div>
          <Button
            variant='text'
            color='primary'
            className='goal-progress-card__edit'
            onClick={handleOpenEditGoal}
          >
            {hasGoalWeight ? 'Edit' : 'Set goal'}
            <LuArrowUpRight aria-hidden='true' />
          </Button>
        </header>

        <div className='goal-progress-card__body'>
          <div
            className='goal-progress-ring'
            role='img'
            aria-label={
              hasProgressData
                ? `${progress}% progress toward your goal`
                : 'Goal progress unavailable'
            }
          >
            <svg viewBox='0 0 112 112' aria-hidden='true'>
              <circle className='goal-progress-ring__track' cx='56' cy='56' r='45' />
              <circle
                className='goal-progress-ring__value'
                cx='56'
                cy='56'
                r='45'
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringCircumference * (1 - ringProgress / 100)}
              />
            </svg>
            <span className='goal-progress-ring__label'>
              <strong>{progressLabel}</strong>
              <small>complete</small>
            </span>
          </div>

          <div className='goal-progress-card__details'>
            <p className='goal-progress-card__detail-label'>GOAL WEIGHT</p>
            <p className='goal-progress-card__goal-value'>{formatWeight(profile.goalWeight)}</p>
            <p className='goal-progress-card__subtitle'>{subtitle}</p>

            <div className='goal-progress-card__remaining'>
              <span>{progress >= 100 && hasProgressData ? 'Goal reached' : 'Remaining'}</span>
              <strong>
                {hasProgressData && progress >= 100 ? 'Complete' : formatWeight(weightToGo)}
              </strong>
            </div>
            <p className='goal-progress-card__change'>
              {formattedWeightLost.text} <span>from your starting weight</span>
            </p>
          </div>
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
    </Card>
  );
};
