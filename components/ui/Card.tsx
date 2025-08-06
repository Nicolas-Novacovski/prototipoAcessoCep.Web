import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`border-b border-slate-200 dark:border-slate-700 p-6 ${className}`}>
            {children}
        </div>
    )
}

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <h2 className={`text-xl font-bold text-cep-text dark:text-white ${className}`}>
            {children}
        </h2>
    )
}

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    )
}

export default Card;