export type UnitSystem = 'metric' | 'imperial';

export type InjectionSite =
  | 'abdomen_left'
  | 'abdomen_right'
  | 'left_thigh'
  | 'right_thigh'
  | 'left_upper_arm'
  | 'right_upper_arm'
  | 'other';

export type SideEffect =
  | 'nausea'
  | 'fatigue'
  | 'headache'
  | 'constipation'
  | 'diarrhea'
  | 'stomach_pain'
  | 'injection_site_reaction'
  | 'reduced_appetite'
  | 'heartburn'
  | 'other';

/**
 * Temporary alias so existing shot components do not need to change immediately.
 * Prefer SideEffect for new code.
 */
export type ShotSideEffect = SideEffect;

export type CheckInLevel = 1 | 2 | 3 | 4 | 5;

export type ShotEntry = {
  id: string;
  dateTime: string;
  dosage: number;
  injectionSite?: InjectionSite;
  sideEffects?: SideEffect[];
  notes?: string;
};

export type CreateShotInput = {
  dateTime: string;
  dosage: number;
  injectionSite?: InjectionSite;
  sideEffects?: SideEffect[];
  notes?: string;
};

export type WeightEntry = {
  id: string;
  dateTime: string;
  weight: number;
};

export type CreateWeightInput = {
  dateTime: string;
  weight: number;
};

export type CheckInEntry = {
  id: string;
  dateTime: string;
  appetiteLevel?: CheckInLevel;
  hungerLevel?: CheckInLevel;
  energyLevel?: CheckInLevel;
  nauseaLevel?: CheckInLevel;
  moodLevel?: CheckInLevel;
  sideEffects?: SideEffect[];
  notes?: string;
};

export type CreateCheckInInput = {
  dateTime: string;
  appetiteLevel?: CheckInLevel;
  hungerLevel?: CheckInLevel;
  energyLevel?: CheckInLevel;
  nauseaLevel?: CheckInLevel;
  moodLevel?: CheckInLevel;
  sideEffects?: SideEffect[];
  notes?: string;
};

export interface AppData {
  shots: ShotEntry[];
  weights: WeightEntry[];
  checkIns: CheckInEntry[];
}

/**
 * Derived frontend view model.
 * week/year/date are calculated from dateTime in the frontend, not stored by backend.
 */
export interface WeeklyData {
  week: number;
  year: number;
  date: string;
  shots: ShotEntry[];
  weight?: WeightEntry;
  totalShots: number;
  weightLoss?: number;
}

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
