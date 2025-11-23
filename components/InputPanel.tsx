import React, { useRef } from 'react';
import type { VideoConfig, StorySuggestion } from '../types';
import { VIDEO_FORMATS, VOICE_TONES, AUDIO_STYLES, OUTPUT_LANGUAGES } from '../constants';
import SparklesIcon from './icons/SparklesIcon';
import type { TranslationKeys, Language } from '../translations';
import ClipboardIcon from './icons/ClipboardIcon';
import WandIcon from './icons/WandIcon';

interface InputPanelProps {
  scriptText: string;
  setScriptText: React.Dispatch<React.SetStateAction<string>>;
  
  inputMode: 'script' | 'manual';
  setInputMode: (mode: 'script' | 'manual') => void;
  manualScriptText: string;
  setManualScriptText: React.Dispatch<React.SetStateAction<string>>;

  videoConfig: VideoConfig;
  setVideoConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
  storySuggestion: StorySuggestion | null;
  editedVisualStyle: string;
  setEditedVisualStyle: (style: string) => void;
  onGetStorySuggestion: () => void;
  onAcceptAndGenerate: () => void;
  onGenerateFromManual: () => void;
  isLoading: boolean;
  isSuggesting: boolean;
  t: TranslationKeys;
  language: Language;
}


const InputPanel: React.FC<InputPanelProps> = ({
  scriptText,
  setScriptText,
  inputMode,
  setInputMode,
  manualScriptText,
  setManualScriptText,
  videoConfig,
  setVideoConfig,
  storySuggestion,
  editedVisualStyle,
  setEditedVisualStyle,
  onGetStorySuggestion,
  onAcceptAndGenerate,
  onGenerateFromManual,
  isLoading,
  isSuggesting,
  t,
  language,
}) => {
  const textFileRef = useRef<HTMLInputElement>(null);
  const manualTextFileRef = useRef<HTMLInputElement>(null);
  
  const sceneDuration = 8;

  const handleConfigChange = <K extends keyof VideoConfig>(key: K, value: VideoConfig[K]) => {
    setVideoConfig((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleTextFileChange = (event: React.ChangeEvent<HTMLInputElement>, isManual: boolean) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
            if (isManual) {
                setManualScriptText(text);
            } else {
                setScriptText(text);
            }
        }
      };
      reader.readAsText(file);
    }
    if (event.target) event.target.value = '';
  };

  const handleAddAudioStyle = (style: string) => {
    setVideoConfig(prev => {
        const currentStyle = prev.audioStyle;
        if (currentStyle.includes(style)) return prev;
        const newStyle = currentStyle ? `${currentStyle}, ${style}` : style;
        return { ...prev, audioStyle: newStyle };
    });
  };

  // Basic estimation
  let estimatedScenes = 0;
  if (inputMode === 'script') {
      estimatedScenes = Math.max(1, Math.ceil(scriptText.length / 150));
  } else {
      // Estimate scenes by numbering (1., 2.) or newlines if manual
      const matches = manualScriptText.match(/^\d+[\.)]\s/gm);
      if (matches) {
          estimatedScenes = matches.length;
      } else {
          estimatedScenes = manualScriptText.split('\n').filter(line => line.trim().length > 0).length;
      }
  }
  const estimatedDuration = estimatedScenes * sceneDuration;
  const displayMinutes = Math.floor(estimatedDuration / 60);
  const displaySeconds = (estimatedDuration % 60).toFixed(0);

  const canGetSuggestion = !isLoading && !isSuggesting && (inputMode === 'script' ? scriptText.length > 10 : false);
  const canGenerateManual = !isLoading && inputMode === 'manual' && manualScriptText.trim().length > 0;

  return (
    <div className="p-6 bg-[#1E1E22] rounded-lg shadow-lg space-y-8">
      <input
        type="file"
        ref={textFileRef}
        onChange={(e) => handleTextFileChange(e, false)}
        className="hidden"
        accept=".txt"
      />
       <input
        type="file"
        ref={manualTextFileRef}
        onChange={(e) => handleTextFileChange(e, true)}
        className="hidden"
        accept=".txt"
      />

      {/* Input Mode Toggle */}
      <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">{t.inputModeLabel}</label>
          <div className="flex bg-[#0D0D0F] p-1 rounded-lg border border-gray-700">
              <button
                  onClick={() => setInputMode('script')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${inputMode === 'script' ? 'bg-[#5BEAFF] text-black shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
              >
                  {t.modeScript}
              </button>
              <button
                  onClick={() => setInputMode('manual')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${inputMode === 'manual' ? 'bg-[#5BEAFF] text-black shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
              >
                  {t.modeSceneList}
              </button>
          </div>
      </div>

      {inputMode === 'script' ? (
          <div>
            <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-semibold text-gray-200">
                {t.scriptInputLabel}
                </label>
                <button 
                    onClick={() => textFileRef.current?.click()}
                    className="text-xs text-[#5BEAFF] hover:underline flex items-center gap-1"
                >
                    <ClipboardIcon className="w-4 h-4" />
                    {t.uploadTxtButton}
                </button>
            </div>
            
            <textarea
                className="w-full h-40 bg-[#0D0D0F] text-gray-300 p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition font-mono text-sm"
                placeholder={t.scriptPlaceholder}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
            />
            {scriptText.length > 0 && (
                <p className="text-xs text-gray-500 mt-2 text-right">
                    {scriptText.length} chars ~ {t.durationFeedback(estimatedScenes, displayMinutes, Number(displaySeconds))}
                </p>
            )}
          </div>
      ) : (
          <div>
             <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-semibold text-gray-200">
                    {t.manualSceneInputLabel}
                </label>
                <button 
                    onClick={() => manualTextFileRef.current?.click()}
                    className="text-xs text-[#5BEAFF] hover:underline flex items-center gap-1"
                >
                    <ClipboardIcon className="w-4 h-4" />
                    {t.uploadTxtButton}
                </button>
            </div>
            
            <textarea
                className="w-full h-60 bg-[#0D0D0F] text-gray-300 p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition font-mono text-sm"
                placeholder={t.manualPlaceholder}
                value={manualScriptText}
                onChange={(e) => setManualScriptText(e.target.value)}
            />
             {manualScriptText.length > 0 && (
                <p className="text-xs text-gray-500 mt-2 text-right">
                    ~{estimatedScenes} scenes detected ~ {t.durationFeedback(estimatedScenes, displayMinutes, Number(displaySeconds))}
                </p>
            )}
          </div>
      )}
      
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">{t.videoSettingsLabel}</h3>
        
        {/* Output Language - PROMINENT */}
        <div className="mb-6">
            <label htmlFor="output-language" className="block text-base font-bold text-[#5BEAFF] mb-2">
                {t.outputLanguageLabel}
            </label>
            <div className="relative">
                <select
                    id="output-language"
                    className="w-full bg-[#0D0D0F] text-gray-200 p-4 rounded-lg border border-cyan-900/50 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition appearance-none font-medium"
                    value={videoConfig.outputLanguage}
                    onChange={(e) => handleConfigChange('outputLanguage', e.target.value)}
                >
                    {OUTPUT_LANGUAGES.map(lang => <option key={lang.key} value={lang.key}>{lang.label}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">* Audio sẽ được tạo bằng ngôn ngữ này.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="voice-tone" className="block text-sm font-medium text-gray-400 mb-2">{t.voiceToneLabel}</label>
            <select
              id="voice-tone"
              className="w-full bg-[#0D0D0F] text-gray-300 p-3 rounded-md border border-gray-700 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition"
              value={videoConfig.voiceTone}
              onChange={(e) => handleConfigChange('voiceTone', e.target.value)}
            >
              {VOICE_TONES.map(tone => <option key={tone.key} value={tone.key}>{tone[language]}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-400 mb-2">{t.videoFormatLabel}</label>
            <select
              id="format"
              className="w-full bg-[#0D0D0F] text-gray-300 p-3 rounded-md border border-gray-700 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition"
              value={videoConfig.format}
              onChange={(e) => handleConfigChange('format', e.target.value as VideoConfig['format'])}
            >
              {VIDEO_FORMATS.map(format => <option key={format.key} value={format.key}>{format[language]}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6">
            <label htmlFor="audio-style" className="block text-sm font-medium text-gray-400 mb-2">{t.audioStyleLabel}</label>
            <input
                type="text"
                id="audio-style"
                className="w-full bg-[#0D0D0F] text-gray-300 p-3 rounded-md border border-gray-700 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition"
                value={videoConfig.audioStyle}
                onChange={(e) => handleConfigChange('audioStyle', e.target.value)}
                placeholder={t.audioStylePlaceholder}
            />
            {/* Suggestions */}
            <div className="mt-2">
                <span className="text-xs font-medium text-gray-500 mr-2">{t.suggestionsLabel}</span>
                <div className="inline-flex flex-wrap gap-2">
                    {AUDIO_STYLES.map((style) => (
                        <button
                            key={style.key}
                            onClick={() => handleAddAudioStyle(style[language])}
                            className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
                        >
                            {style[language]}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Actions based on Mode */}
      {inputMode === 'script' && !storySuggestion && (
        <button
          onClick={onGetStorySuggestion}
          disabled={!canGetSuggestion}
          className="w-full flex items-center justify-center gap-x-2 bg-[#5BEAFF] text-[#0D0D0F] font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105"
        >
          <WandIcon className="w-6 h-6" />
          {isSuggesting ? t.suggestingStory : t.analyzeScriptButton}
        </button>
      )}
      
      {inputMode === 'manual' && (
          <button
            onClick={onGenerateFromManual}
            disabled={!canGenerateManual}
            className="w-full flex items-center justify-center gap-x-2 bg-[#5BEAFF] text-[#0D0D0F] font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105"
          >
            <SparklesIcon className="w-6 h-6" />
            {t.generateFromScenesButton}
          </button>
      )}

      {isSuggesting && !storySuggestion && inputMode === 'script' && (
         <div className="flex justify-center items-center p-4">
             <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-cyan-400"></div>
             <p className="ml-3 text-cyan-300 animate-pulse">{t.suggestingStory}</p>
         </div>
      )}

      {storySuggestion && !isLoading && inputMode === 'script' && (
        <div className="p-4 bg-[#0D0D0F] rounded-lg border-2 border-cyan-700 space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-cyan-300">{t.storySuggestionTitle}</h3>
            <div>
                <label className="text-sm font-bold text-gray-400">{t.storyConceptLabel}</label>
                <p className="mt-1 text-gray-300 text-sm bg-gray-800/50 p-3 rounded-md">{storySuggestion.concept}</p>
            </div>
             <div>
                <label htmlFor="visual-style-editor" className="text-sm font-bold text-gray-400">{t.visualStyleLabel}</label>
                <textarea
                    id="visual-style-editor"
                    rows={4}
                    className="w-full mt-1 bg-gray-800/50 text-gray-300 p-3 rounded-md border border-gray-700 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition text-sm"
                    value={editedVisualStyle}
                    onChange={(e) => setEditedVisualStyle(e.target.value)}
                    placeholder={t.visualStylePlaceholder}
                />
            </div>
            <div className="flex gap-4 pt-2">
                <button
                    onClick={onGetStorySuggestion}
                    disabled={isSuggesting}
                    className="w-full flex items-center justify-center gap-x-2 bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
                >
                   {t.tryAgainButton}
                </button>
                <button
                    onClick={onAcceptAndGenerate}
                    className="w-full flex items-center justify-center gap-x-2 bg-[#5BEAFF] text-[#0D0D0F] font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                    <SparklesIcon className="w-5 h-5" />
                    {t.acceptAndGenerateButton}
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default InputPanel;