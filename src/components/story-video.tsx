"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  RefreshCw 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';

interface StorySlide {
  id: number;
  title: string;
  content: string;
  icon?: string;
  bgGradient?: string;
}

interface StoryVideoProps {
  topic: string;
  explanation: string;
  analogy?: string;
  className?: string;
}

// Parse explanation into story slides
function parseExplanationToSlides(topic: string, explanation: string, analogy?: string): StorySlide[] {
  const slides: StorySlide[] = [];
  
  // Introduction slide
  slides.push({
    id: 0,
    title: 'Let\'s Learn About',
    content: topic,
    icon: '🎓',
    bgGradient: 'from-blue-500/20 to-purple-500/20',
  });

  // Clean and split the explanation
  const cleanText = explanation
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[-*+]\s/g, '• ');

  // Split into paragraphs or sentences
  const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim().length > 20);
  
  const gradients = [
    'from-green-500/20 to-emerald-500/20',
    'from-orange-500/20 to-amber-500/20',
    'from-pink-500/20 to-rose-500/20',
    'from-cyan-500/20 to-teal-500/20',
    'from-violet-500/20 to-purple-500/20',
  ];

  const icons = ['💡', '📚', '🔍', '✨', '🧠', '📖', '🎯', '💫'];

  paragraphs.forEach((para, index) => {
    // Split long paragraphs into smaller chunks
    const sentences = para.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
    
    if (sentences.length > 3) {
      // Split into multiple slides
      for (let i = 0; i < sentences.length; i += 2) {
        const chunk = sentences.slice(i, i + 2).join(' ');
        slides.push({
          id: slides.length,
          title: index === 0 && i === 0 ? 'The Basics' : `Part ${slides.length}`,
          content: chunk,
          icon: icons[slides.length % icons.length],
          bgGradient: gradients[slides.length % gradients.length],
        });
      }
    } else {
      slides.push({
        id: slides.length,
        title: `Key Point ${slides.length}`,
        content: para,
        icon: icons[slides.length % icons.length],
        bgGradient: gradients[slides.length % gradients.length],
      });
    }
  });

  // Add analogy slide if available
  if (analogy) {
    const cleanAnalogy = analogy
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .substring(0, 300);
    
    slides.push({
      id: slides.length,
      title: 'Think of it like this...',
      content: cleanAnalogy,
      icon: '🔗',
      bgGradient: 'from-yellow-500/20 to-orange-500/20',
    });
  }

  // Conclusion slide
  slides.push({
    id: slides.length,
    title: 'Great Job!',
    content: `You've learned about ${topic}! Keep practicing to master this concept.`,
    icon: '🎉',
    bgGradient: 'from-emerald-500/20 to-green-500/20',
  });

  return slides.slice(0, 12); // Limit to 12 slides max
}

export function StoryVideo({ topic, explanation, analogy, className }: StoryVideoProps) {
  const [slides] = useState<StorySlide[]>(() => parseExplanationToSlides(topic, explanation, analogy));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { speak, stop, isSpeaking } = useTextToSpeech();

  const SLIDE_DURATION = 6000; // 6 seconds per slide

  const goToSlide = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(slides.length - 1, index));
    setCurrentSlide(newIndex);
    setProgress(0);
    
    if (!isMuted && isPlaying) {
      stop();
      setTimeout(() => {
        speak(slides[newIndex].content);
      }, 300);
    }
  }, [slides, isMuted, isPlaying, speak, stop]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      setIsPlaying(false);
      stop();
    }
  }, [currentSlide, slides.length, goToSlide, stop]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      stop();
    } else {
      setIsPlaying(true);
      if (!isMuted) {
        speak(slides[currentSlide].content);
      }
    }
  }, [isPlaying, isMuted, speak, stop, slides, currentSlide]);

  const toggleMute = useCallback(() => {
    if (!isMuted) {
      stop();
    } else if (isPlaying) {
      speak(slides[currentSlide].content);
    }
    setIsMuted(!isMuted);
  }, [isMuted, isPlaying, speak, stop, slides, currentSlide]);

  const restart = useCallback(() => {
    setCurrentSlide(0);
    setProgress(0);
    setIsPlaying(true);
    if (!isMuted) {
      stop();
      setTimeout(() => speak(slides[0].content), 300);
    }
  }, [isMuted, speak, stop, slides]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Auto-advance slides when playing
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            nextSlide();
            return 0;
          }
          return prev + (100 / (SLIDE_DURATION / 100));
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, nextSlide]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stop]);

  const slide = slides[currentSlide];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div 
        ref={containerRef}
        className={cn(
          "relative bg-background",
          isFullscreen && "fixed inset-0 z-50"
        )}
      >
        {/* Video Area */}
        <div className={cn(
          "relative aspect-video overflow-hidden",
          isFullscreen && "h-[calc(100%-80px)]"
        )}>
          {/* Background gradient */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br transition-all duration-1000",
            slide.bgGradient
          )} />
          
          {/* Content */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 text-center"
            key={slide.id}
          >
            {/* Icon with animation */}
            <div className="text-4xl sm:text-5xl md:text-6xl mb-4 animate-in fade-in zoom-in duration-500">
              {slide.icon}
            </div>
            
            {/* Title */}
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {slide.title}
            </h3>
            
            {/* Content */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              {slide.content}
            </p>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentSlide 
                    ? "w-6 bg-foreground" 
                    : "bg-foreground/30 hover:bg-foreground/50"
                )}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className={cn(
          "flex items-center justify-between gap-2 p-3 sm:p-4 border-t bg-muted/30",
          isFullscreen && "h-[80px]"
        )}>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={restart} title="Restart">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={prevSlide} disabled={currentSlide === 0} title="Previous">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="default" size="icon" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={nextSlide} disabled={currentSlide === slides.length - 1} title="Next">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{currentSlide + 1} / {slides.length}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} title="Fullscreen">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
