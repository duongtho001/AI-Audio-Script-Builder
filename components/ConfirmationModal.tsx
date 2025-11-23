import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  icon?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  icon,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div
        className="bg-[#1E1E22] rounded-lg shadow-2xl w-full max-w-md border-2 border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          {icon && <div className="flex justify-center mb-4">{icon}</div>}
          <h2 id="confirmation-modal-title" className="text-xl font-bold text-gray-100">{title}</h2>
          <p className="mt-2 text-sm text-gray-400">{message}</p>
        </div>
        <div className="bg-gray-800/50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm transition-colors"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#0D0D0F] text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;