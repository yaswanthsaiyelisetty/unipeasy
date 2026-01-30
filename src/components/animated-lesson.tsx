"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  RefreshCw,
  Settings,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LessonSlide {
  id: number;
  title: string;
  content: string;
  bulletPoints?: string[];
  icon: string;
  bgClass: string;
  animation: 'fade' | 'slide-up' | 'slide-left' | 'zoom' | 'bounce';
}

interface AnimatedLessonProps {
  topic: string;
  explanation: string;
  analogy?: string;
  className?: string;
  autoPlay?: boolean;
}

// Parse content into animated slides
function parseContentToSlides(topic: string, explanation: string, analogy?: string): LessonSlide[] {
  const slides: LessonSlide[] = [];
  
  const bgClasses = [
    'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800',
    'bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700',
    'bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800',
    'bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600',
    'bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-700',
    'bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800',
    'bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700',
    'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700',
  ];

  const animations: ('fade' | 'slide-up' | 'slide-left' | 'zoom' | 'bounce')[] = 
    ['fade', 'slide-up', 'slide-left', 'zoom', 'bounce'];
  
  const icons = ['🎓', '💡', '📚', '🔬', '🧠', '✨', '🎯', '🚀', '💫', '📖', '🔍', '⚡'];

  // Title slide
  slides.push({
    id: 0,
    title: topic,
    content: 'Let\'s explore this topic together!',
    icon: '🎓',
    bgClass: bgClasses[0],
    animation: 'zoom',
  });

  // Clean the explanation text
  const cleanText = explanation
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Split into sections
  const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim().length > 30);
  
  paragraphs.forEach((para, index) => {
    // Check if paragraph has bullet points
    const lines = para.split('\n');
    const bulletPoints = lines
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(bp => bp.length > 0);

    const mainContent = lines
      .filter(line => !line.trim().startsWith('-') && !line.trim().startsWith('•'))
      .join(' ')
      .trim();

    if (mainContent.length > 20 || bulletPoints.length > 0) {
      // Split very long content
      if (mainContent.length > 200) {
        const sentences = mainContent.split(/(?<=[.!?])\s+/);
        for (let i = 0; i < sentences.length; i += 2) {
          const chunk = sentences.slice(i, i + 2).join(' ');
          if (chunk.length > 20) {
            slides.push({
              id: slides.length,
              title: `Key Concept ${slides.length}`,
              content: chunk,
              icon: icons[slides.length % icons.length],
              bgClass: bgClasses[slides.length % bgClasses.length],
              animation: animations[slides.length % animations.length],
            });
          }
        }
      } else {
        slides.push({
          id: slides.length,
          title: index === 0 ? 'Introduction' : `Part ${slides.length}`,
          content: mainContent || 'Key points to remember:',
          bulletPoints: bulletPoints.length > 0 ? bulletPoints.slice(0, 4) : undefined,
          icon: icons[slides.length % icons.length],
          bgClass: bgClasses[slides.length % bgClasses.length],
          animation: animations[slides.length % animations.length],
        });
      }
    }
  });

  // Add analogy slide
  if (analogy) {
    const cleanAnalogy = analogy
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .substring(0, 250);
    
    slides.push({
      id: slides.length,
      title: 'Think of it like this...',
      content: cleanAnalogy,
      icon: '🔗',
      bgClass: 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-600',
      animation: 'bounce',
    });
  }

  // Summary slide
  slides.push({
    id: slides.length,
    title: 'Great Progress!',
    content: `You've learned about ${topic}. Review the key points and practice to master this concept!`,
    icon: '🎉',
    bgClass: 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600',
    animation: 'zoom',
  });

  return slides.slice(0, 15); // Max 15 slides
}

export function AnimatedLesson({ 
  topic, 
  explanation, 
  analogy, 
  className,
  autoPlay = false 
}: AnimatedLessonProps) {
  const slides = useMemo(() => parseContentToSlides(topic, explanation, analogy), [topic, explanation, analogy]);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { speak, stop, isSpeaking } = useTextToSpeech({ rate: playbackSpeed });

  const SLIDE_DURATION = 7000 / playbackSpeed; // Base duration adjusted by speed

  const speakSlideContent = useCallback((slide: LessonSlide) => {
    if (isMuted) return;
    
    let textToSpeak = slide.content;
    if (slide.bulletPoints && slide.bulletPoints.length > 0) {
      textToSpeak += '. ' + slide.bulletPoints.join('. ');
    }
    speak(textToSpeak);
  }, [isMuted, speak]);

  const goToSlide = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(slides.length - 1, index));
    setCurrentSlide(newIndex);
    setProgress(0);
    stop();
    
    if (isPlaying) {
      setTimeout(() => speakSlideContent(slides[newIndex]), 300);
    }
  }, [slides, isPlaying, speakSlideContent, stop]);

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
      speakSlideContent(slides[currentSlide]);
    }
  }, [isPlaying, speakSlideContent, slides, currentSlide, stop]);

  const toggleMute = useCallback(() => {
    if (!isMuted) {
      stop();
    } else if (isPlaying) {
      speakSlideContent(slides[currentSlide]);
    }
    setIsMuted(!isMuted);
  }, [isMuted, isPlaying, speakSlideContent, slides, currentSlide, stop]);

  const restart = useCallback(() => {
    setCurrentSlide(0);
    setProgress(0);
    setIsPlaying(true);
    stop();
    setTimeout(() => speakSlideContent(slides[0]), 300);
  }, [speakSlideContent, slides, stop]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement && containerRef.current) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Auto-advance slides
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
  }, [isPlaying, SLIDE_DURATION, nextSlide]);

  // Hide controls after inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('touchstart', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchstart', handleMouseMove);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Cleanup
  useEffect(() => {
    return () => {
      stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [stop]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        prevSlide();
      } else if (e.key === 'm') {
        toggleMute();
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextSlide, prevSlide, toggleMute, toggleFullscreen]);

  const slide = slides[currentSlide];

  const getAnimationClass = (animation: string) => {
    switch (animation) {
      case 'slide-up':
        return 'animate-in fade-in slide-in-from-bottom-8 duration-700';
      case 'slide-left':
        return 'animate-in fade-in slide-in-from-right-8 duration-700';
      case 'zoom':
        return 'animate-in fade-in zoom-in-95 duration-700';
      case 'bounce':
        return 'animate-in fade-in zoom-in-90 duration-500';
      default:
        return 'animate-in fade-in duration-700';
    }
  };

  return (
    <Card className={cn("overflow-hidden bg-black", className)}>
      <div 
        ref={containerRef}
        className={cn(
          "relative",
          isFullscreen && "fixed inset-0 z-50"
        )}
      >
        {/* Video Content Area */}
        <div 
          className={cn(
            "relative aspect-video overflow-hidden cursor-pointer",
            slide.bgClass,
            isFullscreen && "h-[calc(100%-60px)]"
          )}
          onClick={togglePlay}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0tOCA4aC0ydi00aDJ2NHptMC04aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')]" />
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + i * 0.5}s`,
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div 
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-10 md:p-16 text-center text-white",
              getAnimationClass(slide.animation)
            )}
            key={slide.id}
          >
            {/* Icon */}
            <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 drop-shadow-lg">
              {slide.icon}
            </div>
            
            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-3 sm:mb-4 drop-shadow-lg max-w-3xl">
              {slide.title}
            </h2>
            
            {/* Content */}
            <p className="text-sm sm:text-base md:text-xl text-white/90 max-w-2xl leading-relaxed drop-shadow">
              {slide.content}
            </p>

            {/* Bullet Points */}
            {slide.bulletPoints && slide.bulletPoints.length > 0 && (
              <ul className="mt-4 sm:mt-6 space-y-2 text-left max-w-xl">
                {slide.bulletPoints.map((point, idx) => (
                  <li 
                    key={idx} 
                    className={cn(
                      "flex items-start gap-2 text-sm sm:text-base text-white/90",
                      "animate-in fade-in slide-in-from-left-4",
                    )}
                    style={{ animationDelay: `${300 + idx * 150}ms` }}
                  >
                    <span className="text-white/70 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Slide Counter */}
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-medium">
            {currentSlide + 1} / {slides.length}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-white/80 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div 
          className={cn(
            "flex items-center justify-between gap-2 p-2 sm:p-3 bg-gradient-to-t from-black/90 to-black/70 backdrop-blur-sm transition-opacity duration-300",
            isFullscreen && "h-[60px]",
            !showControls && isPlaying && "opacity-0"
          )}
        >
          {/* Left Controls */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={restart} 
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={prevSlide} 
              disabled={currentSlide === 0}
              className="text-white hover:bg-white/20 disabled:opacity-30 h-8 w-8 sm:h-9 sm:w-9"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={togglePlay}
              className="text-white hover:bg-white/20 h-10 w-10 sm:h-11 sm:w-11"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={nextSlide} 
              disabled={currentSlide === slides.length - 1}
              className="text-white hover:bg-white/20 disabled:opacity-30 h-8 w-8 sm:h-9 sm:w-9"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Timeline Slider */}
          <div className="flex-1 mx-2 sm:mx-4 hidden sm:block">
            <Slider
              value={[(currentSlide / (slides.length - 1)) * 100]}
              onValueChange={([value]) => {
                const newSlide = Math.round((value / 100) * (slides.length - 1));
                if (newSlide !== currentSlide) {
                  goToSlide(newSlide);
                }
              }}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1">
            {/* Speed Control */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20 h-8 px-2 text-xs"
                >
                  {playbackSpeed}x
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[80px]">
                <DropdownMenuLabel className="text-xs">Speed</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <DropdownMenuItem 
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={cn(playbackSpeed === speed && "bg-accent")}
                  >
                    {speed}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMute}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Slide Dots (Mobile) */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 py-2 bg-black">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                index === currentSlide 
                  ? "w-4 bg-white" 
                  : "bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
