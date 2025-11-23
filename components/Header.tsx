import React from 'react';
import type { Language, TranslationKeys } from '../translations';
import SparklesIcon from './icons/SparklesIcon';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import PlusIcon from './icons/PlusIcon';
import KeyIcon from './icons/KeyIcon';


interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenGuide: () => void;
  onOpenApiKey: () => void;
  onNewProject: () => void;
  t: TranslationKeys;
}

const Header: React.FC<HeaderProps> = ({ 
  language, 
  setLanguage, 
  t,
  onOpenGuide,
  onOpenApiKey,
  onNewProject,
}) => {
  return (
    <header className="bg-[#1E1E22] p-4 shadow-md flex justify-between items-center border-b-2 border-gray-700 sticky top-0 z-10">
      <div className="flex items-center gap-x-3 flex-shrink-0">
        <SparklesIcon className="w-8 h-8 text-[#5BEAFF]" />
        <div>
          <h1 className="text-xl font-bold text-gray-100">{t.appTitle}</h1>
          <p className="text-sm text-gray-400">{t.appDescription}</p>
        </div>
      </div>

      <div className="flex items-center gap-x-4">
        <button
          onClick={onNewProject}
          className="flex items-center gap-x-2 bg-[#0D0D0F] text-gray-300 font-semibold py-2 px-3 rounded-lg hover:bg-gray-700 hover:text-white transition-colors border border-gray-600"
        >
          <PlusIcon className="w-5 h-5" />
          {t.newProjectButton}
        </button>
        
        <button 
          onClick={onOpenApiKey} 
          title={t.apiKeyButtonTooltip} 
          className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-[#5BEAFF] transition-colors"
        >
          <KeyIcon className="w-6 h-6" />
        </button>

        <button 
          onClick={onOpenGuide} 
          title={t.guideButtonTooltip} 
          className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <QuestionMarkCircleIcon className="w-6 h-6" />
        </button>

        <div className="h-6 border-l border-gray-700"></div>

        <div className="flex items-center gap-x-2">
          <label htmlFor="language-select" className="text-sm font-medium text-gray-400">
            {t.languageLabel}:
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-[#0D0D0F] text-gray-300 p-2 rounded-md border border-gray-600 focus:ring-1 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition text-sm"
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;