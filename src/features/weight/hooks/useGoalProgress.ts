import { useCallback, useMemo, useState } from 'react';
import { useUnitSettings } from '../../../shared/hooks/useUnitSettings';
import type { UserProfile, WeightEntry } from '../../../shared/types';
import { calculateBmi } from '../utils/calculateBmi';
import {
  calculateGoalProgressData,
  getFormattedWeightLost,
  getGoalProgressSubtitle,
  getGoalWeightModalValue,
} from '../utils/goalProgressUtils';

interface UseGoalProgressParams {
  weights: WeightEntry[];
  profile: UserProfile;
  onGoalWeightUpdated: (goalWeight: number) => Promise<void>;
}

export const useGoalProgress = ({
  weights,
  profile,
  onGoalWeightUpdated,
}: UseGoalProgressParams) => {
  const { goalWeight, height, unitSystem } = profile;

  const { weightUnit, displayWeightFromKg } = useUnitSettings(unitSystem ?? 'metric');

  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  const hasGoalWeight =
    typeof goalWeight === 'number' && Number.isFinite(goalWeight) && goalWeight > 0;
  const hasWeights = weights.some((weight) => Number.isFinite(weight.weight) && weight.weight > 0);

  const formatWeight = useCallback(
    (weightInKg: number | null | undefined) => {
      if (typeof weightInKg !== 'number' || !Number.isFinite(weightInKg) || weightInKg < 0) {
        return '—';
      }

      return `${displayWeightFromKg(weightInKg)} ${weightUnit}`;
    },
    [displayWeightFromKg, weightUnit]
  );

  const goalData = useMemo(
    () =>
      calculateGoalProgressData({
        weights,
        startWeight: profile.startWeight,
        goalWeight,
      }),
    [weights, profile.startWeight, goalWeight]
  );

  const { progress, startWeight, weightLost, weightToGo, currentWeight } = goalData;

  const subtitle = useMemo(
    () =>
      getGoalProgressSubtitle({
        hasWeights,
        hasGoalWeight,
        progress,
        weightLost,
        weightToGo,
        formatWeight,
      }),
    [hasWeights, hasGoalWeight, progress, weightLost, weightToGo, formatWeight]
  );

  const formattedWeightLost = useMemo(
    () =>
      getFormattedWeightLost({
        weightLost,
        formatWeight,
      }),
    [weightLost, formatWeight]
  );

  const bmi = useMemo(() => {
    if (typeof height !== 'number' || typeof currentWeight !== 'number') {
      return '—';
    }

    return calculateBmi(currentWeight, height);
  }, [height, currentWeight]);

  const modalGoalWeight = useMemo(
    () =>
      getGoalWeightModalValue({
        goalWeight,
        startWeight,
        currentWeight,
      }),
    [goalWeight, startWeight, currentWeight]
  );

  const handleOpenEditGoal = useCallback(() => {
    setGoalError(null);
    setIsEditGoalOpen(true);
  }, []);

  const handleCloseEditGoal = useCallback(() => {
    if (isSavingGoal) {
      return;
    }

    setGoalError(null);
    setIsEditGoalOpen(false);
  }, [isSavingGoal]);

  const handleUpdateGoalWeight = useCallback(
    async (newGoalWeight: number) => {
      setGoalError(null);
      setIsSavingGoal(true);

      try {
        await onGoalWeightUpdated(newGoalWeight);
        setIsEditGoalOpen(false);
      } catch (err) {
        setGoalError(err instanceof Error ? err.message : 'Unable to update goal weight');
        throw err;
      } finally {
        setIsSavingGoal(false);
      }
    },
    [onGoalWeightUpdated]
  );

  return {
    bmi,
    currentWeight,
    formattedWeightLost,
    goalError,
    hasGoalWeight,
    isEditGoalOpen,
    isSavingGoal,
    modalGoalWeight,
    progress,
    startWeight,
    subtitle,
    weightToGo,
    formatWeight,
    handleCloseEditGoal,
    handleOpenEditGoal,
    handleUpdateGoalWeight,
  };
};
