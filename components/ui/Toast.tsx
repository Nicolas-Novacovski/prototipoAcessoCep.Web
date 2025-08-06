
import React, { useEffect } from 'react';
import { useToast, ToastMessage, ToastType } from '../../hooks/useToast';
import { IconCircleCheck, IconCircleX, IconInfo, IconX } from '../../constants';

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <IconCircleCheck className="h-6 w-6 text-green-500" />,
  error: <IconCircleX className="h-6 w-6 text-red-500" />,
  info: <IconInfo className="h-6 w-6 text-blue-500" />,
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 dark:bg-green-900/50 dark:border-green-800',
  error: 'bg-red-50 border-red-200 dark:bg-red-900/50 dark:border-red-800',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/50 dark:border-blue-800',
};


export const Toast: React.FC<ToastMessage> = ({ id, message, type }) => {
  const { removeToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id);
    }, 5000); // 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [id, removeToast]);

  return (
    <div
      className={`max-w-sm w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 animate-fade-in-right ${toastStyles[type]}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{toastIcons[type]}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-cep-text dark:text-slate-200">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white dark:bg-slate-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cep-primary"
              onClick={() => removeToast(id)}
            >
              <span className="sr-only">Close</span>
              <IconX className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed inset-0 flex items-end justify-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50">
      <div className="w-full max-w-sm space-y-4">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
};