import { request } from '../../../shared/api/request';
import type { CheckInEntry, CreateCheckInInput } from '../../../shared/types';

type CheckInsResponse = {
  checkIns: CheckInEntry[];
};

export const checkInsApi = {
  getCheckIns: async (): Promise<CheckInEntry[]> => {
    const data = await request<CheckInsResponse>('/check-ins');
    return data.checkIns;
  },

  createCheckIn: async (checkIn: CreateCheckInInput): Promise<CheckInEntry> =>
    request<CheckInEntry>('/check-ins', {
      method: 'POST',
      body: JSON.stringify(checkIn),
    }),

  deleteCheckIn: async (id: string, dateTime: string): Promise<void> => {
    await request<void>(`/check-ins/${id}?dateTime=${encodeURIComponent(dateTime)}`, {
      method: 'DELETE',
    });
  },
};
