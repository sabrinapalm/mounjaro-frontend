import type { ComponentProps } from 'react';
import { cn } from '../../utils/cn';
import './formControl.css';

// Adapted from shadcn/ui; Tracksy owns the surface and each form owns its dimensions.
export const Input = ({ className, type, ...props }: ComponentProps<'input'>) => (
  <input type={type} className={cn('tracksy-form-control', className)} {...props} />
);
