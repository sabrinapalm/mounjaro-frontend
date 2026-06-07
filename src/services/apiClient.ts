import type {
  CheckInEntry,
  CreateCheckInInput,
  CreateShotInput,
  CreateWeightInput,
  ProfileFormValues,
  ShotEntry,
  UserProfile,
  WeightEntry,
} from '../types';
import { cognitoAuth } from './cognitoAuth';

const baseUrl = import.meta.env.VITE_API_URL;

const getHeaders = async (initHeaders: HeadersInit = {}) => {
  const token = await cognitoAuth.getAuthToken();

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(initHeaders as Record<string, string>),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || response.statusText || 'API request failed');
  }

  return response.json();
};

const request = async (path: string, init: RequestInit = {}) => {
  if (!baseUrl) {
    throw new Error('Missing VITE_API_URL environment variable.');
  }

  const headers = await getHeaders(init.headers ?? {});
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  return handleResponse(response);
};

export const apiClient = {
  getProfile: async (): Promise<UserProfile | null> => {
    const data = await request('/profile');
    return data.profile as UserProfile | null;
  },

  updateProfile: async (profile: ProfileFormValues): Promise<UserProfile> => {
    const data = await request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });

    return data.profile as UserProfile;
  },

  updateGoalWeight: async (goalWeight: number): Promise<UserProfile> => {
    const data = await request('/profile/goal-weight', {
      method: 'PATCH',
      body: JSON.stringify({ goalWeight }),
    });

    return data.profile as UserProfile;
  },

  getShots: async (): Promise<ShotEntry[]> => {
    const data = await request('/shots');
    return data.shots as ShotEntry[];
  },

  createShot: async (shot: CreateShotInput): Promise<ShotEntry> => {
    const data = await request('/shots', {
      method: 'POST',
      body: JSON.stringify(shot),
    });

    return data as ShotEntry;
  },

  deleteShot: async (id: string, dateTime: string): Promise<void> => {
    await request(`/shots/${id}?dateTime=${encodeURIComponent(dateTime)}`, {
      method: 'DELETE',
    });
  },

  getWeights: async (): Promise<WeightEntry[]> => {
    const data = await request('/weights');
    return data.weights as WeightEntry[];
  },

  createWeight: async (weight: CreateWeightInput): Promise<WeightEntry> => {
    const data = await request('/weights', {
      method: 'POST',
      body: JSON.stringify(weight),
    });

    return data as WeightEntry;
  },

  deleteWeight: async (id: string, dateTime: string): Promise<void> => {
    await request(`/weights/${id}?dateTime=${encodeURIComponent(dateTime)}`, {
      method: 'DELETE',
    });
  },

  getCheckIns: async (): Promise<CheckInEntry[]> => {
    const data = await request('/check-ins');
    return data.checkIns as CheckInEntry[];
  },

  createCheckIn: async (checkIn: CreateCheckInInput): Promise<CheckInEntry> => {
    const data = await request('/check-ins', {
      method: 'POST',
      body: JSON.stringify(checkIn),
    });

    return data as CheckInEntry;
  },

  deleteCheckIn: async (id: string, dateTime: string): Promise<void> => {
    await request(`/check-ins/${id}?dateTime=${encodeURIComponent(dateTime)}`, {
      method: 'DELETE',
    });
  },
};
