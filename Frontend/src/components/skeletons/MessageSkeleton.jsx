import React from 'react';
import Skeleton from './Skeleton';

export default function MessageSkeleton({ isOwn = false }) {
  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end max-w-[70%] gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
        <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
          <Skeleton className={`h-10 w-48 rounded-2xl ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}`} />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
