import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CheckInEntry, CreateCheckInInput } from '../../../shared/types';
import { getTimestamp } from '../../../shared/utils/dateHelpers';
import { checkInsApi } from '../api/checkInsApi';
import { checkInQueryKeys } from '../queryKeys';

type DeleteCheckInInput = {
  id: string;
  dateTime: string;
};

const sortCheckInsNewestFirst = (checkIns: CheckInEntry[]) => {
  return [...checkIns].sort((firstCheckIn, secondCheckIn) => {
    const dateDifference =
      getTimestamp(secondCheckIn.dateTime) - getTimestamp(firstCheckIn.dateTime);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return secondCheckIn.id.localeCompare(firstCheckIn.id);
  });
};

export const useCheckIns = (enabled: boolean) => {
  return useQuery({
    queryKey: checkInQueryKeys.checkIns,
    queryFn: checkInsApi.getCheckIns,
    enabled,
    select: sortCheckInsNewestFirst,
  });
};

export const useCreateCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkIn: CreateCheckInInput) => checkInsApi.createCheckIn(checkIn),

    onSuccess: async (createdCheckIn) => {
      queryClient.setQueryData<CheckInEntry[]>(
        checkInQueryKeys.checkIns,
        (currentCheckIns = []) => {
          return sortCheckInsNewestFirst([createdCheckIn, ...currentCheckIns]);
        }
      );

      await queryClient.invalidateQueries({
        queryKey: checkInQueryKeys.checkIns,
      });
    },
  });
};

export const useDeleteCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dateTime }: DeleteCheckInInput) => checkInsApi.deleteCheckIn(id, dateTime),

    onSuccess: async (_response, deletedCheckIn) => {
      queryClient.setQueryData<CheckInEntry[]>(
        checkInQueryKeys.checkIns,
        (currentCheckIns = []) => {
          return currentCheckIns.filter((checkIn) => checkIn.id !== deletedCheckIn.id);
        }
      );

      await queryClient.invalidateQueries({
        queryKey: checkInQueryKeys.checkIns,
      });
    },
  });
};
