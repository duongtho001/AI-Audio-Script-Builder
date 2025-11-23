import React from 'react';

const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.79-.233 1.125l-6.25 9.375a.75.75 0 00.976 1.053l6.25-9.375a2.25 2.25 0 012.18-1.086c.441.022.88.124 1.285.308a6.75 6.75 0 006.65-9.444A6.75 6.75 0 0015.75 1.5zm0 3a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V5.25a.75.75 0 01.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

export default KeyIcon;
