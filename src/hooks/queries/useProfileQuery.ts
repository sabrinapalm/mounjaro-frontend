import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../query/queryKeys';
import { apiClient } from '../../services/apiClient';
import type { ProfileFormValues, UserProfile } from '../../types';

export function useProfile(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: apiClient.getProfile,
    enabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProfileFormValues) => apiClient.updateProfile(values),

    onSuccess: (savedProfile: UserProfile) => {
      queryClient.setQueryData(queryKeys.profile, savedProfile);
    },
  });
}

export function useUpdateGoalWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalWeight: number) => apiClient.updateGoalWeight(goalWeight),

    onSuccess: (savedProfile: UserProfile) => {
      queryClient.setQueryData(queryKeys.profile, savedProfile);
    },
  });
}
