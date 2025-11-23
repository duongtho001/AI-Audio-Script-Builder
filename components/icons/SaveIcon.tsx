import React from 'react';

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M3 5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V5.25zM18.75 4.5H5.25c-.414 0-.75.336-.75.75v13.5c0 .414.336.75.75.75h13.5c.414 0 .75-.336.75-.75V5.25c0-.414-.336-.75-.75-.75z"
    />
    <path
      d="M8.25 15a.75.75 0 01.75-.75h6a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM8.25 11.25a.75.75 0 01.75-.75h6a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM8.25 7.5a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z"
    />
  </svg>
);

export default SaveIcon;
