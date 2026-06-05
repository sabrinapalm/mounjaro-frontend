import { formatKg } from './formatKg';

export const formatWeightLost = (value: number): { text: string; className: string } => {
  if (value >= 0) {
    return { text: `-${formatKg(value)}`, className: '' };
  }
  return { text: `+${formatKg(Math.abs(value))}`, className: 'weight-gain' };
};
