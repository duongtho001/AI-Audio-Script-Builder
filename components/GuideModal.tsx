import React from 'react';
import type { TranslationKeys } from '../translations';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationKeys;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div 
        className="bg-[#1E1E22] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-gray-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#1E1E22] px-6 py-4 flex justify-between items-center border-b border-gray-700">
          <h2 id="guide-modal-title" className="text-2xl font-bold text-gray-100">{t.guideModalTitle}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-8 space-y-6">
          <ol className="list-decimal list-inside space-y-4 text-gray-300">
            {t.guideSteps.map((step, index) => (
              <li key={index} className="pl-2">
                <strong className="font-semibold text-[#5BEAFF]">{step.title}:</strong>
                <span className="ml-2 text-gray-300">{step.description}</span>
              </li>
            ))}
          </ol>
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-xl font-bold text-gray-100 mb-4">{t.guideProTipsTitle}</h3>
            <ul className="list-disc list-inside space-y-4 text-gray-300">
              {t.guideProTips.map((tip, index) => (
                <li key={index} className="pl-2">
                  <strong className="font-semibold text-cyan-300">{tip.title}:</strong>
                  <span className="ml-2 text-gray-400">{tip.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;