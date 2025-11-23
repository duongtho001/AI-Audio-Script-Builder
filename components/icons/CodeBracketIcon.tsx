import React from 'react';

const CodeBracketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M17.25 6.75L22.5 12l-5.25 5.25M6.75 17.25L1.5 12l5.25-5.25m7.5-3l-4.5 15" 
    />
  </svg>
);

export default CodeBracketIcon;
