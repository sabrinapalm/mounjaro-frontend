import { type JSX, useCallback, useMemo, useState } from 'react';
import { AddCheckInModal } from '../components/modals/AddCheckInModal';
import type { CreateCheckInInput } from '../types';

type UseAddCheckInModalParams = {
  onCheckInAdded: (checkIn: CreateCheckInInput) => Promise<void>;
};

type UseAddCheckInModalResult = {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  modal: JSX.Element;
};

export const useAddCheckInModal = ({
  onCheckInAdded,
}: UseAddCheckInModalParams): UseAddCheckInModalResult => {
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

  const handleCheckInAdded = useCallback(
    async (newCheckIn: CreateCheckInInput) => {
      setError(null);
      setIsSubmitting(true);

      try {
        await onCheckInAdded(newCheckIn);
        setIsOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to add check-in');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onCheckInAdded]
  );

  const modal = useMemo(() => {
    return (
      <AddCheckInModal
        open={isOpen}
        isSubmitting={isSubmitting}
        error={error}
        onClose={closeModal}
        onCheckInAdded={handleCheckInAdded}
      />
    );
  }, [closeModal, error, handleCheckInAdded, isOpen, isSubmitting]);

  return {
    isOpen,
    isSubmitting,
    error,
    openModal,
    closeModal,
    modal,
  };
};
