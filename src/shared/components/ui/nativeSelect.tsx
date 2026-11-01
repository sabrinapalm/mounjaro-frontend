import type { ComponentProps } from 'react';
import { cn } from '../../utils/cn';
import './formControl.css';

// Keep Tracksy's native select, option semantics, and existing CSS arrow.
export const NativeSelect = ({ className, ...props }: ComponentProps<'select'>) => (
  <select className={cn('tracksy-form-control', className)} {...props} />
);
