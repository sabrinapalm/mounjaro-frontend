export const calculateBmi = (weightKg: number, heightCm: number): number => {
  if (weightKg <= 0 || heightCm <= 0) {
    return 0;
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  return Number(bmi.toFixed(1));
};
