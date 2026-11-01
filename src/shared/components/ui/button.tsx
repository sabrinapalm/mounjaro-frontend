import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../../utils/cn';
import './button.css';

// shadcn/ui's Button pattern, using Tracksy's established variants and dimensions.
const buttonVariants = cva('button', {
  variants: {
    variant: {
      solid: 'button--solid',
      outline: 'button--outline',
      text: 'button--text',
    },
    color: {
      primary: 'button--primary',
      secondary: 'button--secondary',
      muted: 'button--muted',
      danger: 'button--danger',
    },
    size: { sm: 'button--sm', md: 'button--md', lg: 'button--lg' },
    fullWidth: { true: 'button--full-width' },
    isLoading: { true: 'button--loading' },
  },
  defaultVariants: { variant: 'outline', color: 'primary', size: 'md' },
});

type ButtonProps = Omit<ComponentProps<'button'>, 'color'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = ({
  className,
  variant,
  color,
  size,
  fullWidth,
  isLoading,
  asChild = false,
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      className={cn(buttonVariants({ variant, color, size, fullWidth, isLoading }), className)}
      {...props}
    />
  );
};
