export interface ShotEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  dosage: number; // in mg
  week: number;
  year: number;
}

export interface WeightEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
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
