
import React, { ReactNode } from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  confirmButtonText?: string;
  confirmButtonVariant?: 'primary' | 'secondary' | 'danger';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
  confirmButtonText = 'Confirmar',
  confirmButtonVariant = 'danger',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
        <div className="flex justify-end gap-2 pt-6 mt-4 border-t dark:border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" variant={confirmButtonVariant} onClick={onConfirm} isLoading={isLoading}>
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;