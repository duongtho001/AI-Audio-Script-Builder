import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-7.19c0-.868.372-1.66.969-2.226z"
      clipRule="evenodd"
    />
    <path d="M1.03 7.8A.75.75 0 011.75 7.5h5.19c.868 0 1.66.372 2.226.969l.303.303c.624.624.624 1.637 0 2.262l-3.003 3.003c-.624.624-1.637.624-2.262 0l-.303-.303a3.001 3.001 0 01-.97-2.226V7.8z" />
  </svg>
);

export default SparklesIcon;
