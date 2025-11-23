import React from 'react';
import type { TranslationKeys } from '../translations';
import InformationCircleIcon from './icons/InformationCircleIcon';

interface ContinueGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  generatedCount: number;
  totalCount: number;
  t: TranslationKeys;
}

const ContinueGenerationModal: React.FC<ContinueGenerationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm,
    generatedCount,
    totalCount,
    t 
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
      aria-labelledby="continue-modal-title"
    >
      <div 
        className="bg-[#1E1E22] rounded-lg shadow-2xl w-full max-w-md border-2 border-gray-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
                <InformationCircleIcon className="w-16 h-16 text-cyan-400" />
            </div>
          <h2 id="continue-modal-title" className="text-xl font-bold text-gray-100">{t.continueGenerationTitle}</h2>
          <p className="mt-2 text-sm text-gray-400">
            {t.continueGenerationMessage(generatedCount, totalCount)}
          </p>
        </div>
        <div className="bg-gray-800/50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#5BEAFF] text-base font-bold text-black hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:w-auto sm:text-sm transition-colors"
            onClick={onConfirm}
          >
            {t.continueGenerationButton}
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#0D0D0F] text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
            onClick={onClose}
          >
            {t.finishForNowButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContinueGenerationModal;