import type { FormEvent } from 'react';
import { useState } from 'react';
import { FiSave, FiSettings, FiTarget, FiUser } from 'react-icons/fi';
import { useProfile } from '../context/ProfileContext';
import { useUpdateProfile } from '../hooks/queries/useProfileQuery';
import { useUnitSettings } from '../hooks/useUnitSettings';
import type { ProfileFormValues, UnitSystem, UserProfile } from '../types';
import './ProfileSettingsPage.css';

type ProfileSettingsPageProps = {
  profile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
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

export const ProfileSettingsPage = ({ profile, onProfileUpdated }: ProfileSettingsPageProps) => {
  const { updateProfile } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const initialUnitSystem = profile.unitSystem ?? 'metric';
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialUnitSystem);

  const {
    weightUnit,
    heightUnit,
    displayWeightFromKg,
    displayHeightFromCm,
    normalizeWeightToKg,
    normalizeHeightToCm,
    convertWeightInputBetweenSystems,
    convertHeightInputBetweenSystems,
  } = useUnitSettings(unitSystem);

  const [displayName, setDisplayName] = useState(profile.displayName ?? '');
  const [startWeight, setStartWeight] = useState(displayWeightFromKg(profile.startWeight));
  const [goalWeight, setGoalWeight] = useState(displayWeightFromKg(profile.goalWeight));
  const [height, setHeight] = useState(displayHeightFromCm(profile.height));

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSaving = updateProfileMutation.isPending;

  const handleUnitSystemChange = (nextUnitSystem: UnitSystem) => {
    setStartWeight((currentValue) =>
      convertWeightInputBetweenSystems(currentValue, unitSystem, nextUnitSystem)
    );

    setGoalWeight((currentValue) =>
      convertWeightInputBetweenSystems(currentValue, unitSystem, nextUnitSystem)
    );

    setHeight((currentValue) =>
      convertHeightInputBetweenSystems(currentValue, unitSystem, nextUnitSystem)
    );

    setUnitSystem(nextUnitSystem);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedDisplayName = displayName.trim();

    const parsedStartWeight = parseOptionalNumber(startWeight);
    const parsedGoalWeight = parseOptionalNumber(goalWeight);
    const parsedHeight = parseOptionalNumber(height);

    const values: ProfileFormValues = {
      displayName: trimmedDisplayName,
      startWeight: normalizeWeightToKg(parsedStartWeight),
      goalWeight: normalizeWeightToKg(parsedGoalWeight),
      height: normalizeHeightToCm(parsedHeight),
      unitSystem,
    };

    setError(null);
    setSuccessMessage(null);

    try {
      const updatedProfile = await updateProfileMutation.mutateAsync(values);

      updateProfile(updatedProfile);
      onProfileUpdated(updatedProfile);

      setSuccessMessage('Profile settings saved.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save profile.');
    }
  };

  return (
    <section className='profile-settings-page'>
      <header className='profile-settings-page__header'>
        <div>
          <p className='profile-settings-page__eyebrow'>Profile</p>
          <h1>Profile Settings</h1>
          <p>Manage your personal details and progress targets.</p>
        </div>
      </header>

      <form className='profile-settings-page__grid' onSubmit={handleSubmit}>
        <section className='profile-settings-card'>
          <header className='profile-settings-card__header'>
            <div className='profile-settings-card__icon' aria-hidden='true'>
              <FiUser size={22} />
            </div>

            <div>
              <h2>Personal details</h2>
              <p>Used to personalize your dashboard.</p>
            </div>
          </header>

          <div className='profile-settings-card__content'>
            <label className='profile-settings-field' htmlFor='profile-settings-display-name'>
              <span className='profile-settings-field__label'>Display name</span>

              <input
                id='profile-settings-display-name'
                className='profile-settings-field__input'
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setError(null);
                  setSuccessMessage(null);
                }}
                placeholder='John Doe'
                autoComplete='name'
                disabled={isSaving}
                required
              />
            </label>

            <label className='profile-settings-field' htmlFor='profile-settings-unit-system'>
              <span className='profile-settings-field__label'>Unit system</span>

              <div className='profile-settings-field__select-wrapper'>
                <FiSettings className='profile-settings-field__select-icon' size={18} />

                <select
                  id='profile-settings-unit-system'
                  className='profile-settings-field__input profile-settings-field__input--with-icon'
                  value={unitSystem}
                  onChange={(event) => {
                    handleUnitSystemChange(event.target.value as UnitSystem);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  disabled={isSaving}
                >
                  <option value='metric'>Metric — kg, cm</option>
                  <option value='imperial'>Imperial — lb, in</option>
                </select>
              </div>
            </label>

            <label className='profile-settings-field' htmlFor='profile-settings-height'>
              <span className='profile-settings-field__label'>Height</span>

              <div className='profile-settings-field__input-with-unit'>
                <input
                  id='profile-settings-height'
                  className='profile-settings-field__input profile-settings-field__input--with-unit'
                  type='number'
                  step='1'
                  min='1'
                  value={height}
                  onChange={(event) => {
                    setHeight(event.target.value);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  placeholder={unitSystem === 'metric' ? '165' : '65'}
                  disabled={isSaving}
                  required
                />

                <span className='profile-settings-field__unit'>{heightUnit}</span>
              </div>
            </label>
          </div>
        </section>

        <section className='profile-settings-card'>
          <header className='profile-settings-card__header'>
            <div
              className='profile-settings-card__icon profile-settings-card__icon--target'
              aria-hidden='true'
            >
              <FiTarget size={22} />
            </div>

            <div>
              <h2>Weight goals</h2>
              <p>These values power your progress and milestones.</p>
            </div>
          </header>

          <div className='profile-settings-card__content'>
            <div className='profile-settings-card__two-column'>
              <label className='profile-settings-field' htmlFor='profile-settings-start-weight'>
                <span className='profile-settings-field__label'>Start weight</span>

                <div className='profile-settings-field__input-with-unit'>
                  <input
                    id='profile-settings-start-weight'
                    className='profile-settings-field__input profile-settings-field__input--with-unit'
                    type='number'
                    step='0.1'
                    min='1'
                    value={startWeight}
                    onChange={(event) => {
                      setStartWeight(event.target.value);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    placeholder={unitSystem === 'metric' ? '100' : '220'}
                    disabled={isSaving}
                    required
                  />

                  <span className='profile-settings-field__unit'>{weightUnit}</span>
                </div>
              </label>

              <label className='profile-settings-field' htmlFor='profile-settings-goal-weight'>
                <span className='profile-settings-field__label'>Goal weight</span>

                <div className='profile-settings-field__input-with-unit'>
                  <input
                    id='profile-settings-goal-weight'
                    className='profile-settings-field__input profile-settings-field__input--with-unit'
                    type='number'
                    step='0.1'
                    min='1'
                    value={goalWeight}
                    onChange={(event) => {
                      setGoalWeight(event.target.value);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    placeholder={unitSystem === 'metric' ? '65' : '143'}
                    disabled={isSaving}
                    required
                  />

                  <span className='profile-settings-field__unit'>{weightUnit}</span>
                </div>
              </label>
            </div>
          </div>
        </section>

        {(error || successMessage) && (
          <div
            className={[
              'profile-settings-message',
              error ? 'profile-settings-message--error' : 'profile-settings-message--success',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {error || successMessage}
          </div>
        )}

        <footer className='profile-settings-page__actions'>
          <button type='submit' className='profile-settings-page__save-button' disabled={isSaving}>
            <FiSave size={19} />
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </footer>
      </form>
    </section>
  );
};
