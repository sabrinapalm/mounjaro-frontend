import type { BaseSyntheticEvent } from 'react';
import { useState } from 'react';
import { FiTarget, FiUser } from 'react-icons/fi';
import type { ProfileFormValues, UserProfile } from '../types';
import './ProfileForm.css';

type ProfileFormProps = {
  initialProfile?: UserProfile | null;
  title?: string;
  submitLabel?: string;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  onCancel?: () => void;
};

const parseOptionalNumber = (value: string): number | null => {
  if (!value.trim()) {
    return null;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return null;
  }

  return parsedValue;
};

export function ProfileForm({
  initialProfile = null,
  title = 'Set up your profile',
  submitLabel = 'Save profile',
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialProfile?.displayName ?? '');
  const [goalWeight, setGoalWeight] = useState(
    initialProfile?.goalWeight ? String(initialProfile.goalWeight) : ''
  );
  const [startWeight, setStartWeight] = useState(
    initialProfile?.startWeight ? String(initialProfile.startWeight) : ''
  );
  const [height, setHeight] = useState(initialProfile?.height ? String(initialProfile.height) : '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();

    const trimmedDisplayName = displayName.trim();

    if (!trimmedDisplayName) {
      setError('Display name is required.');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      await onSubmit({
        displayName: trimmedDisplayName,
        goalWeight: parseOptionalNumber(goalWeight),
        startWeight: parseOptionalNumber(startWeight),
        height: parseOptionalNumber(height),
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className='profile-form-page'>
      <div className='profile-form-card'>
        <header className='profile-form-card__header'>
          <div className='profile-form-card__icon' aria-hidden='true'>
            <FiUser size={30} />
          </div>

          <div className='profile-form-card__heading'>
            <h2 className='profile-form-card__title'>{title}</h2>

            <p className='profile-form-card__description'>
              Add a few details so Tracksy can personalize your progress view.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className='profile-form'>
          <label className='profile-form__field' htmlFor='profile-display-name'>
            <span className='profile-form__label'>Display name</span>

            <input
              id='profile-display-name'
              className='profile-form__input'
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder='Sabrina'
              autoComplete='name'
              disabled={isSaving}
            />
          </label>

          <div className='profile-form__grid'>
            <label className='profile-form__field' htmlFor='profile-start-weight'>
              <span className='profile-form__label'>Start weight</span>

              <div className='profile-form__input-with-unit'>
                <input
                  id='profile-start-weight'
                  className='profile-form__input profile-form__input--with-unit'
                  type='number'
                  step='0.1'
                  min='1'
                  value={startWeight}
                  onChange={(event) => setStartWeight(event.target.value)}
                  placeholder='100'
                  disabled={isSaving}
                />

                <span className='profile-form__unit'>kg</span>
              </div>
            </label>

            <label className='profile-form__field' htmlFor='profile-goal-weight'>
              <span className='profile-form__label'>Goal weight</span>

              <div className='profile-form__input-with-unit'>
                <input
                  id='profile-goal-weight'
                  className='profile-form__input profile-form__input--with-unit'
                  type='number'
                  step='0.1'
                  min='1'
                  value={goalWeight}
                  onChange={(event) => setGoalWeight(event.target.value)}
                  placeholder='65'
                  disabled={isSaving}
                />

                <span className='profile-form__unit'>kg</span>
              </div>
            </label>
          </div>

          <label className='profile-form__field' htmlFor='profile-height'>
            <span className='profile-form__label'>Height</span>

            <div className='profile-form__input-with-unit'>
              <input
                id='profile-height'
                className='profile-form__input profile-form__input--with-unit'
                type='number'
                step='0.1'
                min='1'
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                placeholder='165'
                disabled={isSaving}
              />

              <span className='profile-form__unit'>cm</span>
            </div>
          </label>

          {error ? <p className='profile-form__error'>{error}</p> : null}

          <footer className='profile-form__actions'>
            {onCancel ? (
              <button
                className='profile-form__button profile-form__button--neutral'
                type='button'
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
            ) : null}

            <button
              className='profile-form__button profile-form__button--accent'
              type='submit'
              disabled={isSaving}
            >
              <FiTarget size={20} />
              {isSaving ? 'Saving...' : submitLabel}
            </button>
          </footer>
        </form>
      </div>
    </section>
  );
}
