import React from 'react';

const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
    >
    <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
    <path 
        fillRule="evenodd" 
        d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.451.246 2.586 1.46 2.586 2.965V19.5a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 19.5V9.574c0-1.506 1.135-2.72 2.586-2.965.382-.064.766-.123 1.152-.177.465-.067.87-.327 1.11-.71l.82-1.318a2.25 2.25 0 012.332-1.39zM12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" 
        clipRule="evenodd" 
    />
    </svg>
);

export default CameraIcon;