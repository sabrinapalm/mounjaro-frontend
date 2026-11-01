import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../../utils/cn';

const cardVariants = cva('border border-solid border-border', {
  variants: {
    appearance: {
      default: 'min-w-0 rounded-[var(--radius-lg)] bg-card shadow-[var(--shadow-card)]',
      custom: '',
    },
  },
  defaultVariants: { appearance: 'default' },
});

type CardProps = ComponentProps<'div'> & VariantProps<typeof cardVariants> & { asChild?: boolean };

// asChild retains each consumer's semantic section/article element without another wrapper.
export const Card = ({ className, appearance, asChild = false, ...props }: CardProps) => {
  const Component = asChild ? Slot : 'div';

  return <Component className={cn(cardVariants({ appearance }), className)} {...props} />;
};
