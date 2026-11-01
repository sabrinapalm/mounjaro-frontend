import type { ComponentProps } from 'react';
import { cn } from '../../utils/cn';
import './formControl.css';

export const Textarea = ({ className, ...props }: ComponentProps<'textarea'>) => (
  <textarea className={cn('tracksy-form-control', className)} {...props} />
);
