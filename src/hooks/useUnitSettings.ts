import { useCallback } from 'react';
import type { UnitSystem } from '../types';

const KG_TO_LB = 2.2046226218;
const CM_TO_IN = 0.3937007874;

const roundToOneDecimal = (value: number) => {
  return Math.round(value * 10) / 10;
};

const roundToWholeNumber = (value: number) => {
  return Math.round(value);
};

const parseInputNumber = (value: string): number | null => {
  if (!value.trim()) {
    return null;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return null;
  }

  return parsedValue;
};

const formatWeight = (value: number | null | undefined) => {
  if (typeof value !== 'number') {
    return '';
  }

  return String(roundToOneDecimal(value));
};

const formatHeight = (value: number | null | undefined) => {
  if (typeof value !== 'number') {
    return '';
  }

  return String(roundToWholeNumber(value));
};

const kgToLb = (kg: number) => {
  return roundToOneDecimal(kg * KG_TO_LB);
};

const lbToKg = (lb: number) => {
  return roundToOneDecimal(lb / KG_TO_LB);
};

const cmToIn = (cm: number) => {
  return roundToWholeNumber(cm * CM_TO_IN);
};

const inToCm = (inch: number) => {
  return roundToWholeNumber(inch / CM_TO_IN);
};

const convertInputValue = (value: string, converter: (value: number) => number) => {
  const parsedValue = parseInputNumber(value);

  if (parsedValue === null) {
    return '';
  }

  return String(converter(parsedValue));
};

export const useUnitSettings = (unitSystem: UnitSystem) => {
  const isMetric = unitSystem === 'metric';

  const weightUnit = isMetric ? 'kg' : 'lb';
  const heightUnit = isMetric ? 'cm' : 'in';

  const convertWeightFromKg = useCallback(
    (weightInKg: number) => {
      return isMetric ? roundToOneDecimal(weightInKg) : kgToLb(weightInKg);
    },
    [isMetric]
  );

  const convertHeightFromCm = useCallback(
    (heightInCm: number) => {
      return isMetric ? roundToWholeNumber(heightInCm) : cmToIn(heightInCm);
    },
    [isMetric]
  );

  const displayWeightFromKg = useCallback(
    (weightInKg: number | null | undefined) => {
      if (typeof weightInKg !== 'number') {
        return '';
      }

      return formatWeight(convertWeightFromKg(weightInKg));
    },
    [convertWeightFromKg]
  );

  const displayHeightFromCm = useCallback(
    (heightInCm: number | null | undefined) => {
      if (typeof heightInCm !== 'number') {
        return '';
      }

      return formatHeight(convertHeightFromCm(heightInCm));
    },
    [convertHeightFromCm]
  );

  const normalizeWeightToKg = useCallback(
    (weight: number | null) => {
      if (weight === null) {
        return null;
      }

      return isMetric ? roundToOneDecimal(weight) : lbToKg(weight);
    },
    [isMetric]
  );

  const normalizeHeightToCm = useCallback(
    (height: number | null) => {
      if (height === null) {
        return null;
      }

      return isMetric ? roundToWholeNumber(height) : inToCm(height);
    },
    [isMetric]
  );

  const convertWeightInputBetweenSystems = useCallback(
    (value: string, fromUnitSystem: UnitSystem, toUnitSystem: UnitSystem) => {
      if (fromUnitSystem === toUnitSystem) {
        return value;
      }

      return fromUnitSystem === 'metric'
        ? convertInputValue(value, kgToLb)
        : convertInputValue(value, lbToKg);
    },
    []
  );

  const convertHeightInputBetweenSystems = useCallback(
    (value: string, fromUnitSystem: UnitSystem, toUnitSystem: UnitSystem) => {
      if (fromUnitSystem === toUnitSystem) {
        return value;
      }

      return fromUnitSystem === 'metric'
        ? convertInputValue(value, cmToIn)
        : convertInputValue(value, inToCm);
    },
    []
  );

  const parseDisplayNumber = (value: number | string) => {
    if (typeof value === 'number') {
      return value;
    }

    const normalizedValue = value.replace(',', '.');
    const parsedValue = Number(normalizedValue);

    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  };

  const formatSignedWeight = (value: number | string, unit: string) => {
    const numericValue = parseDisplayNumber(value);
    const absoluteValue = Math.abs(numericValue).toFixed(1);

    if (numericValue > 0) {
      return `+${absoluteValue} ${unit}`;
    }

    if (numericValue < 0) {
      return `-${absoluteValue} ${unit}`;
    }

    return `0.0 ${unit}`;
  };

  return {
    unitSystem,
    weightUnit,
    heightUnit,
    convertWeightFromKg,
    convertHeightFromCm,
    displayWeightFromKg,
    displayHeightFromCm,
    normalizeWeightToKg,
    normalizeHeightToCm,
    convertWeightInputBetweenSystems,
    convertHeightInputBetweenSystems,
    formatSignedWeight,
  };
};
