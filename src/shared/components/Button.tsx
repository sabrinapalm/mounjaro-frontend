import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type ButtonVariant = 'solid' | 'outline' | 'text';
type ButtonColor = 'primary' | 'secondary' | 'muted' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  isLoading?: boolean;
}

export const Button = ({
  children,
  className = '',
  variant = 'outline',
  color = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'start',
  isLoading = false,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) => {
  const classNames = [
    'button',
    `button--${variant}`,
    `button--${color}`,
    `button--${size}`,
    fullWidth ? 'button--full-width' : '',
    isLoading ? 'button--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const isDisabled = disabled || isLoading;

  return (
    <button className={classNames} type={type} disabled={isDisabled} {...props}>
      {isLoading ? (
        <span className='button__spinner' aria-hidden='true' />
      ) : (
        icon &&
        iconPosition === 'start' && (
          <span className='button__icon button__icon--start' aria-hidden='true'>
            {icon}
          </span>
        )
      )}

      <span className='button__content'>{children}</span>

      {!isLoading && icon && iconPosition === 'end' && (
        <span className='button__icon button__icon--end' aria-hidden='true'>
          {icon}
        </span>
      )}
    </button>
  );
};
