
import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, children, error, className, ...props }) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-cep-text dark:text-slate-300">
        {label}
      </label>
      <select
        id={id}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-cep-primary focus:border-cep-primary sm:text-sm rounded-md ${error ? 'border-red-500' : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Select;