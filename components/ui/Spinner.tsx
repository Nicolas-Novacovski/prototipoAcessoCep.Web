
import React from 'react';

const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-12 w-12 border-t-2 border-b-2',
    lg: 'h-16 w-16 border-t-2 border-b-2',
  };
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-cep-primary ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default Spinner;
