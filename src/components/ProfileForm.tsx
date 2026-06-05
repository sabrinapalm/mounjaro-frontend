import type { BaseSyntheticEvent } from 'react';
import { useState } from 'react';
import type { ProfileFormValues, UserProfile } from '../types';

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
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className='profile-form-card'>
      <h2>{title}</h2>
      <p className='profile-form-description'>
        Add a few details so the app can personalize your progress view.
      </p>

      <form onSubmit={handleSubmit} className='profile-form'>
        <label>
          Display name
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder=''
            autoComplete='name'
          />
        </label>

        <label>
          Goal weight
          <input
            type='number'
            step='0.1'
            min='1'
            value={goalWeight}
            onChange={(event) => setGoalWeight(event.target.value)}
            placeholder=''
          />
        </label>

        <label>
          Start weight
          <input
            type='number'
            step='0.1'
            min='1'
            value={startWeight}
            onChange={(event) => setStartWeight(event.target.value)}
            placeholder=''
          />
        </label>

        {error ? <p className='error-message'>{error}</p> : null}

        <div className='profile-form-actions'>
          {onCancel ? (
            <button
              className='continue-button'
              type='button'
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
          ) : null}

          <button className='continue-button' type='submit' disabled={isSaving}>
            {isSaving ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
