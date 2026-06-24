import React from 'react';
import Skeleton from './Skeleton';

export default function JobCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm flex flex-col h-[280px]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="mt-auto flex justify-between items-center border-t border-[var(--color-border)] pt-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}
