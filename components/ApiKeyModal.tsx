import React, { useState, useEffect } from 'react';
import type { TranslationKeys } from '../translations';
import KeyIcon from './icons/KeyIcon';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: string[]) => void;
  currentKeys: string[];
  t: TranslationKeys;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKeys, t }) => {
  const [keysInput, setKeysInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setKeysInput(currentKeys.join('\n'));
    }
  }, [isOpen, currentKeys]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    const keys = keysInput.split('\n').map(k => k.trim()).filter(Boolean);
    onSave(keys);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-modal-title"
    >
      <div
        className="bg-[#1E1E22] rounded-lg shadow-2xl w-full max-w-lg border-2 border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-x-4 mb-4">
            <KeyIcon className="w-8 h-8 text-[#5BEAFF]" />
            <div>
              <h2 id="api-key-modal-title" className="text-xl font-bold text-gray-100">{t.apiKeyModalTitle}</h2>
              <p className="text-sm text-gray-400">{t.apiKeyModalDescription}</p>
            </div>
          </div>
          <textarea
            value={keysInput}
            onChange={(e) => setKeysInput(e.target.value)}
            rows={8}
            className="w-full bg-[#0D0D0F] text-gray-300 p-3 rounded-md border border-gray-700 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition font-mono"
            placeholder={t.apiKeyModalPlaceholder}
          />
           <p className="text-xs text-gray-500 mt-2">{t.apiKeyModalNotice}</p>
        </div>
        <div className="bg-gray-800/50 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#0D0D0F] text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:w-auto sm:text-sm transition-colors"
            onClick={onClose}
          >
            {t.cancelButton}
          </button>
          <button
            type="button"
            className="rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#5BEAFF] text-base font-bold text-black hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:w-auto sm:text-sm transition-colors"
            onClick={handleSave}
          >
            {t.apiKeyModalSaveButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
