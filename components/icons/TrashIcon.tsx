import React from 'react';

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 01-.749.658h-7.5a.75.75 0 01-.749-.658L5.168 6.648l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9zM5.25 6.375a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v.042l-.223.035a49.47 49.47 0 00-11.108 0L5.25 6.417V6.375zM8.25 18.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

export default TrashIcon;
