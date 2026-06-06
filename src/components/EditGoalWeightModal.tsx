import { type FormEvent, useEffect, useState } from 'react';
import { LuGoal } from 'react-icons/lu';
import './EditGoalWeightModal.css';

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
  const [goalWeight, setGoalWeight] = useState(() => String(currentGoalWeight));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
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

    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedGoalWeight = Number(goalWeight);

    if (!goalWeight.trim()) {
      setLocalError('Goal weight is required.');
      return;
    }

    if (Number.isNaN(parsedGoalWeight) || parsedGoalWeight <= 0) {
      setLocalError('Please enter a valid goal weight.');
      return;
    }

    setLocalError(null);
    await onSubmit(parsedGoalWeight);
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
                placeholder='65'
                disabled={isSubmitting}
                required
              />

              <span className='edit-goal-modal__unit'>kg</span>
            </div>
          </label>

          {(localError || error) && <p className='edit-goal-modal__error'>{localError || error}</p>}

          <footer className='edit-goal-modal__footer'>
            <button type='submit' className='edit-goal-modal__submit' disabled={isSubmitting}>
              <LuGoal size={20} />
              {isSubmitting ? 'Saving...' : 'Save Goal'}
            </button>

            <button
              type='button'
              className='edit-goal-modal__cancel'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
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
