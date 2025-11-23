import React from 'react';
import type { TranslationKeys } from '../translations';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface LoaderProps {
  t: TranslationKeys;
  progress?: { current: number; total: number };
  isComplete?: boolean;
  statusMessage?: string;
}

const Loader: React.FC<LoaderProps> = ({ t, progress, isComplete, statusMessage }) => {
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-400" />
        <p className="text-green-400 text-lg font-medium">{t.generationComplete}</p>
      </div>
    );
  }

  if (progress && progress.total > 0) {
    const percentage = Math.round((progress.current / progress.total) * 100);
    return (
      <div className="w-full max-w-md mx-auto space-y-3">
        {statusMessage && (
          <p className="text-center text-cyan-300 text-sm font-medium animate-pulse">
            {statusMessage}
          </p>
        )}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-cyan-200 bg-cyan-800/50">
                {t.generatingScene(progress.current, progress.total)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-cyan-400">
                {percentage}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-cyan-900/50 border border-cyan-800">
            <div
              style={{ width: `${percentage}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-cyan-500 to-[#5BEAFF] transition-all duration-300"
            ></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback to original spinner for non-progress tasks
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#5BEAFF]"></div>
      <p className="text-[#5BEAFF] text-lg font-medium">{t.loaderText}</p>
    </div>
  );
};

export default Loader;