import React from 'react';

export const MetronomeIcon = ({ size = 24, className }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 21h16" />
    <path d="M6 21L10 5c.5-1.5 3.5-1.5 4 0l4 16" />
    <path d="M12 21L16 9" />
    <circle cx="14" cy="15" r="2" fill="currentColor" />
  </svg>
);

export const TuningForkIcon = ({ size = 24, className }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M8 4v8c0 2.2 1.8 4 4 4v6" />
    <path d="M16 4v8c0 2.2-1.8 4-4 4" />
  </svg>
);
