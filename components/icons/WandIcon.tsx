import React from 'react';

const WandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M11.025 2.265c.366-1.026 1.575-1.026 1.94 0l.443 1.24c.139.39.51.666.936.666h1.303c1.076 0 1.545 1.32.787 1.972l-1.056.766a.75.75 0 00-.286.832l.443 1.24c.366 1.026-.74 1.9-1.638 1.309l-1.056-.766a.75.75 0 00-.936 0l-1.056.766c-.898.59-2.004-.283-1.638-1.309l.443-1.24a.75.75 0 00-.286-.832l-1.056-.766c-.758-.652-.29-1.972.787-1.972h1.303a.75.75 0 00.936-.666l.443-1.24z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M12.25 10.5a.75.75 0 01.75.75v8.01a.75.75 0 01-1.5 0V11.25a.75.75 0 01.75-.75z"
      clipRule="evenodd"
    />
    <path d="M4.125 12.75a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM19.875 12.75a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM7.125 18a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM16.865 18a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01z" />
  </svg>
);

export default WandIcon;
