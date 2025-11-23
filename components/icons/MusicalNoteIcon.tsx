import React from 'react';

const MusicalNoteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2.25a.75.75 0 01.75.75v10.5a3 3 0 01-3 3H9a3 3 0 01-3-3V9.75a.75.75 0 011.5 0v3.75a1.5 1.5 0 001.5 1.5h.75a1.5 1.5 0 001.5-1.5V3a.75.75 0 01.75-.75z" />
    <path d="M14.25 5.25a.75.75 0 000 1.5h.75a2.25 2.25 0 012.25 2.25v.75a.75.75 0 001.5 0v-.75a3.75 3.75 0 00-3.75-3.75h-.75z" />
  </svg>
);

export default MusicalNoteIcon;
