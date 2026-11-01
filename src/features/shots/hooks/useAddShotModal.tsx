import { type JSX, useCallback, useMemo, useState } from 'react';
import type { CreateShotInput } from '../../../shared/types';
import { AddShotModal } from '../components/modals/AddShotModal';

type UseAddShotModalParams = {
  onShotAdded: (shot: CreateShotInput) => Promise<void>;
};

type UseAddShotModalResult = {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  modal: JSX.Element;
};

export const useAddShotModal = ({ onShotAdded }: UseAddShotModalParams): UseAddShotModalResult => {
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

  const handleShotAdded = useCallback(
    async (newShot: CreateShotInput) => {
      setError(null);
      setIsSubmitting(true);

      try {
        await onShotAdded(newShot);
        setIsOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to add shot');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onShotAdded]
  );

  const modal = useMemo(() => {
    return (
      <AddShotModal
        open={isOpen}
        isSubmitting={isSubmitting}
        error={error}
        onClose={closeModal}
        onShotAdded={handleShotAdded}
      />
    );
  }, [closeModal, error, handleShotAdded, isOpen, isSubmitting]);

  return {
    isOpen,
    isSubmitting,
    error,
    openModal,
    closeModal,
    modal,
  };
};
