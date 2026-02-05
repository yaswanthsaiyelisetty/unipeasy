"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import {
  generateSimpleExplanation,
  type GenerateSimpleExplanationOutput,
} from "@/ai/flows/generate-simple-explanation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, BookText, Compass, Waypoints, HelpCircle, Save, Search, History, X, Sparkles, Play, Settings2 } from "lucide-react";
import { Quiz } from "./quiz";
import { generateEvenSimplerExplanation } from "@/ai/flows/generate-even-simpler-explanation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useMemoryPalace } from "@/context/memory-palace-context";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { trackTopicLearned } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import { TextToSpeechButton } from "@/components/text-to-speech-button";
import { UserInterestsDialog } from "@/components/user-interests-dialog";
import { AnimatedStoryVideo } from "@/components/animated-story-video";
import { useUserInterests } from "@/context/user-interests-context";


const learnSchema = z.object({
  topic: z.string().min(3, "Please enter a topic."),
});

type LearnFormValues = z.infer<typeof learnSchema>;

const SEARCH_HISTORY_KEY = 'learnSearchHistory';
const MAX_HISTORY_ITEMS = 10;

interface SearchHistoryItem {
  topic: string;
  timestamp: number;
}

export function LearnForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateSimpleExplanationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simplerExplanation, setSimplerExplanation] = useState<string | null>(null);
  const [isGeneratingSimpler, setIsGeneratingSimpler] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showInterestsDialog, setShowInterestsDialog] = useState(false);
  const [showStoryVideo, setShowStoryVideo] = useState(false);

  const { addMemoryItem } = useMemoryPalace();
  const { toast } = useToast();
  const { user } = useAuth();
  const { interests, hasSetPreferences } = useUserInterests();

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load search history', e);
    }
  }, []);

  const addToSearchHistory = (topic: string) => {
    const newItem: SearchHistoryItem = { topic, timestamp: Date.now() };
    const filtered = searchHistory.filter(item => item.topic.toLowerCase() !== topic.toLowerCase());
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    setSearchHistory(updated);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  };

  const removeFromHistory = (topic: string) => {
    const updated = searchHistory.filter(item => item.topic !== topic);
    setSearchHistory(updated);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  const form = useForm<LearnFormValues>({
    resolver: zodResolver(learnSchema),
    defaultValues: {
      topic: "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  // Reset form state when starting a new search
  const startNewSearch = (topic?: string) => {
    setResult(null);
    setError(null);
    setSimplerExplanation(null);
    if (topic) {
      form.setValue('topic', topic, { shouldValidate: true });
    }
  };

  async function onSubmit(values: LearnFormValues) {
    setLoading(true);
    setResult(null);
    setError(null);
    setSimplerExplanation(null);
    setShowHistory(false);
    setShowStoryVideo(false);
    try {
      const explanation = await generateSimpleExplanation({
        topic: values.topic,
        preferredExplanationLength: interests.preferredLength || "medium",
        userInterests: hasSetPreferences ? {
          learningStyle: interests.learningStyle,
          explanationStyle: interests.explanationStyle,
          difficultyLevel: interests.difficultyLevel,
          interests: interests.interests,
          fieldOfStudy: interests.fieldOfStudy,
        } : undefined,
      });
      setResult(explanation);

      // Add to search history
      addToSearchHistory(values.topic);

      // Track topic learned
      if (user?.uid) {
        try {
          await trackTopicLearned(user.uid, values.topic, "learn");
        } catch (trackError) {
          console.error("Error tracking topic:", trackError);
        }
      }
    } catch (e) {
      setError("Failed to generate explanation. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuizFail() {
    if (!result) return;
    setIsGeneratingSimpler(true);
    setSimplerExplanation(null);
    try {
      const response = await generateEvenSimplerExplanation({ topic: result.simpleExplanation });
      setSimplerExplanation(response.simplerExplanation);
    } catch (e) {
      console.error("Failed to generate simpler explanation", e);
    } finally {
      setIsGeneratingSimpler(false);
    }
  }

  const [isSaving, setIsSaving] = useState<string | null>(null);

  const handleSave = async (type: 'Explanation' | 'Analogy' | 'Mind Map', content: string) => {
    if (!result) return;
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to save items to your Memory Palace."
      });
      return;
    }

    try {
      setIsSaving(type);
      await addMemoryItem({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: `${result.simpleExplanation.substring(0, 20)}... - ${type}`,
        content,
        type,
        topic: form.getValues('topic')
      });
      toast({
        title: "Saved to Memory Palace!",
        description: `Your ${type.toLowerCase()} for "${form.getValues('topic')}" has been saved permanently.`
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to Save",
        description: "Could not save to Memory Palace. Please try again."
      });
    } finally {
      setIsSaving(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* User Interests Dialog */}
      <UserInterestsDialog open={showInterestsDialog} onOpenChange={setShowInterestsDialog} />

      {/* Personalization Prompt */}
      {!hasSetPreferences && (
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 shadow-lg shadow-primary/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-purple-500 shadow-lg shadow-primary/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Personalize Your Learning</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tell us about your interests and learning style to get tailored explanations.
                </p>
              </div>
              <Button onClick={() => setShowInterestsDialog(true)} className="shrink-0 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/20">
                <Settings2 className="h-4 w-4 mr-2" />
                Set Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Input */}
      <Card className="border shadow-lg shadow-primary/5 overflow-hidden relative bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <CardContent className="p-6 relative">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-purple-500 shadow-md">
                          <Search className="h-4 w-4 text-white" />
                        </div>
                        What do you want to learn?
                      </FormLabel>
                      {hasSetPreferences && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowInterestsDialog(true)}
                          className="text-xs"
                        >
                          <Settings2 className="h-3 w-3 mr-1" />
                          Preferences
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="e.g., Quantum Entanglement, The Krebs Cycle..."
                          className="h-14 text-base pr-10 border-2 focus:border-primary/50 transition-all shadow-sm focus:shadow-lg focus:shadow-primary/10"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (result && e.target.value !== form.getValues('topic')) {
                              setResult(null);
                              setError(null);
                              setSimplerExplanation(null);
                              setShowStoryVideo(false);
                            }
                          }}
                          onFocus={() => setShowHistory(true)}
                        />
                        {searchHistory.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={() => setShowHistory(!showHistory)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Search History Dropdown */}
              {showHistory && searchHistory.length > 0 && (
                <div className="border rounded-xl p-3 bg-muted/30 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      <History className="h-4 w-4 text-primary" />
                      Recent Searches
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSearchHistory}
                      className="text-xs h-7 text-muted-foreground hover:text-destructive"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((item) => (
                      <Badge
                        key={item.timestamp}
                        className="cursor-pointer bg-gradient-to-r from-primary/10 to-purple-500/10 text-foreground hover:from-primary/20 hover:to-purple-500/20 border border-primary/20 pr-1 flex items-center gap-1 transition-all hover:shadow-md"
                      >
                        <span
                          onClick={() => {
                            startNewSearch(item.topic);
                            setShowHistory(false);
                          }}
                        >
                          {item.topic}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-destructive/20 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(item.topic);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:from-primary/90 hover:via-purple-500/90 hover:to-pink-500/90 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Explanation
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Generating your explanation...</p>
        </div>
      )}

      {error && <p className="text-destructive text-center py-4">{error}</p>}

      {result && (
        <div className="space-y-6">
          {/* Animated Lesson Video Section */}
          <Card className="border shadow-sm overflow-hidden bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Play className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Animated Lesson</CardTitle>
                  <CardDescription>Watch an engaging animated summary with narration</CardDescription>
                </div>
              </div>
              <Button
                variant={showStoryVideo ? "secondary" : "default"}
                size="sm"
                onClick={() => setShowStoryVideo(!showStoryVideo)}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                {showStoryVideo ? "Hide" : "Watch Story"}
              </Button>
            </CardHeader>
            {showStoryVideo && (
              <CardContent className="pt-0">
                <AnimatedStoryVideo
                  topic={form.getValues('topic')}
                  explanation={result.simpleExplanation}
                  analogy={result.analogy}
                />
              </CardContent>
            )}
          </Card>

          {/* Explanation */}
          <Card className="border shadow-lg shadow-blue-500/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                  <BookText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Simple Explanation</CardTitle>
                  <CardDescription>Broken down for easy understanding</CardDescription>
                </div>
              </div>
              <TextToSpeechButton text={result.simpleExplanation} />
            </CardHeader>
            <CardContent className="pt-5">
              <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:text-primary prose-headings:font-semibold prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2 prose-ul:my-2 prose-li:my-0.5 prose-p:my-2 prose-p:leading-relaxed">
                <ReactMarkdown>{result.simpleExplanation}</ReactMarkdown>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gradient-to-r from-blue-500/5 to-cyan-500/5 pt-4">
              <Button variant="outline" size="sm" onClick={() => handleSave('Explanation', result.simpleExplanation)} disabled={isSaving !== null} className="hover:bg-blue-500/10 hover:border-blue-500/30">
                {isSaving === 'Explanation' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving === 'Explanation' ? 'Saving...' : 'Save to Memory Palace'}
              </Button>
            </CardFooter>
          </Card>

          {/* Analogy */}
          <Card className="border shadow-lg shadow-amber-500/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Real-life Analogy</CardTitle>
                  <CardDescription>Connecting to familiar concepts</CardDescription>
                </div>
              </div>
              <TextToSpeechButton text={result.analogy} />
            </CardHeader>
            <CardContent className="pt-5">
              <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:my-2 prose-p:leading-relaxed prose-strong:text-primary prose-ul:my-2 prose-li:my-0.5">
                <ReactMarkdown>{result.analogy}</ReactMarkdown>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gradient-to-r from-amber-500/5 to-orange-500/5 pt-4">
              <Button variant="outline" size="sm" onClick={() => handleSave('Analogy', result.analogy)} disabled={isSaving !== null} className="hover:bg-amber-500/10 hover:border-amber-500/30">
                {isSaving === 'Analogy' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving === 'Analogy' ? 'Saving...' : 'Save to Memory Palace'}
              </Button>
            </CardFooter>
          </Card>

          {/* Mind Map */}
          <Card className="border shadow-lg shadow-purple-500/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                <Waypoints className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Mind Map</CardTitle>
                <CardDescription>Visual hierarchy of key concepts</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="prose prose-neutral dark:prose-invert max-w-none font-mono text-sm bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-4 rounded-xl border border-purple-500/10">
                <ReactMarkdown>{result.mindMap}</ReactMarkdown>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gradient-to-r from-purple-500/5 to-pink-500/5 pt-4">
              <Button variant="outline" size="sm" onClick={() => handleSave('Mind Map', result.mindMap)} disabled={isSaving !== null} className="hover:bg-purple-500/10 hover:border-purple-500/30">
                {isSaving === 'Mind Map' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving === 'Mind Map' ? 'Saving...' : 'Save to Memory Palace'}
              </Button>
            </CardFooter>
          </Card>

          {/* Quiz */}
          <Card className="border shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Knowledge Check</CardTitle>
                <CardDescription>Test your understanding</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <Quiz questions={result.quiz} onQuizFail={handleQuizFail} />
            </CardContent>
          </Card>

          {isGeneratingSimpler && (
            <div className="flex items-center justify-center py-12 border border-dashed rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-4 text-muted-foreground">Generating a simpler explanation...</p>
            </div>
          )}

          {simplerExplanation && (
            <Alert>
              <BookText className="h-4 w-4" />
              <AlertTitle>Simpler Explanation</AlertTitle>
              <AlertDescription className="prose prose-neutral dark:prose-invert max-w-none mt-2">
                <ReactMarkdown>{simplerExplanation}</ReactMarkdown>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
