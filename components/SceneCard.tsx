import React, { useState, useEffect, useRef } from 'react';
import type { Scene } from '../types';
import type { TranslationKeys } from '../translations';
import LightBulbIcon from './icons/LightBulbIcon';
import PromptHelper from './PromptHelper';
import MusicalNoteIcon from './icons/MusicalNoteIcon';
import DownloadIcon from './icons/DownloadIcon';

interface SceneCardProps {
  scene: Scene;
  onUpdatePrompt: (sceneId: number, newPrompt: Scene['prompt']) => void;
  isLoading: boolean;
  isBatchGenerating: boolean;
  t: TranslationKeys;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, onUpdatePrompt, isLoading, isBatchGenerating, t }) => {
  const [promptText, setPromptText] = useState(JSON.stringify(scene.prompt, null, 2));
  const [isValidJson, setIsValidJson] = useState(true);
  const [isHelperVisible, setIsHelperVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setPromptText(JSON.stringify(scene.prompt, null, 2));
      setIsValidJson(true);
    }
  }, [scene.prompt]);
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setPromptText(newText);
    try {
      JSON.parse(newText);
      setIsValidJson(true);
    } catch (error) {
      setIsValidJson(false);
    }
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (isValidJson) {
      try {
        const newPromptObject = JSON.parse(promptText);
        if (JSON.stringify(newPromptObject) !== JSON.stringify(scene.prompt)) {
          onUpdatePrompt(scene.scene_id, newPromptObject);
        }
      } catch (e) {
        setPromptText(JSON.stringify(scene.prompt, null, 2));
        setIsValidJson(true);
      }
    } else {
      setPromptText(JSON.stringify(scene.prompt, null, 2));
      setIsValidJson(true);
    }
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
  };
  
  const handleInsertTag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const newText = text.substring(0, start) + tag + text.substring(end);
    setPromptText(newText); 

    try {
      JSON.parse(newText);
      setIsValidJson(true);
    } catch (error) {
      setIsValidJson(false);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + tag.length;
    }, 0);
  };

  return (
    <div className="bg-[#1E1E22] rounded-lg p-4 flex flex-col space-y-3 shadow-md border border-gray-700 hover:border-[#5BEAFF] transition-colors duration-300">
      <div className="flex justify-between items-center text-sm border-b border-gray-700 pb-3">
        <h3 className="text-lg font-bold text-gray-100">
          {t.sceneLabel} {scene.scene_id}
        </h3>
        <div className="flex gap-4 items-center">
            <p className="font-mono text-gray-400 bg-[#0D0D0F] px-2 py-1 rounded-md text-xs">{t.timeLabel}: {scene.time}</p>
             {scene.audioUrl && (
                 <div className="flex items-center gap-2">
                     <div className="bg-cyan-900/30 px-3 py-1 rounded-full border border-cyan-900/50 flex items-center gap-2">
                        <MusicalNoteIcon className="w-4 h-4 text-[#5BEAFF]" />
                        <audio controls src={scene.audioUrl} className="h-8 w-48" />
                     </div>
                     <a 
                        href={scene.audioUrl} 
                        download={`scene_${String(scene.scene_id).padStart(3, '0')}.wav`}
                        title={t.downloadSceneAudio}
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-[#5BEAFF] transition-colors"
                     >
                        <DownloadIcon className="w-5 h-5" />
                     </a>
                 </div>
             )}
             {scene.isGeneratingAudio && (
                 <div className="flex items-center gap-2 text-cyan-400 text-xs animate-pulse">
                    <MusicalNoteIcon className="w-4 h-4" />
                    <span>Generating Audio...</span>
                 </div>
             )}
        </div>
      </div>
      
      <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor={`prompt-${scene.scene_id}`} className="block text-xs font-medium text-gray-500">
              {t.promptLabel}
            </label>
            <button 
              onClick={() => setIsHelperVisible(!isHelperVisible)}
              title={t.promptHelperTooltip}
              className={`p-1 rounded-full ${isHelperVisible ? 'bg-cyan-900/70 text-cyan-300' : 'text-gray-500 hover:bg-gray-700 hover:text-cyan-300'} transition-colors`}
              >
              <LightBulbIcon className="w-5 h-5" />
            </button>
          </div>
          <textarea
            ref={textareaRef}
            id={`prompt-${scene.scene_id}`}
            rows={isHelperVisible ? 12 : 6}
            className={`w-full bg-[#0D0D0F] text-gray-300 p-2 rounded-md border transition text-sm font-mono ${!isValidJson ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-600 focus:ring-1 focus:ring-[#5BEAFF] focus:border-[#5BEAFF]'}`}
            value={promptText}
            onChange={handlePromptChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {!isValidJson && <p className="text-xs text-red-400 mt-1">{t.invalidJsonError}</p>}
          {isHelperVisible && <PromptHelper onInsertTag={handleInsertTag} t={t} />}
      </div>
    </div>
  );
};

export default SceneCard;