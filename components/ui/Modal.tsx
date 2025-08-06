import React, { ReactNode, useEffect } from 'react';
import { IconX } from '../../constants';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

type ModalSize = keyof typeof sizeClasses;

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onMouseDown={onClose}>
      <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full ${sizeClasses[size]} m-4`} onMouseDown={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700 p-4">
          <h3 className="text-xl font-semibold text-cep-text dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-cep-text dark:hover:text-white p-1 rounded-full transition-colors">
            <IconX className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;