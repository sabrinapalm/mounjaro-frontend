import { request } from '../../../shared/api/request';
import type { ProfileFormValues, UserProfile } from '../../../shared/types';

type ProfileResponse = {
  profile: UserProfile | null;
};

type SavedProfileResponse = {
  profile: UserProfile;
};

export const profileApi = {
  getProfile: async (): Promise<UserProfile | null> => {
    const data = await request<ProfileResponse>('/profile');
    return data.profile;
  },

  updateProfile: async (profile: ProfileFormValues): Promise<UserProfile> => {
    const data = await request<SavedProfileResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });

    return data.profile;
  },

  updateGoalWeight: async (goalWeight: number): Promise<UserProfile> => {
    const data = await request<SavedProfileResponse>('/profile/goal-weight', {
      method: 'PATCH',
      body: JSON.stringify({ goalWeight }),
    });

    return data.profile;
  },
};
