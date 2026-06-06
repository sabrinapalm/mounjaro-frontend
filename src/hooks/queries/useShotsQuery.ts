import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../query/queryKeys';
import { apiClient } from '../../services/apiClient';
import type { CreateShotInput, ShotEntry } from '../../types';
import { getTimestamp } from '../../utils/dateHelpers';

type DeleteShotInput = {
  id: string;
  date: string;
};

const sortShotsNewestFirst = (shots: ShotEntry[]) => {
  return [...shots].sort((firstShot, secondShot) => {
    const dateDifference = getTimestamp(secondShot.date) - getTimestamp(firstShot.date);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return secondShot.id.localeCompare(firstShot.id);
  });
};

export function useShots(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.shots,
    queryFn: apiClient.getShots,
    enabled,
    select: sortShotsNewestFirst,
  });
}

export function useCreateShot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shot: CreateShotInput) => apiClient.createShot(shot),

    onSuccess: async (createdShot) => {
      queryClient.setQueryData<ShotEntry[]>(queryKeys.shots, (currentShots = []) => {
        return sortShotsNewestFirst([createdShot, ...currentShots]);
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.shots,
      });
    },
  });
}

export function useDeleteShot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, date }: DeleteShotInput) => apiClient.deleteShot(id, date),

    onSuccess: async (_response, deletedShot) => {
      queryClient.setQueryData<ShotEntry[]>(queryKeys.shots, (currentShots = []) => {
        return currentShots.filter((shot) => shot.id !== deletedShot.id);
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.shots,
      });
    },
  });
}
