import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../query/queryKeys';
import { apiClient } from '../../services/apiClient';
import type { CreateWeightInput, WeightEntry } from '../../types';
import { getTimestamp } from '../../utils/dateHelpers';

type DeleteWeightInput = {
  id: string;
  date: string;
};

const sortWeightsNewestFirst = (weights: WeightEntry[]) => {
  return [...weights].sort((firstWeight, secondWeight) => {
    return getTimestamp(secondWeight.dateTime) - getTimestamp(firstWeight.dateTime);
  });
};

export function useWeights(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.weights,
    queryFn: apiClient.getWeights,
    enabled,
    select: sortWeightsNewestFirst,
  });
}

export function useCreateWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weight: CreateWeightInput) => apiClient.createWeight(weight),

    onSuccess: async (createdWeight) => {
      queryClient.setQueryData<WeightEntry[]>(queryKeys.weights, (currentWeights = []) => {
        return sortWeightsNewestFirst([createdWeight, ...currentWeights]);
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.weights,
      });
    },
  });
}

export function useDeleteWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, date }: DeleteWeightInput) => apiClient.deleteWeight(id, date),

    onSuccess: async (_response, deletedWeight) => {
      queryClient.setQueryData<WeightEntry[]>(queryKeys.weights, (currentWeights = []) => {
        return currentWeights.filter((weight) => weight.id !== deletedWeight.id);
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.weights,
      });
    },
  });
}
