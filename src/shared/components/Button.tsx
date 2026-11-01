import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button as ButtonPrimitive } from './ui/button';

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
  const isDisabled = disabled || isLoading;

  return (
    <ButtonPrimitive
      className={className}
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      isLoading={isLoading}
      type={type}
      disabled={isDisabled}
      {...props}
    >
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
    </ButtonPrimitive>
  );
};
