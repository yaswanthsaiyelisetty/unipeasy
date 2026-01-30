
"use client";

import { notFound, useParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { skillsData } from '@/lib/skills-data';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal, Lightbulb, Loader2, ArrowRight, ArrowLeft, Trophy, CheckCircle, Sparkles, Target } from 'lucide-react';
import { provideAiSkillFeedback, type ProvideAiSkillFeedbackOutput } from '@/ai/flows/provide-ai-skill-feedback';
import { useAuth } from '@/context/auth-context';
import { trackSkillLevelCompleted } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export default function SkillLevelPage() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const levelStr = Array.isArray(params.level) ? params.level[0] : params.level;
  const { user } = useAuth();

  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<ProvideAiSkillFeedbackOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { track, level, allLevels } = useMemo(() => {
    if (!slug || !levelStr) return { track: null, level: null, allLevels: [] };
    const trackData = skillsData[slug];
    if (!trackData) return { track: null, level: null, allLevels: [] };

    const levelNumber = parseInt(levelStr, 10);
    const allLevels = trackData.journey.flatMap(tier => tier.levels);
    const levelData = allLevels.find(l => l.level === levelNumber);
    return { track: trackData, level: levelData, allLevels };
  }, [slug, levelStr]);

  useEffect(() => {
    if (slug && level?.level) {
        try {
            localStorage.setItem('lastVisitedSkillLevel', JSON.stringify({ slug, level: level.level }));
        } catch (error) {
            console.warn('Could not save last visited level to localStorage', error);
        }
    }
}, [slug, level]);


  useEffect(() => {
    if (slug && levelStr) {
      try {
        const completed = localStorage.getItem(`skill-${slug}-level-${levelStr}`) === 'completed';
        setIsCompleted(completed);
      } catch (error) {
        console.warn('Could not read progress from localStorage', error);
      }
    }
  }, [slug, levelStr]);


  useEffect(() => {
    if (isCompleted && slug && levelStr && feedback?.isCorrect) {
      try {
        localStorage.setItem(`skill-${slug}-level-${levelStr}`, 'completed');
        
        // Track skill completion in Firestore
        if (user?.uid && track) {
          trackSkillLevelCompleted(
            user.uid,
            slug,
            track.title,
            track.branch,
            parseInt(levelStr, 10),
            allLevels.length
          ).catch(console.error);
        }
      } catch (error) {
        console.warn('Could not save progress to localStorage', error)
      }
    }
  }, [isCompleted, slug, levelStr, feedback, user?.uid, track, allLevels.length]);

  
  if (!track || !level) {
    return notFound();
  }

  const handleFeedbackSubmit = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const response = await provideAiSkillFeedback({
        skillName: track.title,
        level: level.level,
        challenge: level.title,
        challengeDescription: level.example,
        userInput: userInput,
      });
      setFeedback(response);
      if (response.isCorrect) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Failed to get AI feedback", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextLevel = () => {
    if (!slug) return;
    const nextLevel = allLevels.find(l => l.level === level.level + 1);
    if (nextLevel) {
      router.push(`/skills/${slug}/${nextLevel.level}`);
      setUserInput('');
      setFeedback(null);
      setIsCompleted(false);
      setLoading(false);
    } else {
      router.push(`/skills/${slug}`);
    }
  };

  return (
    <div className={cn(
      "space-y-4 sm:space-y-6 md:space-y-8 transition-all duration-500",
      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      {/* Header Section */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        <Button variant="outline" size="icon" asChild className="shrink-0 mt-1 sm:mt-0">
          <Link href={`/skills/${slug}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">Level {level.level}</Badge>
            <Badge variant="outline" className="bg-primary/5 text-xs">{track.branch}</Badge>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{track.title}</h1>
          <p className="text-sm text-muted-foreground truncate">{level.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Challenge Card */}
        <Card className={cn(
          "border shadow-sm overflow-hidden transition-all duration-500",
          mounted && "animate-in fade-in slide-in-from-left-4"
        )}>
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <div className="p-1.5 rounded bg-secondary">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <span className="truncate">Your Challenge</span>
                  </CardTitle>
                  <Badge variant="outline" className="text-xs shrink-0">{level.challengeType}</Badge>
              </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              {/* Highlighted Challenge Question */}
              <div className="relative p-3 sm:p-4 rounded-lg bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20">
                <div className="absolute -top-3 left-3 sm:left-4">
                  <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0 text-xs">
                    <Target className="w-3 h-3 mr-1" />
                    Challenge
                  </Badge>
                </div>
                <p className="text-sm sm:text-base font-medium mt-2 leading-relaxed">{level.example}</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-b-lg" />
              </div>

              <Alert className="bg-muted/50">
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle className="font-medium text-sm">Instructions</AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                      Complete the challenge described above. Write your answer in the text area below.
                  </AlertDescription>
              </Alert>
            
              <div className="space-y-3">
                  <Textarea 
                      placeholder="Enter your response here..."
                      className="min-h-[120px] sm:h-48 resize-none text-sm"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={loading}
                  />
                  <Button 
                    onClick={handleFeedbackSubmit} 
                    disabled={loading || !userInput.trim()} 
                    className="w-full"
                    size="default"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <span className="text-sm">Submit for AI Feedback</span>
                  </Button>
              </div>
          </CardContent>
        </Card>

        {/* Feedback Card */}
        <Card className="border shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-1.5 rounded bg-secondary">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    AI Feedback
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
                        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">Analyzing your submission...</p>
                    </div>
                )}

                {feedback && (
                    <div className="space-y-3 sm:space-y-4">
                        <Alert className={feedback.isCorrect ? 'border-foreground/20 bg-muted/50' : ''}>
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                feedback.isCorrect ? 'bg-foreground text-background' : 'bg-secondary'
                              }`}>
                                {feedback.isCorrect ? <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <AlertTitle className="font-medium text-sm">
                                  {feedback.isCorrect ? "Excellent Work!" : "Keep Going!"}
                                </AlertTitle>
                                <AlertDescription className="mt-1 text-xs sm:text-sm break-words">
                                    {feedback.feedback}
                                </AlertDescription>
                              </div>
                            </div>
                        </Alert>
                        
                        <Alert className="bg-muted/50">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <AlertTitle className="font-medium text-sm">Suggestion</AlertTitle>
                                <AlertDescription className="mt-1 text-xs sm:text-sm break-words">
                                    {feedback.suggestion}
                                </AlertDescription>
                              </div>
                            </div>
                        </Alert>

                        {feedback.isCorrect && (
                            <Button onClick={handleNextLevel} className="w-full">
                                <span className="text-sm">Continue to Next Level</span>
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
                
                {!loading && !feedback && (
                    <div className="text-center py-8 sm:py-12 border border-dashed rounded-lg">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-secondary flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-sm">Awaiting Your Submission</p>
                        <p className="mt-1 text-xs text-muted-foreground px-4">AI feedback will appear here after you submit.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
