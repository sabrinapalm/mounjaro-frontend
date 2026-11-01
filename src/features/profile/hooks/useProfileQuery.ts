import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProfileFormValues, UserProfile } from '../../../shared/types';
import { profileApi } from '../api/profileApi';
import { profileQueryKeys } from '../queryKeys';

export const useProfile = (enabled: boolean) => {
  return useQuery({
    queryKey: profileQueryKeys.profile,
    queryFn: profileApi.getProfile,
    enabled,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProfileFormValues) => profileApi.updateProfile(values),

    onSuccess: (savedProfile: UserProfile) => {
      queryClient.setQueryData(profileQueryKeys.profile, savedProfile);
    },
  });
};

export const useUpdateGoalWeight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalWeight: number) => profileApi.updateGoalWeight(goalWeight),

    onSuccess: (savedProfile: UserProfile) => {
      queryClient.setQueryData(profileQueryKeys.profile, savedProfile);
    },
  });
};
