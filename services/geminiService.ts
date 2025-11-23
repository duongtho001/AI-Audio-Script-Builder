import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import type { VideoConfig, Scene, ScenePrompt, StorySuggestion } from '../types';
import { Language, translations } from "../translations";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Key Management System ---
let userApiKeys: string[] = [];
let currentKeyIndex = 0;

export const setApiKeys = (keys: string[]) => {
    userApiKeys = keys.filter(k => k.trim() !== '');
    currentKeyIndex = 0;
};

const getApiKey = (): string => {
    if (userApiKeys.length > 0) {
        return userApiKeys[currentKeyIndex];
    }
    return process.env.API_KEY || '';
};

const rotateApiKey = (): boolean => {
    if (userApiKeys.length <= 1) return false;
    currentKeyIndex = (currentKeyIndex + 1) % userApiKeys.length;
    console.log(`Rotating to API Key index: ${currentKeyIndex}`);
    return true;
};

// --- Enhanced Retry Logic with Key Rotation ---
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  initialDelay = 1000,
  context: string
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();

      // Check for Quota limits (429) or Service Unavailable (503)
      const isRateLimit = errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('resource_exhausted');
      
      if (isRateLimit && userApiKeys.length > 1) {
          // If we hit a rate limit and have multiple keys, rotate immediately and retry without delay
          console.warn(`Rate limit hit in ${context}. Rotating API Key...`);
          rotateApiKey();
          // Do not increment 'i' effectively, or just continue loop. 
          // Actually we count this as an attempt, but we don't wait long.
          await sleep(100); 
          continue; 
      }

      if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('unavailable') || isRateLimit) {
        const delay = initialDelay * (2 ** i);
        console.warn(`Attempt ${i + 1}/${retries} failed in ${context}. Retrying in ${delay}ms...`);
        await sleep(delay + Math.random() * 500);
      } else {
        throw error;
      }
    }
  }

  console.error(`All server retries failed in ${context}.`);
  throw lastError;
}

function getErrorMessage(error: unknown, context: string): string {
    console.error(`Error in ${context}:`, error);
    if (error instanceof Error) {
        return error.message;
    }
    return `An unknown error occurred in ${context}.`;
}

const storySuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        concept: { type: Type.STRING },
        visualStyle: { type: Type.STRING },
        refinedScript: { type: Type.STRING, description: "The user's script slightly optimized/formatted for segmentation." }
    },
    required: ["concept", "visualStyle", "refinedScript"],
};

export const generateStorySuggestionFromText = async (
    scriptText: string,
    audioStyle: string,
    language: Language
): Promise<StorySuggestion> => {
    const model = 'gemini-2.5-flash';
    
    const userPrompt = `
        Analyze the following script/text.
        Script: "${scriptText}"
        
        Audio/Mood Context: "${audioStyle}"

        Tasks:
        1. Identify the core Story Concept.
        2. Suggest a Visual Style that fits the script and audio mood.
        3. Refine the script if necessary to make it flow better for a video narration, but keep the original meaning intact.
    `;
    
    const systemInstruction = `You are a creative director. Output a JSON object with 'concept', 'visualStyle', and 'refinedScript'. The 'refinedScript' should be the full text ready for splitting.`;

    const apiCall = async (): Promise<StorySuggestion> => {
        // Use Dynamic Key
        const currentKey = getApiKey();
        const ai = new GoogleGenAI({ apiKey: currentKey });
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: userPrompt }] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: storySuggestionSchema,
                temperature: 0.9,
            },
        });
        
        const rawText = response.text.trim();
        const parsedJson = JSON.parse(rawText);
        return parsedJson as StorySuggestion;
    };

    try {
        return await withRetry(apiCall, 5, 1000, 'generateStorySuggestionFromText');
    } catch (error) {
        throw new Error(getErrorMessage(error, 'generateStorySuggestionFromText'));
    }
};


const scenePromptSchema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING },
    style: { type: Type.STRING },
    camera: { type: Type.STRING },
    lighting: { type: Type.STRING },
    environment: { type: Type.STRING },
    elements: { type: Type.ARRAY, items: { type: Type.STRING } },
    motion: { type: Type.STRING },
    dialogue: { type: Type.STRING },
    audioDescription: { type: Type.STRING },
    ending: { type: Type.STRING },
    text: { type: Type.STRING },
    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    aspect_ratio: { type: Type.STRING },
    duration_seconds: { type: Type.INTEGER },
    fps: { type: Type.INTEGER },
    quality: { type: Type.STRING },
    negative_prompts: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "description", "style", "camera", "lighting", "environment", "elements",
    "motion", "dialogue", "audioDescription", "ending", "text", "keywords", "aspect_ratio",
    "duration_seconds", "fps", "quality", "negative_prompts"
  ],
};

// New Function: Split Script into Scenes
const sceneListSchema = {
    type: Type.ARRAY,
    items: scenePromptSchema
};

export const generateScenesFromScript = async (
    fullScript: string,
    config: VideoConfig,
    visualStyle: string
): Promise<ScenePrompt[]> => {
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `You are a Screenwriter and Director.
    Your goal is to take a full script and split it into distinct 8-second scenes.
    
    Rules:
    1. **Segmentation (CRITICAL):** Split the text into chunks that take **EXACTLY 8 SECONDS** to read aloud at a moderate pace.
       - **For Vietnamese/English/Latin languages:** Maximum 16-20 words per scene.
       - **For Japanese/Chinese/Korean:** Maximum 30-35 characters per scene.
       - **General Rule:** It is better to be slightly shorter than 8s than longer.
    2. **Consistency:** Apply the Visual Style: "${visualStyle}".
    3. **Audio/Dialogue:**
       - The 'dialogue' field MUST contain the spoken text for that 8s segment.
       - **LANGUAGE:** The 'dialogue' MUST be in **${config.outputLanguage}**.
       - **Special Narration Rule:** If the audio style includes "Review", "Travel", "Vlog", or "Documentary", treat the original script text for the scene as a *visual brief*. Your 'dialogue' output should be a creative, descriptive narration that brings that visual to life, like a professional voiceover. Do NOT simply repeat the script text.
       - **Visual/Scenic Scenes:** If a scene has no original dialogue (and the special rule above does not apply), generate a poetic, descriptive, or documentary-style voiceover in **${config.outputLanguage}** that matches the mood. Do NOT leave it empty.
    4. **Output:** A JSON Array of Scene Objects.
    `;

    const userPrompt = `
    Full Script:
    """
    ${fullScript}
    """
    
    Audio Vibe: ${config.audioStyle}
    Voice Tone: ${config.voiceTone}
    Target Language: ${config.outputLanguage}
    
    Convert this entire script into a list of 8-second scene prompts. 
    Ensure the 'dialogue' is in ${config.outputLanguage} and strictly fits the 8-second limit.
    `;

    const apiCall = async () => {
        const currentKey = getApiKey();
        const ai = new GoogleGenAI({ apiKey: currentKey });
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: userPrompt }] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: sceneListSchema,
                temperature: 0.7,
            },
        });
        
        return JSON.parse(response.text) as ScenePrompt[];
    };

    try {
         return await withRetry(apiCall, 5, 2000, 'generateScenesFromScript');
    } catch (error) {
        throw new Error(getErrorMessage(error, 'generateScenesFromScript'));
    }
};

// --- NEW FUNCTION: Contextual Refinement for Manual Scenes ---
const refinedSceneListSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            originalInput: { type: Type.STRING },
            refinedNarration: { type: Type.STRING, description: "The coherent spoken text, strictly timed for 8 seconds." },
            visualDescription: { type: Type.STRING, description: "Detailed visual prompt based on input." }
        },
        required: ["originalInput", "refinedNarration", "visualDescription"]
    }
};

export const refineScriptsFromRawScenes = async (
    rawScenes: string[],
    audioStyle: string,
    voiceTone: string,
    visualStyle: string,
    outputLanguage: string
): Promise<{ originalInput: string; refinedNarration: string; visualDescription: string }[]> => {
    const model = 'gemini-2.5-flash';

    const systemInstruction = `You are an expert Storyteller and Screenwriter.
    
    **GOAL:** 
    1. Read the provided story context to understand the narrative arc.
    2. Rewrite the narration/dialogue for the SPECIFIC BATCH of scenes requested.
    
    **CRITICAL CONSTRAINT (TIMING - 8 SECONDS):**
    Each scene's narration MUST take **roughly 6 to 8 seconds** to read aloud.
    - **Vietnamese / English / European:** Strictly **UNDER 18 WORDS**. (Ideal: 12-16 words).
    - **Japanese / Chinese / Korean:** Strictly **UNDER 35 CHARACTERS**. (Ideal: 25-30 characters).
    - Do NOT write long, complex sentences. Break them down.
    
    **CRITICAL CONSTRAINT (Language):** 
    The 'refinedNarration' MUST be written in **${outputLanguage}**.
    
    **SPECIAL NARRATION RULE:** 
    If the overall mood/style is for a "Review", "Travel", "Vlog", or "Documentary", your 'refinedNarration' must be a creative voiceover that describes the scene from the 'originalInput'. Do not just rephrase the input; **create an engaging narration** that brings the visuals to life.
    
    **Handling Visual-Only Inputs:** 
    If a user input is just a visual description and has no dialogue (and the special rule above does not apply), YOU MUST WRITE a suitable voiceover/narration in **${outputLanguage}** that matches the mood. Do not output silence.
    
    **Voice/Tone:** ${voiceTone}
    **Mood:** ${audioStyle}
    **Visual Style:** ${visualStyle}
    `;

    const BATCH_SIZE = 5;
    const allRefinedScenes: { originalInput: string; refinedNarration: string; visualDescription: string }[] = [];
    
    // Prepare full context string once
    const fullStoryContext = rawScenes.map((s, i) => `Scene ${i + 1}: ${s}`).join('\n');

    // Process in batches
    for (let i = 0; i < rawScenes.length; i += BATCH_SIZE) {
        const batch = rawScenes.slice(i, i + BATCH_SIZE);
        const batchStartIndex = i + 1;
        const batchEndIndex = i + batch.length;

        const userPrompt = `
        **FULL STORY CONTEXT (For reference only - do not output all of this):**
        """
        ${fullStoryContext}
        """

        **CURRENT TASK:**
        Process ONLY the following batch of scenes (Scene ${batchStartIndex} to ${batchEndIndex}).
        
        **Raw Inputs for this batch:**
        ${batch.map((s, idx) => `Scene ${batchStartIndex + idx}: ${s}`).join('\n')}

        Return a JSON array with exactly ${batch.length} items, corresponding to these specific scenes.
        `;

        const apiCall = async () => {
            const currentKey = getApiKey();
            const ai = new GoogleGenAI({ apiKey: currentKey });
            const response = await ai.models.generateContent({
                model,
                contents: { parts: [{ text: userPrompt }] },
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: refinedSceneListSchema,
                    temperature: 0.7,
                },
            });
            
            return JSON.parse(response.text) as { originalInput: string; refinedNarration: string; visualDescription: string }[];
        };

        try {
            // Add a small delay between batches to be gentle on limits
            if (i > 0) await sleep(1000);
            
            const batchResults = await withRetry(apiCall, 5, 2000, `refineScriptsFromRawScenes batch ${Math.ceil((i + 1)/BATCH_SIZE)}`);
            allRefinedScenes.push(...batchResults);
        } catch (error) {
            console.error(`Error processing batch starting at index ${i}`, error);
            // Fallback: If a batch fails, create dummy entries so we don't lose the whole project
            const fallbackBatch = batch.map(s => ({
                originalInput: s,
                refinedNarration: s.substring(0, 100), // Simple truncation if AI fails
                visualDescription: s
            }));
            allRefinedScenes.push(...fallbackBatch);
        }
    }

    return allRefinedScenes;
};

// New Function: Generate Audio for a Scene
export const generateSceneAudio = async (
    text: string,
    voiceName: string,
    audioStyle: string,
    language: string
): Promise<string> => {
    const model = "gemini-2.5-flash-preview-tts"; // Using TTS model
    
    const prompt = `
    Please read the following text in ${language} language with a ${audioStyle} tone.
    Text: "${text}"
    `;

    const apiCall = async () => {
        const currentKey = getApiKey();
        const ai = new GoogleGenAI({ apiKey: currentKey });
        const response = await ai.models.generateContent({
          model,
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voiceName },
                },
            },
          },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned from API");
        }
        // Return raw base64 string. The client must decode this PCM data.
        return base64Audio;
    };

    try {
        return await withRetry(apiCall, 5, 2000, 'generateSceneAudio');
    } catch (error) {
        console.error(error);
        throw new Error(getErrorMessage(error, 'generateSceneAudio'));
    }
};