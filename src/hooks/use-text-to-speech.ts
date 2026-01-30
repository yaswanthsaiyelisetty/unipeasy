"use client";

import { useState, useCallback, useEffect, useRef } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'te';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  voicePrefix: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', voicePrefix: 'en' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', voicePrefix: 'hi' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', voicePrefix: 'te' },
];

export interface TextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
  language?: SupportedLanguage;
}

export interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  setVoice: (voice: SpeechSynthesisVoice | null) => void;
  rate: number;
  setRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  downloadAudio: (text: string, filename?: string) => Promise<void>;
  isDownloading: boolean;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  availableLanguages: LanguageOption[];
  isTranslating: boolean;
  translatedText: string | null;
}

export function useTextToSpeech(options: TextToSpeechOptions = {}): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(options.voice || null);
  const [rate, setRate] = useState(options.rate || 1);
  const [pitch, setPitch] = useState(options.pitch || 1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>(options.language || 'en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const translationCacheRef = useRef<Map<string, string>>(new Map());

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Set default voice based on selected language
      if (availableVoices.length > 0) {
        const langVoice = availableVoices.find(
          v => v.lang.startsWith(language) && v.name.includes('Google')
        ) || availableVoices.find(v => v.lang.startsWith(language)) 
          || availableVoices.find(v => v.lang.startsWith('en'))
          || availableVoices[0];
        setCurrentVoice(langVoice);
      }
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported, language]);

  // Update voice when language changes
  useEffect(() => {
    if (!isSupported || voices.length === 0) return;
    
    const langVoice = voices.find(
      v => v.lang.startsWith(language) && v.name.includes('Google')
    ) || voices.find(v => v.lang.startsWith(language))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
    
    setCurrentVoice(langVoice);
  }, [language, voices, isSupported]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const cleanTextForSpeech = (text: string): string => {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/`{1,3}[^`]*`{1,3}/g, '') // Code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/[-*+]\s/g, '') // List markers
      .replace(/^\d+\.\s/gm, '') // Numbered lists
      .replace(/>\s/g, '') // Blockquotes
      .replace(/\n{2,}/g, '. ') // Multiple newlines to pause
      .replace(/\n/g, ' ') // Single newlines
      .replace(/\s{2,}/g, ' ') // Multiple spaces
      .trim();
  };

  // Translate text to selected language
  const translateText = useCallback(async (text: string): Promise<string> => {
    if (language === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = `${language}:${text.substring(0, 100)}`;
    const cached = translationCacheRef.current.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage: language }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      const translated = data.translatedText || text;
      
      // Cache the result
      translationCacheRef.current.set(cacheKey, translated);
      
      return translated;
    } catch (error) {
      console.warn('Translation error:', error);
      return text; // Return original on error
    }
  }, [language]);

  const speak = useCallback(async (text: string) => {
    if (!isSupported) {
      console.warn('Text-to-speech is not supported in this browser');
      return;
    }

    try {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const cleanedText = cleanTextForSpeech(text);
      
      if (!cleanedText) {
        console.warn('No text to speak');
        return;
      }

      // Translate text if not English
      setIsTranslating(true);
      let textToSpeak = cleanedText;
      
      if (language !== 'en') {
        textToSpeak = await translateText(cleanedText);
        setTranslatedText(textToSpeak);
      } else {
        setTranslatedText(null);
      }
      setIsTranslating(false);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = options.volume || 1;
      
      if (currentVoice) {
        utterance.voice = currentVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        // Only log actual errors, not interruptions
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn('Speech synthesis issue:', event.error);
        }
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Speech synthesis failed:', error);
      setIsSpeaking(false);
      setIsPaused(false);
      setIsTranslating(false);
    }
  }, [isSupported, currentVoice, rate, pitch, options.volume, language, translateText]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignore errors on stop
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    try {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } catch (e) {
      // Ignore errors on pause
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    try {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } catch (e) {
      // Ignore errors on resume
    }
  }, [isSupported, isPaused]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setCurrentVoice(voice);
  }, []);

  // Download audio using server-side TTS API
  const downloadAudio = useCallback(async (text: string, filename = 'audio') => {
    setIsDownloading(true);
    
    try {
      // First translate the text if not English
      let textToConvert = cleanTextForSpeech(text);
      
      if (language !== 'en') {
        setIsTranslating(true);
        textToConvert = await translateText(textToConvert);
        setIsTranslating(false);
      }
      
      // Call our server-side API to generate the audio with language
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToConvert, language }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      // Get the audio blob
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Empty audio file received');
      }

      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Audio download failed:', error);
      alert('Failed to download audio. Please try again or use the Listen button to hear the content.');
    } finally {
      setIsDownloading(false);
      setIsTranslating(false);
    }
  }, [language, translateText]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    currentVoice,
    setVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    downloadAudio,
    isDownloading,
    language,
    setLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
    isTranslating,
    translatedText,
  };
}
