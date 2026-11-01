import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import type { UnitSystem, UserProfile } from '../../shared/types';

type ProfileContextValue = {
  profile: UserProfile | null;
  unitSystem: UnitSystem;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (profile: UserProfile) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

type ProfileProviderProps = {
  initialProfile?: UserProfile | null;
  children: ReactNode;
};

export const ProfileProvider = ({ initialProfile = null, children }: ProfileProviderProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);

  const value = useMemo<ProfileContextValue>(() => {
    return {
      profile,
      unitSystem: profile?.unitSystem ?? 'metric',
      setProfile,
      updateProfile: setProfile,
    };
  }, [profile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }

  return context;
};
