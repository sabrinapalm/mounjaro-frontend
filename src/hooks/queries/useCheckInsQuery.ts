import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../query/queryKeys';
import { apiClient } from '../../services/apiClient';
import type { CheckInEntry, CreateCheckInInput } from '../../types';
import { getTimestamp } from '../../utils/dateHelpers';

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

export function useCheckIns(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.checkIns,
    queryFn: apiClient.getCheckIns,
    enabled,
    select: sortCheckInsNewestFirst,
  });
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkIn: CreateCheckInInput) => apiClient.createCheckIn(checkIn),

    onSuccess: async (createdCheckIn) => {
      queryClient.setQueryData<CheckInEntry[]>(queryKeys.checkIns, (currentCheckIns = []) => {
        return sortCheckInsNewestFirst([createdCheckIn, ...currentCheckIns]);
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.checkIns,
      });
    },
  });
}

export function useDeleteCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dateTime }: DeleteCheckInInput) => apiClient.deleteCheckIn(id, dateTime),

    onSuccess: async (_response, deletedCheckIn) => {
      queryClient.setQueryData<CheckInEntry[]>(queryKeys.checkIns, (currentCheckIns = []) => {
        return currentCheckIns.filter((checkIn) => checkIn.id !== deletedCheckIn.id);
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.checkIns,
      });
    },
  });
}
