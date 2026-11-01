import { type JSX, useCallback, useMemo, useState } from 'react';
import type { CreateWeightInput } from '../../../shared/types';
import { AddWeightModal } from '../components/modals/AddWeightModal';

type UseAddWeightModalParams = {
  onWeightAdded: (weight: CreateWeightInput) => Promise<void>;
};

type UseAddWeightModalResult = {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  modal: JSX.Element;
};

export const useAddWeightModal = ({
  onWeightAdded,
}: UseAddWeightModalParams): UseAddWeightModalResult => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback(() => {
    setError(null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
  }, [isSubmitting]);

  const handleWeightAdded = useCallback(
    async (newWeight: CreateWeightInput) => {
      setError(null);
      setIsSubmitting(true);

      try {
        await onWeightAdded(newWeight);
        setIsOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to add weight');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onWeightAdded]
  );

  const modal = useMemo(() => {
    return (
      <AddWeightModal
        open={isOpen}
        isSubmitting={isSubmitting}
        error={error}
        onClose={closeModal}
        onWeightAdded={handleWeightAdded}
      />
    );
  }, [closeModal, error, handleWeightAdded, isOpen, isSubmitting]);

  return {
    isOpen,
    isSubmitting,
    error,
    openModal,
    closeModal,
    modal,
  };
};
