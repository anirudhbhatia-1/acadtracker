import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton base component per design.md §14.1
 * Uses bg-surface-2 border border-border animated with a shimmer sweep (animate-pulse).
 * Respects prefers-reduced-motion per design.md §8 & §14.1.
 */
const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-lg bg-surface-2 border border-border animate-pulse motion-reduce:animate-none',
        className
      )}
      {...props}
    />
  );
};

export { Skeleton };
