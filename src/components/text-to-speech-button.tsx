"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, VolumeX, Pause, Play, Settings2, Download, Loader2, Languages } from 'lucide-react';
import { useTextToSpeech, SupportedLanguage } from '@/hooks/use-text-to-speech';
import { cn } from '@/lib/utils';

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  showSettings?: boolean;
  showDownload?: boolean;
  audioFilename?: string;
}

export function TextToSpeechButton({
  text,
  className,
  size = 'sm',
  variant = 'outline',
  showSettings = true,
  showDownload = true,
  audioFilename = 'explanation-audio',
}: TextToSpeechButtonProps) {
  const {
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
    availableLanguages,
    isTranslating,
  } = useTextToSpeech();

  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!isSupported) {
    return null;
  }

  const handlePlayPause = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(text);
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleDownloadAudio = async () => {
    await downloadAudio(text, audioFilename);
  };

  // Get voices filtered by current language
  const filteredVoices = voices.filter(v => v.lang.startsWith(language));

  // Get current language label
  const currentLangLabel = availableLanguages.find(l => l.code === language)?.nativeName || 'English';

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant={variant}
        size={size}
        onClick={handlePlayPause}
        disabled={isTranslating}
        className={cn(
          "transition-all",
          isSpeaking && "bg-primary text-primary-foreground"
        )}
        title={isTranslating ? "Translating..." : isSpeaking ? (isPaused ? "Resume" : "Pause") : `Listen in ${currentLangLabel}`}
      >
        {isTranslating ? (
          <>
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            Translating...
          </>
        ) : isSpeaking ? (
          isPaused ? (
            <>
              <Play className="h-4 w-4 mr-1.5" />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4 mr-1.5" />
              Pause
            </>
          )
        ) : (
          <>
            <Volume2 className="h-4 w-4 mr-1.5" />
            {language !== 'en' ? currentLangLabel : 'Listen'}
          </>
        )}
      </Button>

      {isSpeaking && (
        <Button
          variant="ghost"
          size={size}
          onClick={handleStop}
          title="Stop"
        >
          <VolumeX className="h-4 w-4" />
        </Button>
      )}

      {showDownload && (
        <Button
          variant="ghost"
          size={size}
          onClick={handleDownloadAudio}
          disabled={isDownloading}
          title="Download Audio"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      )}

      {showSettings && (
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              {/* Language Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Language
                </label>
                <Select
                  value={language}
                  onValueChange={(value) => setLanguage(value as SupportedLanguage)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.nativeName} ({lang.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Voice</label>
                <Select
                  value={currentVoice?.name || ''}
                  onValueChange={(name) => {
                    const voice = voices.find(v => v.name === name);
                    setVoice(voice || null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredVoices.length > 0 ? (
                      filteredVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name.replace(/Microsoft |Google /, '')}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="default" disabled>
                        No voices available for this language
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Speed</label>
                  <span className="text-xs text-muted-foreground">{rate.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[rate]}
                  onValueChange={([value]) => setRate(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Pitch</label>
                  <span className="text-xs text-muted-foreground">{pitch.toFixed(1)}</span>
                </div>
                <Slider
                  value={[pitch]}
                  onValueChange={([value]) => setPitch(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
