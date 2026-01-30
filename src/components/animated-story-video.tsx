"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Loader2,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';

interface StoryScene {
  id: number;
  narration: string;
  visual: 'intro' | 'explain' | 'analogy' | 'example' | 'summary' | 'quiz';
  title: string;
  keyPoints?: string[];
  character?: 'teacher' | 'student' | 'scientist' | 'explorer';
  animation?: 'fadeIn' | 'slideUp' | 'zoomIn' | 'bounceIn' | 'typewriter';
  mood?: 'curious' | 'excited' | 'thinking' | 'celebrating';
}

interface AnimatedStoryVideoProps {
  topic: string;
  explanation: string;
  analogy?: string;
  className?: string;
  onDownloadVideo?: () => void;
}

// Character SVG components
const TeacherCharacter = ({ mood = 'excited', className }: { mood?: string; className?: string }) => (
  <svg viewBox="0 0 200 300" className={cn("w-32 h-48", className)}>
    {/* Body */}
    <ellipse cx="100" cy="250" rx="45" ry="40" fill="#4F46E5" />
    {/* Head */}
    <circle cx="100" cy="120" r="50" fill="#FBBF24" />
    {/* Eyes */}
    <circle cx="80" cy="110" r="8" fill="#1F2937" />
    <circle cx="120" cy="110" r="8" fill="#1F2937" />
    <circle cx="82" cy="108" r="3" fill="white" />
    <circle cx="122" cy="108" r="3" fill="white" />
    {/* Mouth based on mood */}
    {mood === 'excited' && (
      <path d="M75 140 Q100 165 125 140" stroke="#1F2937" strokeWidth="4" fill="none" />
    )}
    {mood === 'thinking' && (
      <ellipse cx="100" cy="145" rx="8" ry="5" fill="#1F2937" />
    )}
    {mood === 'curious' && (
      <path d="M80 140 Q100 150 120 140" stroke="#1F2937" strokeWidth="3" fill="none" />
    )}
    {mood === 'celebrating' && (
      <path d="M70 135 Q100 170 130 135" stroke="#1F2937" strokeWidth="4" fill="none" />
    )}
    {/* Glasses */}
    <circle cx="80" cy="110" r="15" stroke="#6B7280" strokeWidth="3" fill="none" />
    <circle cx="120" cy="110" r="15" stroke="#6B7280" strokeWidth="3" fill="none" />
    <line x1="95" y1="110" x2="105" y2="110" stroke="#6B7280" strokeWidth="3" />
    {/* Arms */}
    <ellipse cx="55" cy="220" rx="12" ry="35" fill="#FBBF24" className="animate-bounce" style={{ animationDelay: '0.2s' }} />
    <ellipse cx="145" cy="220" rx="12" ry="35" fill="#FBBF24" className="animate-bounce" style={{ animationDelay: '0.4s' }} />
    {/* Pointer stick */}
    <line x1="155" y1="200" x2="180" y2="150" stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const StudentCharacter = ({ mood = 'curious', className }: { mood?: string; className?: string }) => (
  <svg viewBox="0 0 200 300" className={cn("w-28 h-44", className)}>
    {/* Body */}
    <ellipse cx="100" cy="250" rx="40" ry="35" fill="#10B981" />
    {/* Head */}
    <circle cx="100" cy="125" r="45" fill="#FCD34D" />
    {/* Hair */}
    <path d="M55 100 Q70 60 100 70 Q130 60 145 100" fill="#8B4513" />
    {/* Eyes */}
    <circle cx="82" cy="115" r="7" fill="#1F2937" />
    <circle cx="118" cy="115" r="7" fill="#1F2937" />
    <circle cx="84" cy="113" r="2" fill="white" />
    <circle cx="120" cy="113" r="2" fill="white" />
    {/* Mouth */}
    {mood === 'curious' && (
      <ellipse cx="100" cy="145" rx="6" ry="4" fill="#1F2937" />
    )}
    {mood === 'excited' && (
      <path d="M85 140 Q100 155 115 140" stroke="#1F2937" strokeWidth="3" fill="none" />
    )}
    {/* Backpack strap */}
    <line x1="70" y1="180" x2="70" y2="230" stroke="#F59E0B" strokeWidth="6" />
    <line x1="130" y1="180" x2="130" y2="230" stroke="#F59E0B" strokeWidth="6" />
  </svg>
);

const ScientistCharacter = ({ mood = 'thinking', className }: { mood?: string; className?: string }) => (
  <svg viewBox="0 0 200 300" className={cn("w-32 h-48", className)}>
    {/* Lab coat */}
    <path d="M50 180 L50 280 L150 280 L150 180 Q100 200 50 180" fill="white" stroke="#E5E7EB" strokeWidth="2" />
    {/* Head */}
    <circle cx="100" cy="110" r="50" fill="#FBBF24" />
    {/* Wild hair */}
    <path d="M50 80 Q40 40 70 60 Q60 30 90 50 Q100 20 110 50 Q140 30 130 60 Q160 40 150 80" fill="#9CA3AF" />
    {/* Eyes */}
    <circle cx="80" cy="105" r="10" fill="white" stroke="#1F2937" strokeWidth="2" />
    <circle cx="120" cy="105" r="10" fill="white" stroke="#1F2937" strokeWidth="2" />
    <circle cx="82" cy="107" r="4" fill="#1F2937" />
    <circle cx="122" cy="107" r="4" fill="#1F2937" />
    {/* Beaker */}
    <path d="M145 220 L165 220 L160 260 Q155 275 150 260 L145 220" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />
    <circle cx="152" cy="245" r="3" fill="#FBBF24" className="animate-ping" />
    <circle cx="158" cy="250" r="2" fill="#10B981" className="animate-ping" style={{ animationDelay: '0.3s' }} />
  </svg>
);

// Floating particles animation
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-white/20 animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
        }}
      />
    ))}
  </div>
);

// Parse explanation into story scenes
function parseToStoryScenes(topic: string, explanation: string, analogy?: string): StoryScene[] {
  const scenes: StoryScene[] = [];
  
  // Scene 1: Introduction
  scenes.push({
    id: 1,
    title: `Welcome to ${topic}!`,
    narration: `Hey there! Today we're going to explore something fascinating: ${topic}. Get ready for an exciting learning adventure!`,
    visual: 'intro',
    character: 'teacher',
    mood: 'excited',
    animation: 'bounceIn',
  });

  // Clean and parse the explanation
  const cleanText = explanation
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim().length > 30);
  
  // Extract key points from paragraphs
  paragraphs.slice(0, 4).forEach((para, index) => {
    const sentences = para.split(/(?<=[.!?])\s+/).filter(s => s.length > 20);
    const keyPoints = sentences.slice(0, 3).map(s => s.trim());
    
    scenes.push({
      id: scenes.length + 1,
      title: index === 0 ? 'The Big Picture' : `Key Concept ${index}`,
      narration: para.substring(0, 250) + (para.length > 250 ? '...' : ''),
      visual: 'explain',
      character: index % 2 === 0 ? 'scientist' : 'teacher',
      mood: 'thinking',
      animation: 'slideUp',
      keyPoints,
    });
  });

  // Analogy scene
  if (analogy) {
    const cleanAnalogy = analogy
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .substring(0, 300);
    
    scenes.push({
      id: scenes.length + 1,
      title: 'Think of it this way...',
      narration: cleanAnalogy,
      visual: 'analogy',
      character: 'explorer',
      mood: 'curious',
      animation: 'zoomIn',
    });
  }

  // Summary scene
  scenes.push({
    id: scenes.length + 1,
    title: 'Great Progress!',
    narration: `Awesome job! You've learned about ${topic}. Remember the key points and keep practicing to master this concept!`,
    visual: 'summary',
    character: 'teacher',
    mood: 'celebrating',
    animation: 'bounceIn',
  });

  return scenes;
}

export function AnimatedStoryVideo({ topic, explanation, analogy, className }: AnimatedStoryVideoProps) {
  const [scenes] = useState<StoryScene[]>(() => parseToStoryScenes(topic, explanation, analogy));
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoAreaRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const { speak, stop, isSpeaking, downloadAudio, isDownloading } = useTextToSpeech({ rate: 0.95 });

  const SCENE_DURATION = 8000; // 8 seconds per scene

  const goToScene = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(scenes.length - 1, index));
    setCurrentScene(newIndex);
    setProgress(0);
    
    if (!isMuted && isPlaying) {
      stop();
      setTimeout(() => speak(scenes[newIndex].narration), 500);
    }
  }, [scenes, isMuted, isPlaying, speak, stop]);

  const nextScene = useCallback(() => {
    if (currentScene < scenes.length - 1) {
      goToScene(currentScene + 1);
    } else {
      setIsPlaying(false);
      stop();
    }
  }, [currentScene, scenes.length, goToScene, stop]);

  const prevScene = useCallback(() => {
    goToScene(currentScene - 1);
  }, [currentScene, goToScene]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      stop();
    } else {
      setIsPlaying(true);
      if (!isMuted) {
        speak(scenes[currentScene].narration);
      }
    }
  }, [isPlaying, isMuted, speak, stop, scenes, currentScene]);

  const toggleMute = useCallback(() => {
    if (!isMuted) {
      stop();
    } else if (isPlaying) {
      speak(scenes[currentScene].narration);
    }
    setIsMuted(!isMuted);
  }, [isMuted, isPlaying, speak, stop, scenes, currentScene]);

  const restart = useCallback(() => {
    setCurrentScene(0);
    setProgress(0);
    setIsPlaying(true);
    stop();
    setTimeout(() => {
      if (!isMuted) speak(scenes[0].narration);
    }, 500);
  }, [isMuted, speak, stop, scenes]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Download all narrations as audio
  const handleDownloadAudio = useCallback(async () => {
    const allNarrations = scenes.map(s => s.narration).join('. ');
    const safeTopic = topic.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    await downloadAudio(allNarrations, `${safeTopic}-audio`);
  }, [scenes, topic, downloadAudio]);

  // Download video by recording the canvas
  const handleDownloadVideo = useCallback(async () => {
    if (!videoAreaRef.current) return;
    
    setIsRecording(true);
    setRecordingProgress(0);
    recordedChunksRef.current = [];
    
    try {
      // Create a canvas stream from the video area
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 1280;
      canvas.height = 720;
      
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeTopic = topic.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        a.download = `${safeTopic}-animated-lesson.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };
      
      mediaRecorder.start(100);
      
      // Record each scene
      for (let i = 0; i < scenes.length; i++) {
        setRecordingProgress(Math.round((i / scenes.length) * 100));
        
        // Create frame content for this scene
        const scene = scenes[i];
        const gradient = getGradientColors(scene.visual);
        
        // Draw frame
        const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grd.addColorStop(0, gradient[0]);
        grd.addColorStop(1, gradient[1]);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(scene.title, canvas.width / 2, 150);
        
        // Add narration text (wrapped)
        ctx.font = '28px Arial';
        const words = scene.narration.split(' ');
        let line = '';
        let y = 300;
        const maxWidth = canvas.width - 200;
        
        for (const word of words) {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, canvas.width / 2, y);
            line = word + ' ';
            y += 40;
            if (y > 600) break;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, canvas.width / 2, y);
        
        // Add scene indicator
        ctx.font = '24px Arial';
        ctx.fillText(`Scene ${i + 1} of ${scenes.length}`, canvas.width / 2, canvas.height - 50);
        
        // Wait for scene duration
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
      
      setRecordingProgress(100);
      mediaRecorder.stop();
      
    } catch (error) {
      console.error('Recording failed:', error);
      setIsRecording(false);
      
      // Fallback: Download as HTML presentation
      downloadAsHTML();
    }
  }, [scenes, topic]);

  // Fallback: Download as HTML presentation
  const downloadAsHTML = useCallback(() => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${topic} - Animated Lesson</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .scene { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; }
    .scene h2 { font-size: 48px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); margin-bottom: 30px; }
    .scene p { font-size: 24px; color: white; max-width: 800px; text-align: center; line-height: 1.6; }
    .intro { background: linear-gradient(135deg, #4F46E5, #EC4899); }
    .explain { background: linear-gradient(135deg, #2563EB, #14B8A6); }
    .analogy { background: linear-gradient(135deg, #F97316, #FBBF24); }
    .summary { background: linear-gradient(135deg, #10B981, #06B6D4); }
    .nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; }
    .nav button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
  </style>
</head>
<body>
  ${scenes.map((scene, i) => `
    <div class="scene ${scene.visual}" id="scene${i}">
      <h2>${scene.visual === 'intro' ? '🎓 ' : scene.visual === 'summary' ? '🎉 ' : ''}${scene.title}</h2>
      <p>${scene.narration}</p>
      <p style="margin-top: 40px; font-size: 18px; opacity: 0.8;">Scene ${i + 1} of ${scenes.length}</p>
    </div>
  `).join('')}
  <div class="nav">
    <button onclick="prevScene()">← Previous</button>
    <button onclick="nextScene()">Next →</button>
  </div>
  <script>
    let current = 0;
    const total = ${scenes.length};
    function showScene(n) {
      document.getElementById('scene' + n).scrollIntoView({ behavior: 'smooth' });
    }
    function nextScene() { if (current < total - 1) showScene(++current); }
    function prevScene() { if (current > 0) showScene(--current); }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') nextScene();
      if (e.key === 'ArrowLeft') prevScene();
    });
  </script>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTopic = topic.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    a.download = `${safeTopic}-presentation.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [scenes, topic]);

  // Helper function for gradient colors
  const getGradientColors = (visual: string): [string, string] => {
    switch (visual) {
      case 'intro': return ['#4F46E5', '#EC4899'];
      case 'explain': return ['#2563EB', '#14B8A6'];
      case 'analogy': return ['#F97316', '#FBBF24'];
      case 'summary': return ['#10B981', '#06B6D4'];
      default: return ['#374151', '#111827'];
    }
  };

  // Auto-advance scenes
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            nextScene();
            return 0;
          }
          return prev + (100 / (SCENE_DURATION / 100));
        });
      }, 100);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, nextScene]);

  // Cleanup
  useEffect(() => {
    return () => {
      stop();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [stop]);

  const scene = scenes[currentScene];

  // Background gradients based on visual type
  const getBackground = (visual: string) => {
    switch (visual) {
      case 'intro': return 'from-indigo-600 via-purple-600 to-pink-500';
      case 'explain': return 'from-blue-600 via-cyan-500 to-teal-400';
      case 'analogy': return 'from-orange-500 via-amber-500 to-yellow-400';
      case 'example': return 'from-green-500 via-emerald-500 to-teal-400';
      case 'summary': return 'from-green-500 via-emerald-400 to-cyan-400';
      default: return 'from-gray-700 to-gray-900';
    }
  };

  // Get character component
  const renderCharacter = () => {
    const mood = scene.mood || 'excited';
    switch (scene.character) {
      case 'teacher':
        return <TeacherCharacter mood={mood} className="drop-shadow-2xl animate-in fade-in zoom-in duration-700" />;
      case 'student':
        return <StudentCharacter mood={mood} className="drop-shadow-2xl animate-in fade-in zoom-in duration-700" />;
      case 'scientist':
        return <ScientistCharacter mood={mood} className="drop-shadow-2xl animate-in fade-in zoom-in duration-700" />;
      default:
        return <TeacherCharacter mood={mood} className="drop-shadow-2xl animate-in fade-in zoom-in duration-700" />;
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
        {/* Video Area */}
        <div 
          ref={videoAreaRef}
          className={cn(
          "relative aspect-video overflow-hidden",
          isFullscreen && "h-[calc(100%-80px)]"
        )}>
          {/* Animated Background */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br transition-all duration-1000",
            getBackground(scene.visual)
          )}>
            <FloatingParticles />
            
            {/* Animated shapes */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
            <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="absolute top-1/3 right-10 w-16 h-16 bg-white/10 rotate-45 animate-spin" style={{ animationDuration: '10s' }} />
          </div>

          {/* Main Content */}
          <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 max-w-5xl" key={scene.id}>
              
              {/* Character */}
              <div className="flex-shrink-0">
                {renderCharacter()}
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                {/* Title */}
                <h2 className={cn(
                  "text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg",
                  scene.animation === 'bounceIn' && "animate-in fade-in zoom-in duration-500",
                  scene.animation === 'slideUp' && "animate-in fade-in slide-in-from-bottom-8 duration-500",
                  scene.animation === 'zoomIn' && "animate-in fade-in zoom-in-50 duration-500",
                )}>
                  {scene.visual === 'intro' && '🎓 '}
                  {scene.visual === 'summary' && '🎉 '}
                  {scene.visual === 'analogy' && '💡 '}
                  {scene.title}
                </h2>

                {/* Narration text - animated typewriter style */}
                <div className="relative">
                  <p className={cn(
                    "text-base sm:text-lg md:text-xl text-white/90 leading-relaxed drop-shadow",
                    "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
                  )}>
                    {scene.narration}
                  </p>
                </div>

                {/* Key Points */}
                {scene.keyPoints && scene.keyPoints.length > 0 && (
                  <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                    {scene.keyPoints.map((point, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-2 text-white/80 text-sm sm:text-base"
                        style={{ animationDelay: `${600 + idx * 200}ms` }}
                      >
                        <span className="text-yellow-300 mt-1">✦</span>
                        <span className="line-clamp-2">{point}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scene Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {scenes.map((_, index) => (
              <button
                key={index}
                onClick={() => goToScene(index)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  index === currentScene 
                    ? "w-8 h-2 bg-white" 
                    : "w-2 h-2 bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                <p>Preparing your animated lesson...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={cn(
          "flex items-center justify-between gap-2 p-3 sm:p-4 bg-gray-900",
          isFullscreen && "h-[80px]"
        )}>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={restart} className="text-white hover:bg-white/10">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={prevScene} disabled={currentScene === 0} className="text-white hover:bg-white/10 disabled:opacity-30">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={togglePlay} className="bg-white text-black hover:bg-white/90">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={nextScene} disabled={currentScene === scenes.length - 1} className="text-white hover:bg-white/10 disabled:opacity-30">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-white text-sm">
            <span className="hidden sm:inline">Scene {currentScene + 1} of {scenes.length}</span>
            {isRecording && (
              <span className="text-yellow-400 animate-pulse">Recording {recordingProgress}%</span>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Download Audio Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDownloadAudio}
              disabled={isDownloading}
              className="text-white hover:bg-white/10"
              title="Download Audio"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            
            {/* Download Video Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDownloadVideo}
              disabled={isRecording}
              className="text-white hover:bg-white/10"
              title="Download Video"
            >
              {isRecording ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/10">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/10">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
