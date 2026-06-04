import type { AppData, ShotEntry, WeightEntry } from './types';

const STORAGE_KEY = 'mounjaro_companion_data';

export const storageUtils = {
  // Get all data
  getData: (): AppData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { shots: [], weights: [] };
    }
    try {
      return JSON.parse(stored);
    } catch {
      console.error('Failed to parse stored data');
      return { shots: [], weights: [] };
    }
  },

  // Save all data
  saveData: (data: AppData): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Add a shot entry
  addShot: (entry: ShotEntry): void => {
    const data = storageUtils.getData();
    data.shots.push(entry);
    storageUtils.saveData(data);
  },

  // Add a weight entry
  addWeight: (entry: WeightEntry): void => {
    const data = storageUtils.getData();
    data.weights.push(entry);
    storageUtils.saveData(data);
  },

  // Delete a shot entry
  deleteShot: (id: string): void => {
    const data = storageUtils.getData();
    data.shots = data.shots.filter(shot => shot.id !== id);
    storageUtils.saveData(data);
  },

  // Delete a weight entry
  deleteWeight: (id: string): void => {
    const data = storageUtils.getData();
    data.weights = data.weights.filter(weight => weight.id !== id);
    storageUtils.saveData(data);
  },

  // Get total shots taken
  getTotalShots: (): number => {
    const data = storageUtils.getData();
    return data.shots.length;
  },

  // Get shots for a specific week
  getShotsForWeek: (week: number, year: number): ShotEntry[] => {
    const data = storageUtils.getData();
    return data.shots.filter(shot => shot.week === week && shot.year === year);
  },

  // Get weight entry for a specific week
  getWeightForWeek: (week: number, year: number): WeightEntry | undefined => {
    const data = storageUtils.getData();
    return data.weights.find(weight => weight.week === week && weight.year === year);
  },

  // Clear all data
  clearData: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};
