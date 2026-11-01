import { request } from '../../../shared/api/request';
import type { CreateShotInput, ShotEntry } from '../../../shared/types';

type ShotsResponse = {
  shots: ShotEntry[];
};

export const shotsApi = {
  getShots: async (): Promise<ShotEntry[]> => {
    const data = await request<ShotsResponse>('/shots');
    return data.shots;
  },

  createShot: async (shot: CreateShotInput): Promise<ShotEntry> =>
    request<ShotEntry>('/shots', {
      method: 'POST',
      body: JSON.stringify(shot),
    }),

  deleteShot: async (id: string, dateTime: string): Promise<void> => {
    await request<void>(`/shots/${id}?dateTime=${encodeURIComponent(dateTime)}`, {
      method: 'DELETE',
    });
  },
};
