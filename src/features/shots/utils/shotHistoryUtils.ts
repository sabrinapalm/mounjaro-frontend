import type { ShotEntry } from '../../../shared/types';

export type ShotMonthGroup = {
  key: string;
  label: string;
  shots: ShotEntry[];
};

export const sortShotsNewestFirst = (shots: ShotEntry[]) => {
  return [...shots].sort((firstShot, secondShot) => {
    const dateDifference = Date.parse(secondShot.dateTime) - Date.parse(firstShot.dateTime);

    return dateDifference !== 0 ? dateDifference : secondShot.id.localeCompare(firstShot.id);
  });
};

export const getNextShotHistoryCount = (
  visibleCount: number,
  totalCount: number,
  pageSize: number
) => Math.min(visibleCount + pageSize, totalCount);

export const groupShotsByMonth = (shots: ShotEntry[]): ShotMonthGroup[] => {
  const groups = new Map<string, ShotMonthGroup>();

  for (const shot of shots) {
    const date = new Date(shot.dateTime);
    const isValidDate = Number.isFinite(date.getTime());
    const key = isValidDate
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      : 'unknown-date';
    const label = isValidDate
      ? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'Date unavailable';
    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.shots.push(shot);
    } else {
      groups.set(key, { key, label, shots: [shot] });
    }
  }

  return [...groups.values()];
};
