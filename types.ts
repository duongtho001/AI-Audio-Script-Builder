import { ReactNode } from "react";

export interface ScenePrompt {
  description: string;
  style: string;
  camera: string;
  lighting: string;
  environment: string;
  elements: string[];
  motion: string;
  dialogue: string; // The dialogue or voiceover text for the scene
  audioDescription: string; // Description of sound effects
  ending: string;
  text: string;
  keywords: string[];
  aspect_ratio: string;
  duration_seconds: number;
  fps: number;
  quality: string;
  negative_prompts: string[];
}


export interface Scene {
  scene_id: number;
  time: string;
  prompt: ScenePrompt;
  audioUrl?: string; // URL for the generated audio segment
  isGeneratingAudio?: boolean;
}

export interface VideoConfig {
  duration: number; // Estimated duration based on text length
  style: string | null;
  voiceTone: string; // Key for the selected voice
  audioStyle: string; // Description of the audio vibe
  format: 'trailer' | 'short' | 'longform';
  outputLanguage: string; // Target language for audio/script
}

export interface StorySuggestion {
  concept: string;
  visualStyle: string;
  refinedScript?: string; // The script optimized for 8s chunks
}

export interface Project {
  id: string;
  name: string;
  storyIdea: string;
  generatedScript: string;
  videoConfig: VideoConfig;
  scenes: Scene[];
  lastModified: number;
}