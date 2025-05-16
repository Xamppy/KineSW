import React from 'react';

const LoadingSpinner = ({ size = 'md', message = '', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-16 w-16'
  };

  const spinnerSize = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${spinnerSize} animate-spin rounded-full border-t-2 border-b-2 border-wanderers`}
        role="status"
        aria-label="Cargando"
      />
      {message && (
        <p className="mt-2 text-gray-600 text-sm">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 