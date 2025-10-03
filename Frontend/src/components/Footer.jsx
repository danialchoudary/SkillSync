import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full text-center py-3 text-xs text-gray-400 bg-white border-t mt-8">
      &copy; {new Date().getFullYear()} JobSeeker Platform. All rights reserved.
    </footer>
  );
}
