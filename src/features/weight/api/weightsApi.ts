import { request } from '../../../shared/api/request';
import type { CreateWeightInput, WeightEntry } from '../../../shared/types';

type WeightsResponse = {
  weights: WeightEntry[];
};

export const weightsApi = {
  getWeights: async (): Promise<WeightEntry[]> => {
    const data = await request<WeightsResponse>('/weights');
    return data.weights;
  },

  createWeight: async (weight: CreateWeightInput): Promise<WeightEntry> =>
    request<WeightEntry>('/weights', {
      method: 'POST',
      body: JSON.stringify(weight),
    }),

  deleteWeight: async (id: string, dateTime: string): Promise<void> => {
    await request<void>(`/weights/${id}?dateTime=${encodeURIComponent(dateTime)}`, {
      method: 'DELETE',
    });
  },
};
