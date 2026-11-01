import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateWeightInput, WeightEntry } from '../../../shared/types';
import { getTimestamp } from '../../../shared/utils/dateHelpers';
import { weightsApi } from '../api/weightsApi';
import { weightQueryKeys } from '../queryKeys';

type DeleteWeightInput = {
  id: string;
  dateTime: string;
};

const sortWeightsNewestFirst = (weights: WeightEntry[]) => {
  return [...weights].sort((firstWeight, secondWeight) => {
    return getTimestamp(secondWeight.dateTime) - getTimestamp(firstWeight.dateTime);
  });
};

export const useWeights = (enabled: boolean) => {
  return useQuery({
    queryKey: weightQueryKeys.weights,
    queryFn: weightsApi.getWeights,
    enabled,
    select: sortWeightsNewestFirst,
  });
};

export const useCreateWeight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weight: CreateWeightInput) => weightsApi.createWeight(weight),

    onSuccess: async (createdWeight) => {
      queryClient.setQueryData<WeightEntry[]>(weightQueryKeys.weights, (currentWeights = []) => {
        return sortWeightsNewestFirst([createdWeight, ...currentWeights]);
      });

      await queryClient.invalidateQueries({
        queryKey: weightQueryKeys.weights,
      });
    },
  });
};

export const useDeleteWeight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dateTime }: DeleteWeightInput) => weightsApi.deleteWeight(id, dateTime),

    onSuccess: async (_response, deletedWeight) => {
      queryClient.setQueryData<WeightEntry[]>(weightQueryKeys.weights, (currentWeights = []) => {
        return currentWeights.filter((weight) => weight.id !== deletedWeight.id);
      });

      await queryClient.invalidateQueries({
        queryKey: weightQueryKeys.weights,
      });
    },
  });
};
