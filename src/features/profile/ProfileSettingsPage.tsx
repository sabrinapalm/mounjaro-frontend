import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { FiMail, FiSave, FiSettings, FiTarget, FiUser } from 'react-icons/fi';
import { cognitoAuth } from '../../shared/auth/cognitoAuth';
import { useUnitSettings } from '../../shared/hooks/useUnitSettings';
import type { ProfileFormValues, UnitSystem, UserProfile } from '../../shared/types';
import { useUpdateProfile } from './hooks/useProfileQuery';
import { useProfile } from './ProfileContext';
import './ProfileSettingsPage.css';
import { Button } from '../../shared/components/Button';
import { PageHeader } from '../../shared/components/PageHeader';

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

  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [isAccountEmailLoading, setIsAccountEmailLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSaving = updateProfileMutation.isPending;

  useEffect(() => {
    let isMounted = true;

    const loadAccountEmail = async () => {
      try {
        const email = await cognitoAuth.getCurrentUserEmail();

        if (isMounted) {
          setAccountEmail(email);
        }
      } catch {
        if (isMounted) {
          setAccountEmail(null);
        }
      } finally {
        if (isMounted) {
          setIsAccountEmailLoading(false);
        }
      }
    };

    void loadAccountEmail();

    return () => {
      isMounted = false;
    };
  }, []);

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
      <PageHeader
        title='Profile Settings'
        description='Manage your personal details, account information and progress targets.'
      />
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

        <section className='profile-settings-card'>
          <header className='profile-settings-card__header'>
            <div
              className='profile-settings-card__icon profile-settings-card__icon--account'
              aria-hidden='true'
            >
              <FiMail size={22} />
            </div>

            <div>
              <h2>Account</h2>
              <p>Your login details are managed separately from your profile.</p>
            </div>
          </header>

          <div className='profile-settings-card__content'>
            <div className='profile-settings-readonly-field'>
              <span className='profile-settings-field__label'>Email address</span>

              <div className='profile-settings-readonly-field__value'>
                {isAccountEmailLoading ? 'Loading email…' : accountEmail || 'Email unavailable'}
              </div>

              <p className='profile-settings-readonly-field__hint'>
                Email changes are not available. This address is used for signing in to Tracksy.
              </p>
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
          <Button
            size='lg'
            color='secondary'
            variant='solid'
            type='submit'
            disabled={isSaving}
            icon={<FiSave size={19} />}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </footer>
      </form>
    </section>
  );
};
