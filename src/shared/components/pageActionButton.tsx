import type { ComponentProps } from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';
import './pageActionButton.css';

type PageActionButtonProps = Omit<
  ComponentProps<typeof Button>,
  'variant' | 'color' | 'size' | 'fullWidth'
>;

export const PageActionButton = ({ className, ...props }: PageActionButtonProps) => (
  <Button
    {...props}
    className={cn('page-action-button', className)}
    variant='solid'
    color='primary'
    size='md'
  />
);
