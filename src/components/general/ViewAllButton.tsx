import type { ButtonHTMLAttributes } from 'react';
import './ViewAllButton.css';

type ViewAllButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

export const ViewAllButton = ({
  label = 'View all',
  type = 'button',
  ...buttonProps
}: ViewAllButtonProps) => {
  return (
    <button type={type} className='view-all-button' {...buttonProps}>
      {label}
    </button>
  );
};
