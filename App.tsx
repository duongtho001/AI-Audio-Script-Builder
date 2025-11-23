import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import SceneTimeline from './components/SceneTimeline';
import type { Scene, VideoConfig, ScenePrompt, StorySuggestion } from './types';
import { generateStorySuggestionFromText, generateScenesFromScript, generateSceneAudio, refineScriptsFromRawScenes, setApiKeys } from './services/geminiService';
import { translations, type Language } from './translations';
import GuideModal from './components/GuideModal';
import ApiKeyModal from './components/ApiKeyModal';
import ConfirmationModal from './components/ConfirmationModal';
import ExclamationTriangleIcon from './components/icons/ExclamationTriangleIcon';
import CodeBracketIcon from './components/icons/CodeBracketIcon';
import MusicalNoteIcon from './components/icons/MusicalNoteIcon';

declare var JSZip: any;
declare var lamejs: any;

const SCENE_DURATION = 8; // 8 seconds per scene
const SAMPLE_RATE = 24000;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to concatenate AudioBuffers
const concatenateAudioBuffers = (buffers: AudioBuffer[], context: AudioContext): AudioBuffer => {
    const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
    const result = context.createBuffer(buffers[0].numberOfChannels, totalLength, buffers[0].sampleRate);
    
    let offset = 0;
    for (const buf of buffers) {
        for (let i = 0; i < buf.numberOfChannels; i++) {
            result.getChannelData(i).set(buf.getChannelData(i), offset);
        }
        offset += buf.length;
    }
    return result;
};

// Helper: Base64 string to Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

// Helper: Decode raw PCM to AudioBuffer (Manual decoding)
// Gemini TTS returns raw PCM 24kHz 16-bit mono
const pcmToAudioBuffer = (
    data: Uint8Array, 
    context: AudioContext
): AudioBuffer => {
    const sampleRate = SAMPLE_RATE;
    const numChannels = 1;
    
    // Ensure data length is even for Int16Array
    let safeData = data;
    if (data.byteLength % 2 !== 0) {
        safeData = new Uint8Array(data.byteLength + 1);
        safeData.set(data);
        // Pad with a zero byte at the end
    }

    // Explicitly create Int16Array from the buffer using byteOffset and length
    // This prevents issues if the Uint8Array is a view on a larger buffer
    const dataInt16 = new Int16Array(safeData.buffer, safeData.byteOffset, safeData.byteLength / 2);
    
    const frameCount = dataInt16.length / numChannels;
    const buffer = context.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Convert Int16 to Float32 (-1.0 to 1.0)
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
};

// Helper: AudioBuffer to MP3 Blob using lamejs
const audioBufferToMp3Blob = (buffer: AudioBuffer): Blob => {
    // Check if lamejs is available
    if (typeof lamejs === 'undefined') {
        console.error("lamejs library not loaded. Falling back to WAV.");
        return audioBufferToWavBlob(buffer); // Fallback
    }

    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
    const mp3Data = [];

    // Get samples for left and right channels
    // We need to convert Float32Array (0.0 to 1.0) to Int16Array (-32768 to 32767)
    const left = new Int16Array(buffer.length);
    const right = channels > 1 ? new Int16Array(buffer.length) : undefined;
    
    const leftFloat = buffer.getChannelData(0);
    const rightFloat = channels > 1 ? buffer.getChannelData(1) : undefined;

    for (let i = 0; i < buffer.length; i++) {
        // Left
        let s = Math.max(-1, Math.min(1, leftFloat[i]));
        left[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        
        // Right
        if (right && rightFloat) {
            s = Math.max(-1, Math.min(1, rightFloat[i]));
            right[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
    }

    // Encode
    const sampleBlockSize = 1152;
    for (let i = 0; i < left.length; i += sampleBlockSize) {
        const leftChunk = left.subarray(i, i + sampleBlockSize);
        let mp3buf;
        if (channels === 2 && right) {
            const rightChunk = right.subarray(i, i + sampleBlockSize);
            mp3buf = mp3Encoder.encodeBuffer(leftChunk, rightChunk);
        } else {
            mp3buf = mp3Encoder.encodeBuffer(leftChunk);
        }
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }

    // Finish
    const endBuf = mp3Encoder.flush();
    if (endBuf.length > 0) {
        mp3Data.push(endBuf);
    }

    return new Blob(mp3Data, { type: 'audio/mp3' });
};


// Helper: AudioBuffer to WAV Blob (Fallback & for UI Playback)
const audioBufferToWavBlob = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [];
  let i, sample;
  let offset = 0;
  let pos = 0;

  // Write WAV container
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // chunk size
  setUint16(1); // format = 1
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset])); 
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
  function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }
  
  return new Blob([view], { type: "audio/wav" });
};

// Helper: Format time for SRT (HH:MM:SS,mmm)
const formatTimeSRT = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const millis = Math.floor((timeInSeconds % 1) * 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('vi');
  const t = translations[language];

  const [projectName, setProjectName] = useState<string>(t.untitledProject);
  const [scriptText, setScriptText] = useState<string>('');
  
  // New State for Input Mode and Manual Prompts (Text Area)
  const [inputMode, setInputMode] = useState<'script' | 'manual'>('script');
  const [manualScriptText, setManualScriptText] = useState<string>('');

  const [videoConfig, setVideoConfig] = useState<VideoConfig>({ 
    duration: 0, 
    style: null,
    voiceTone: 'Puck',
    audioStyle: 'Cinematic, balanced',
    format: 'trailer',
    outputLanguage: 'vi', // Default to Vietnamese
  });
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [storySuggestion, setStorySuggestion] = useState<StorySuggestion | null>(null);
  const [editedVisualStyle, setEditedVisualStyle] = useState<string>('');
  const [mergedAudioUrl, setMergedAudioUrl] = useState<string | null>(null);
  
  // API Key Management
  const [apiKeys, setApiKeysState] = useState<string[]>([]);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuggestingStory, setIsSuggestingStory] = useState<boolean>(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState<boolean>(false);
  const [isGuideVisible, setIsGuideVisible] = useState<boolean>(false);
  const [isNewProjectConfirmVisible, setIsNewProjectConfirmVisible] = useState<boolean>(false);
  const [isResumeModalVisible, setIsResumeModalVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isGenerationComplete, setIsGenerationComplete] = useState<boolean>(false);
  const [generationStatusMessage, setGenerationStatusMessage] = useState<string>('');

  // Load API keys on mount
  useEffect(() => {
    const storedKeys = localStorage.getItem('user_api_keys');
    if (storedKeys) {
        try {
            const parsedKeys = JSON.parse(storedKeys);
            if (Array.isArray(parsedKeys)) {
                setApiKeysState(parsedKeys);
                setApiKeys(parsedKeys); // Pass to service
            }
        } catch (e) {
            console.error("Failed to parse stored API keys", e);
        }
    }
  }, []);

  const handleSaveApiKeys = (keys: string[]) => {
      setApiKeysState(keys);
      setApiKeys(keys); // Update service
      localStorage.setItem('user_api_keys', JSON.stringify(keys));
  };

  const resetState = () => {
    setProjectName(t.untitledProject);
    setScriptText('');
    setManualScriptText('');
    setScenes([]);
    setStorySuggestion(null);
    setEditedVisualStyle('');
    setMergedAudioUrl(null);
    setVideoConfig({ 
        duration: 0, 
        style: null,
        voiceTone: 'Puck',
        audioStyle: 'Cinematic, balanced',
        format: 'trailer',
        outputLanguage: 'vi',
    });
    setError(null);
    setIsLoading(false);
    setIsSuggestingStory(false);
    setIsBatchGenerating(false);
    setIsGenerationComplete(false);
    setGenerationProgress({ current: 0, total: 0 });
    setGenerationStatusMessage('');
  };

  const handleNewProjectRequest = () => {
    if (scriptText || scenes.length > 0 || manualScriptText.length > 0) {
        setIsNewProjectConfirmVisible(true);
    } else {
        resetState();
    }
  };

  const handleConfirmNewProject = () => {
      resetState();
      setIsNewProjectConfirmVisible(false);
  };
  
  const handleGetStorySuggestion = async () => {
    if (!scriptText) return;
    setIsSuggestingStory(true);
    setError(null);
    setStorySuggestion(null);

    try {
        const suggestion = await generateStorySuggestionFromText(
            scriptText, 
            videoConfig.audioStyle, 
            language
        );
        
        setStorySuggestion(suggestion);
        setEditedVisualStyle(suggestion.visualStyle);
        setVideoConfig(prev => ({...prev, style: suggestion.visualStyle}));
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get story suggestion.");
    } finally {
        setIsSuggestingStory(false);
    }
  }

  // Shared Audio Generation Logic
  const generateAudioForScenes = async (initialScenes: Scene[]) => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffers: AudioBuffer[] = [];

        for (let i = 0; i < initialScenes.length; i++) {
            const scene = initialScenes[i];
            setGenerationStatusMessage(t.generatingAudioForScene(scene.scene_id, initialScenes.length));
            
            // Generate Audio
            try {
                // Use dialogue if available, otherwise description
                const textToSpeak = scene.prompt.dialogue || scene.prompt.description;
                if (!textToSpeak) throw new Error("No text to speak");

                const rawBase64Audio = await generateSceneAudio(
                    textToSpeak, 
                    videoConfig.voiceTone, 
                    videoConfig.audioStyle,
                    videoConfig.outputLanguage // Pass the language here
                );
                
                // Decode Raw PCM
                const pcmBytes = base64ToUint8Array(rawBase64Audio);
                const rawBuffer = pcmToAudioBuffer(pcmBytes, audioContext);

                // PAD or TRIM Audio to exactly SCENE_DURATION (8s)
                // We strictly enforce the length for synchronization.
                // 18 words limit usually keeps it under 8s, so we mostly pad silence.
                const targetSamples = SCENE_DURATION * SAMPLE_RATE;
                let finalBuffer = rawBuffer;

                if (rawBuffer.length < targetSamples) {
                    // PAD with silence
                    finalBuffer = audioContext.createBuffer(1, targetSamples, SAMPLE_RATE);
                    finalBuffer.getChannelData(0).set(rawBuffer.getChannelData(0));
                    // The rest is already zeros (silence)
                } 
                // If it's longer, we keep it as is (no cutting speech), even though it desyncs slightly. 
                // The word count limit (18 words) is the primary guard against this.

                // Create WAV Blob URL for playback UI using the PADDED/FINAL buffer
                // This ensures the downloaded individual file is also 8s compliant if needed,
                // or at least consistent with the merged audio.
                const wavBlob = audioBufferToWavBlob(finalBuffer);
                const audioUrl = URL.createObjectURL(wavBlob);
                
                // Update Scene with Audio URL
                setScenes(prev => prev.map(s => s.scene_id === scene.scene_id ? { ...s, audioUrl, isGeneratingAudio: false } : s));
                
                // Add buffer to list for merging
                audioBuffers.push(finalBuffer);

            } catch (e) {
                console.error(`Failed audio for scene ${scene.scene_id}`, e);
                setScenes(prev => prev.map(s => s.scene_id === scene.scene_id ? { ...s, isGeneratingAudio: false } : s));
                
                // Add an empty 8s buffer to maintain sync even if generation fails
                const silentBuffer = audioContext.createBuffer(1, SCENE_DURATION * SAMPLE_RATE, SAMPLE_RATE);
                audioBuffers.push(silentBuffer);
            }

            setGenerationProgress({ current: i + 1, total: initialScenes.length });
            await sleep(1100); // Rate limiting
        }

        // Merge Audio
        if (audioBuffers.length > 0) {
            setGenerationStatusMessage("Merging audio tracks to MP3...");
            const mergedBuffer = concatenateAudioBuffers(audioBuffers, audioContext);
            
            // Convert to MP3
            const mergedBlob = audioBufferToMp3Blob(mergedBuffer);
            const mergedUrl = URL.createObjectURL(mergedBlob);
            setMergedAudioUrl(mergedUrl);
        }
  }

  const handleAcceptAndGenerateStoryboard = async () => {
    if (!storySuggestion) return;
    
    setVideoConfig(prev => ({ ...prev, style: editedVisualStyle }));
    setIsLoading(true);
    setError(null);
    setScenes([]);
    setMergedAudioUrl(null);
    setIsGenerationComplete(false);
    setGenerationProgress({ current: 0, total: 0 });
    setGenerationStatusMessage(t.processingScript);

    try {
        // 1. Generate Scene Structure (Batch via AI)
        setGenerationStatusMessage("Generating scene breakdown...");
        const generatedPrompts = await generateScenesFromScript(
            storySuggestion.refinedScript || scriptText,
            videoConfig,
            editedVisualStyle
        );

        setGenerationProgress({ current: 0, total: generatedPrompts.length });
        
        // 2. Initialize Scenes
        const initialScenes: Scene[] = generatedPrompts.map((prompt, index) => ({
            scene_id: index + 1,
            time: `${String(Math.floor(index * SCENE_DURATION / 60)).padStart(2, '0')}:${String((index * SCENE_DURATION) % 60).padStart(2, '0')}`,
            prompt: {
                ...prompt,
                duration_seconds: SCENE_DURATION
            },
            isGeneratingAudio: true 
        }));

        setScenes(initialScenes);

        // 3. Generate Audio & Merge
        await generateAudioForScenes(initialScenes);

        setIsGenerationComplete(true);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
    } finally {
        setIsLoading(false);
        setGenerationStatusMessage('');
    }
  };

  const handleGenerateFromManualPrompts = async () => {
      if (manualScriptText.trim().length === 0) return;

      setIsLoading(true);
      setError(null);
      setScenes([]);
      setMergedAudioUrl(null);
      setIsGenerationComplete(false);
      setGenerationStatusMessage(t.processingManualScenes);

      try {
          // 1. Parse the bulk text (Input Collection)
          let rawScenes: string[] = [];
          const numberedMatches = manualScriptText.match(/^\d+[\.)]\s.*$/gm);
          if (numberedMatches && numberedMatches.length > 0) {
              rawScenes = numberedMatches.map(line => line.replace(/^\d+[\.)]\s/, '').trim());
          } else {
              rawScenes = manualScriptText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          }
          
          if (rawScenes.length === 0) {
              throw new Error("No valid scenes found in input.");
          }

          // 2. CONTEXTUAL ANALYSIS & REFINEMENT (AI Step)
          // This step takes the raw list and generates cohesive narration under 29 words.
          setGenerationStatusMessage("AI is reading the story and creating cohesive narration (under 18 words)...");
          const refinedScenesData = await refineScriptsFromRawScenes(
              rawScenes,
              videoConfig.audioStyle,
              videoConfig.voiceTone,
              editedVisualStyle || 'Cinematic',
              videoConfig.outputLanguage
          );

          setGenerationProgress({ current: 0, total: refinedScenesData.length });

          // 3. Create Scenes based on Refined Data
          const initialScenes: Scene[] = refinedScenesData.map((data, index) => ({
              scene_id: index + 1,
              time: `${String(Math.floor(index * SCENE_DURATION / 60)).padStart(2, '0')}:${String((index * SCENE_DURATION) % 60).padStart(2, '0')}`,
              prompt: {
                  description: data.visualDescription,
                  dialogue: data.refinedNarration, // Use refined, cohesive narration in correct language
                  style: editedVisualStyle || 'Cinematic',
                  camera: 'Medium shot',
                  lighting: 'Natural',
                  environment: 'Detailed',
                  elements: [],
                  motion: 'Smooth',
                  audioDescription: videoConfig.audioStyle,
                  ending: '',
                  text: data.originalInput,
                  keywords: [],
                  aspect_ratio: '16:9',
                  duration_seconds: SCENE_DURATION,
                  fps: 24,
                  quality: 'High',
                  negative_prompts: []
              },
              isGeneratingAudio: true
          }));

          setScenes(initialScenes);

          // 4. Generate Audio & Merge
          await generateAudioForScenes(initialScenes);

          setIsGenerationComplete(true);

      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          setError(errorMessage);
      } finally {
          setIsLoading(false);
          setGenerationStatusMessage('');
      }
  };

  const createSrtContent = () => {
      return scenes.map((scene, index) => {
          const startTime = index * SCENE_DURATION;
          const endTime = (index + 1) * SCENE_DURATION;
          // Use the fixed formatTimeSRT
          return `${index + 1}\n${formatTimeSRT(startTime)} --> ${formatTimeSRT(endTime)}\n${scene.prompt.dialogue || scene.prompt.description}\n`;
      }).join('\n');
  };

  const handleDownloadSrt = () => {
      const srtContent = createSrtContent();
      const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${projectName.replace(/ /g, '_')}.srt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleDownloadZip = async () => {
    const scenesWithAudio = scenes.filter(s => s.audioUrl);
    if (scenesWithAudio.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
        const zip = new JSZip();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Add numbered audio files
        for (const scene of scenesWithAudio) {
            // Fetch the WAV blob
            const response = await fetch(scene.audioUrl!);
            const arrayBuffer = await response.arrayBuffer();
            
            // Manual decode again for robustness
            // Note: Since scene.audioUrl comes from audioBufferToWavBlob, it has a valid WAV header.
            // So audioContext.decodeAudioData works here.
            // BUT if decodeAudioData is flaky, we should use pcmToAudioBuffer if we stored raw PCM. 
            // Since we didn't store raw PCM in state, we rely on the browser to decode the WAV we just made.
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const mp3Blob = audioBufferToMp3Blob(audioBuffer);

            const sceneNumber = String(scene.scene_id).padStart(3, '0');
            zip.file(`audio/scene_${sceneNumber}.mp3`, mp3Blob);
        }
        
        // Add Prompts text
        const promptContent = scenes.map(s => `${t.sceneLabel} ${s.scene_id} (Narration): ${s.prompt.dialogue}\nVisual: ${s.prompt.description}`).join('\n\n');
        zip.file(`prompts.txt`, promptContent);
        
        // Add SRT
        const srtContent = createSrtContent();
        zip.file(`subtitles.srt`, srtContent);

        // Add Merged Audio if exists (already MP3 blob if created via audioBufferToMp3Blob)
        if (mergedAudioUrl) {
             const response = await fetch(mergedAudioUrl);
             const blob = await response.blob();
             zip.file(`full_story_audio.mp3`, blob);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `${projectName.replace(/ /g, '_')}_audio_pack.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (err) {
        console.error(err);
        setError("Failed to create zip file.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownloadPrompts = () => {
    if (scenes.length === 0) return;
    const sortedScenes = [...scenes].sort((a, b) => a.scene_id - b.scene_id);
    const content = sortedScenes.map(s => {
      return `${t.sceneLabel} ${s.scene_id}: ${JSON.stringify(s.prompt)}`;
    }).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName.replace(/ /g, '_')}_prompts.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdatePrompt = (sceneId: number, newPrompt: ScenePrompt) => {
    setScenes(prevScenes =>
      prevScenes.map(s => (s.scene_id === sceneId ? { ...s, prompt: newPrompt } : s))
    );
  };

  return (
    <div className="bg-[#0D0D0F] min-h-screen text-gray-200 font-sans">
      <div className="bg-black/30 text-center py-2 px-4 text-xs text-gray-400 flex items-center justify-center gap-x-4 border-b border-gray-800">
        <div className="flex items-center gap-x-2">
          <CodeBracketIcon className="w-4 h-4 text-cyan-400" />
          <span>App của Thọ - 0934415387</span>
        </div>
        <div className="h-4 border-l border-gray-700"></div>
        <a href="https://zalo.me/g/sgkzgk550" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">
          Tham Gia Nhóm zalo tạo app
        </a>
      </div>
      <GuideModal isOpen={isGuideVisible} onClose={() => setIsGuideVisible(false)} t={t} />
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
        onSave={handleSaveApiKeys}
        currentKeys={apiKeys}
        t={t}
      />
      <ConfirmationModal
        isOpen={isNewProjectConfirmVisible}
        onClose={() => setIsNewProjectConfirmVisible(false)}
        onConfirm={handleConfirmNewProject}
        title={t.newProjectConfirmationTitle}
        message={t.newProjectConfirmationMessage}
        confirmText={t.confirmButton}
        cancelText={t.cancelButton}
        icon={<ExclamationTriangleIcon className="w-16 h-16 text-yellow-400" />}
      />
      <ConfirmationModal
        isOpen={isResumeModalVisible}
        onClose={() => setIsResumeModalVisible(false)}
        onConfirm={() => setIsResumeModalVisible(false)}
        title={t.resumeGenerationTitle}
        message={error || ''}
        confirmText={t.resumeButton}
        cancelText={t.finishForNowButton}
        icon={<ExclamationTriangleIcon className="w-16 h-16 text-yellow-400" />}
      />
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        t={t} 
        onOpenGuide={() => setIsGuideVisible(true)}
        onOpenApiKey={() => setIsApiKeyModalOpen(true)}
        onNewProject={handleNewProjectRequest}
      />
      <main className="container mx-auto p-4 md:p-8">
        {error && !isResumeModalVisible && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-200">&times;</button>
          </div>
        )}
        
        {mergedAudioUrl && (
            <div className="mb-6 p-4 bg-[#1E1E22] rounded-lg border border-cyan-700 flex items-center justify-between shadow-lg shadow-cyan-900/20 animate-fade-in">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-900/50 rounded-full">
                        <MusicalNoteIcon className="w-6 h-6 text-[#5BEAFF]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-100">{t.fullAudioTitle}</h3>
                        <p className="text-sm text-gray-400">{t.fullAudioDescription}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <audio controls src={mergedAudioUrl} className="h-8 w-64" />
                    <a 
                        href={mergedAudioUrl} 
                        download="full_story_audio.mp3"
                        className="text-sm text-[#5BEAFF] hover:underline font-semibold"
                    >
                        {t.downloadAudioButton}
                    </a>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <InputPanel
            scriptText={scriptText}
            setScriptText={setScriptText}
            inputMode={inputMode}
            setInputMode={setInputMode}
            manualScriptText={manualScriptText}
            setManualScriptText={setManualScriptText}
            videoConfig={videoConfig}
            setVideoConfig={setVideoConfig}
            storySuggestion={storySuggestion}
            editedVisualStyle={editedVisualStyle}
            setEditedVisualStyle={setEditedVisualStyle}
            onGetStorySuggestion={handleGetStorySuggestion}
            onAcceptAndGenerate={handleAcceptAndGenerateStoryboard}
            onGenerateFromManual={handleGenerateFromManualPrompts}
            isLoading={isLoading || isBatchGenerating}
            isSuggesting={isSuggestingStory}
            t={t}
            language={language}
          />
          <SceneTimeline
            scenes={scenes}
            onUpdatePrompt={handleUpdatePrompt}
            isLoading={isLoading}
            isBatchGenerating={isBatchGenerating}
            isGenerationComplete={isGenerationComplete}
            generationProgress={generationProgress}
            generationStatusMessage={generationStatusMessage}
            onDownloadPrompts={handleDownloadPrompts}
            onDownloadZip={handleDownloadZip}
            onDownloadSrt={handleDownloadSrt}
            t={t}
          />
        </div>
      </main>
    </div>
  );
};

export default App;