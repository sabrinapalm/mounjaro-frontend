import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ConfirmDialog.css';

type ConfirmDialogVariant = 'danger' | 'default';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, isLoading, onCancel]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="confirm-dialog-backdrop" role="presentation">
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <h2 id="confirm-dialog-title">{title}</h2>

        <p id="confirm-dialog-message">{message}</p>

        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="confirm-dialog-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={`confirm-dialog-confirm ${
              variant === 'danger' ? 'confirm-dialog-confirm-danger' : ''
            }`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};