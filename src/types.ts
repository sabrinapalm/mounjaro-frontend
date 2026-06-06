export interface ShotEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  dosage: number; // in mg
  week: number;
  year: number;
  injectionSite?: string; // e.g., "abdomen", "thigh", "arm"
}

export interface WeightEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  dateTime: string; // ISO datetime string
  weight: number; // in kg or lbs, depending on user preference
  week: number;
  year: number;
}

export interface AppData {
  shots: ShotEntry[];
  weights: WeightEntry[];
}

export interface WeeklyData {
  week: number;
  year: number;
  date: string;
  shots: ShotEntry[];
  weight?: WeightEntry;
  totalShots: number;
  weightLoss?: number;
}
export type UnitSystem = 'metric' | 'imperial';

export type UserProfile = {
  displayName: string;
  goalWeight: number | null;
  startWeight: number | null;
  height: number | null;
  unitSystem: UnitSystem;
  createdAt: string;
  updatedAt: string;
};

export type ProfileFormValues = {
  displayName: string;
  goalWeight: number | null;
  startWeight: number | null;
  height: number | null;
  unitSystem: UnitSystem;
};

export type CreateShotInput = {
  date: string;
  dosage: number;
  week: number;
  year: number;
  injectionSite?: string;
};

export type CreateWeightInput = {
  date: string;
  dateTime: string;
  weight: number;
  week: number;
  year: number;
};
