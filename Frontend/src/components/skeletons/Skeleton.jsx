import React, { useState, useEffect } from 'react';

export default function Skeleton({ className = '' }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 250); // 250ms delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`animate-pulse bg-gray-100 dark:bg-gray-600 rounded-md transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'} ${className}`}
    ></div>
  );
}
