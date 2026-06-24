import React from 'react';
import Skeleton from './Skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col items-center">
          <Skeleton className="h-24 w-24 rounded-full mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-6" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
           <Skeleton className="h-6 w-40 mb-6" />
           <div className="flex flex-wrap gap-2 mb-6">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
           </div>
           <Skeleton className="h-6 w-32 mb-4" />
           <Skeleton className="h-4 w-full mb-2" />
           <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}
