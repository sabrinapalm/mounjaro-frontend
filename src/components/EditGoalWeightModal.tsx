import { type FormEvent, useEffect, useState } from 'react';
import { LuGoal } from 'react-icons/lu';
import { useProfile } from '../context/ProfileContext';
import { useUnitSettings } from '../hooks/useUnitSettings';
import './EditGoalWeightModal.css';
import { Button } from './general/Button';

interface EditGoalWeightModalProps {
  open: boolean;
  currentGoalWeight: number;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (goalWeight: number) => Promise<void>;
}

interface EditGoalWeightModalContentProps {
  currentGoalWeight: number;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (goalWeight: number) => Promise<void>;
}

const EditGoalWeightModalContent = ({
  currentGoalWeight,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: EditGoalWeightModalContentProps) => {
  const { unitSystem } = useProfile();
  const { weightUnit, displayWeightFromKg, normalizeWeightToKg } = useUnitSettings(unitSystem);

  const [goalWeight, setGoalWeight] = useState(() => displayWeightFromKg(currentGoalWeight));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        setLocalError(null);
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isSubmitting, onClose]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setLocalError(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!goalWeight.trim()) {
      setLocalError('Goal weight is required.');
      return;
    }

    const parsedGoalWeight = Number(goalWeight);

    if (Number.isNaN(parsedGoalWeight) || parsedGoalWeight <= 0) {
      setLocalError('Please enter a valid goal weight.');
      return;
    }

    const goalWeightInKg = normalizeWeightToKg(parsedGoalWeight);

    if (!goalWeightInKg || goalWeightInKg <= 0) {
      setLocalError('Please enter a valid goal weight.');
      return;
    }

    setLocalError(null);

    try {
      await onSubmit(goalWeightInKg);
    } catch (submitError) {
      setLocalError(
        submitError instanceof Error ? submitError.message : 'Could not update goal weight.'
      );
    }
  };

  return (
    <div className='edit-goal-modal-layer'>
      <button
        type='button'
        className='edit-goal-modal-backdrop'
        aria-label='Close edit goal modal'
        onClick={handleClose}
        disabled={isSubmitting}
      />

      <section
        className='edit-goal-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby='edit-goal-modal-title'
      >
        <button
          type='button'
          className='edit-goal-modal__close'
          aria-label='Close edit goal modal'
          onClick={handleClose}
          disabled={isSubmitting}
        >
          ×
        </button>

        <header className='edit-goal-modal__header'>
          <div className='edit-goal-modal__icon' aria-hidden='true'>
            <LuGoal size={32} />
          </div>

          <h2 id='edit-goal-modal-title' className='edit-goal-modal__title'>
            Edit Goal Weight
          </h2>

          <p className='edit-goal-modal__description'>
            Update your target weight and Tracksy will recalculate your progress.
          </p>
        </header>

        <form className='edit-goal-modal__form' onSubmit={handleSubmit}>
          <label className='edit-goal-modal__field' htmlFor='goal-weight'>
            <span className='edit-goal-modal__label'>Goal weight</span>

            <div className='edit-goal-modal__input-with-unit'>
              <input
                id='goal-weight'
                className='edit-goal-modal__input edit-goal-modal__input--with-unit'
                type='number'
                min='1'
                step='0.1'
                value={goalWeight}
                onChange={(event) => {
                  setGoalWeight(event.target.value);
                  setLocalError(null);
                }}
                placeholder={unitSystem === 'metric' ? '65' : '143'}
                disabled={isSubmitting}
                required
              />

              <span className='edit-goal-modal__unit'>{weightUnit}</span>
            </div>
          </label>

          {(localError || error) && <p className='edit-goal-modal__error'>{localError || error}</p>}

          <footer className='edit-goal-modal__footer'>
            <Button
              variant='solid'
              color='secondary'
              size='lg'
              fullWidth
              isLoading={isSubmitting}
              icon={<LuGoal size={20} />}
            >
              {isSubmitting ? 'Saving...' : 'Save Goal'}
            </Button>
            <Button variant='text' color='muted' onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export const EditGoalWeightModal = ({
  open,
  currentGoalWeight,
  isSubmitting = false,
  error,
  onClose,
  onSubmit,
}: EditGoalWeightModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <EditGoalWeightModalContent
      key={currentGoalWeight}
      currentGoalWeight={currentGoalWeight}
      isSubmitting={isSubmitting}
      error={error}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};
