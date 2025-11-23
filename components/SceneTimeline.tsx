import React from 'react';
import type { Scene, ScenePrompt } from '../types';
import SceneCard from './SceneCard';
import Loader from './Loader';
import type { TranslationKeys } from '../translations';
import DownloadIcon from './icons/DownloadIcon';
import PhotoGroupIcon from './icons/PhotoGroupIcon';

interface SceneTimelineProps {
  scenes: Scene[];
  onUpdatePrompt: (sceneId: number, newPrompt: ScenePrompt) => void;
  isLoading: boolean;
  isBatchGenerating: boolean;
  isGenerationComplete: boolean;
  generationProgress: { current: number; total: number };
  generationStatusMessage: string;
  onDownloadPrompts: () => void;
  onDownloadZip: () => void;
  onDownloadSrt: () => void;
  t: TranslationKeys;
}

const SceneTimeline: React.FC<SceneTimelineProps> = ({ 
  scenes, 
  onUpdatePrompt, 
  isLoading, 
  isBatchGenerating,
  onDownloadPrompts,
  onDownloadZip,
  onDownloadSrt,
  t,
  isGenerationComplete,
  generationProgress,
  generationStatusMessage
}) => {
  const sortedScenes = [...scenes].sort((a, b) => a.scene_id - b.scene_id);
  const hasGeneratedAudio = scenes.some(s => s.audioUrl);

  return (
    <div className="p-6 bg-[#0D0D0F] rounded-lg min-h-full border border-gray-800">
      <div className="flex flex-col gap-4 mb-6 border-b-2 border-[#1E1E22] pb-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-100">
            {t.timelineTitle}
            </h2>
        </div>

        {/* Toolbar */}
        {scenes.length > 0 && (
            <div className="bg-[#1E1E22] p-3 rounded-lg border border-gray-700 flex flex-wrap items-center gap-3">
                <button 
                    onClick={onDownloadPrompts}
                    className="flex items-center gap-x-2 bg-[#0D0D0F] text-gray-300 font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors border border-gray-600 text-sm"
                >
                    <DownloadIcon className="w-4 h-4" />
                    {t.downloadButton}
                </button>
                
                <button 
                    onClick={onDownloadSrt}
                    className="flex items-center gap-x-2 bg-[#0D0D0F] text-[#5BEAFF] font-semibold py-2 px-4 rounded-md hover:bg-cyan-900/30 transition-colors border border-cyan-900 text-sm"
                >
                    <div className="font-mono text-xs border border-[#5BEAFF] rounded px-1">CC</div>
                    {t.downloadSrtButton}
                </button>
                
                 <button 
                    onClick={onDownloadZip}
                    disabled={!hasGeneratedAudio}
                    className="flex items-center gap-x-2 bg-cyan-900/40 text-cyan-200 font-semibold py-2 px-4 rounded-md hover:bg-cyan-800/60 transition-colors border border-cyan-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PhotoGroupIcon className="w-4 h-4" />
                    {t.downloadZipButton}
                </button>
            </div>
        )}
      </div>
      
      {scenes.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-[#1E1E22] rounded-lg text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-300">{t.emptyTimelineTitle}</h3>
          <p className="text-gray-500 mt-2">{t.emptyTimelineDescription}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedScenes.map((scene) => (
            <SceneCard 
              key={scene.scene_id} 
              scene={scene} 
              onUpdatePrompt={onUpdatePrompt} 
              isLoading={isLoading}
              isBatchGenerating={isBatchGenerating}
              t={t} 
            />
          ))}
        </div>
      )}

      {/* Centralized loader/status display at the bottom */}
      {(isLoading && !isBatchGenerating) && (
        <div className={`flex justify-center items-center ${scenes.length === 0 ? 'h-96' : 'mt-8'}`}>
          <Loader t={t} progress={generationProgress} statusMessage={generationStatusMessage} />
        </div>
      )}
      {isGenerationComplete && !isLoading && scenes.length > 0 && (
        <div className="flex justify-center items-center mt-8">
          <Loader t={t} isComplete={true} />
        </div>
      )}
    </div>
  );
};

export default SceneTimeline;