import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateShotInput, ShotEntry } from '../../../shared/types';
import { getTimestamp } from '../../../shared/utils/dateHelpers';
import { shotsApi } from '../api/shotsApi';
import { shotQueryKeys } from '../queryKeys';

type DeleteShotInput = {
  id: string;
  dateTime: string;
};

const sortShotsNewestFirst = (shots: ShotEntry[]) => {
  return [...shots].sort((firstShot, secondShot) => {
    const dateDifference = getTimestamp(secondShot.dateTime) - getTimestamp(firstShot.dateTime);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return secondShot.id.localeCompare(firstShot.id);
  });
};

export const useShots = (enabled: boolean) => {
  return useQuery({
    queryKey: shotQueryKeys.shots,
    queryFn: shotsApi.getShots,
    enabled,
    select: sortShotsNewestFirst,
  });
};

export const useCreateShot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shot: CreateShotInput) => shotsApi.createShot(shot),

    onSuccess: async (createdShot) => {
      queryClient.setQueryData<ShotEntry[]>(shotQueryKeys.shots, (currentShots = []) => {
        return sortShotsNewestFirst([createdShot, ...currentShots]);
      });

      await queryClient.invalidateQueries({
        queryKey: shotQueryKeys.shots,
      });
    },
  });
};

export const useDeleteShot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dateTime }: DeleteShotInput) => shotsApi.deleteShot(id, dateTime),

    onSuccess: async (_response, deletedShot) => {
      queryClient.setQueryData<ShotEntry[]>(shotQueryKeys.shots, (currentShots = []) => {
        return currentShots.filter((shot) => shot.id !== deletedShot.id);
      });

      await queryClient.invalidateQueries({
        queryKey: shotQueryKeys.shots,
      });
    },
  });
};
