"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerSmallConfetti } from "@/lib/confetti";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
  hint?: string;
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
  showResults?: boolean;
  className?: string;
}

export function InteractiveQuiz({
  questions,
  onComplete,
  showResults = true,
  className,
}: InteractiveQuizProps) {
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, string>>({});
  const [revealedExplanations, setRevealedExplanations] = React.useState<Set<string>>(new Set());
  const [showHint, setShowHint] = React.useState<string | null>(null);
  const [isComplete, setIsComplete] = React.useState(false);

  const question = questions[currentQuestion];
  const selectedAnswer = selectedAnswers[question?.id];
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = isAnswered && question.options.find(o => o.id === selectedAnswer)?.isCorrect;

  const handleSelectAnswer = (optionId: string) => {
    if (isAnswered) return;
    
    setSelectedAnswers((prev) => ({
      ...prev,
      [question.id]: optionId,
    }));

    const option = question.options.find((o) => o.id === optionId);
    if (option?.isCorrect) {
      triggerSmallConfetti();
    }
  };

  const handleRevealExplanation = () => {
    setRevealedExplanations((prev) => new Set([...prev, question.id]));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowHint(null);
    } else {
      setIsComplete(true);
      const score = Object.entries(selectedAnswers).filter(([qId, aId]) => {
        const q = questions.find((q) => q.id === qId);
        return q?.options.find((o) => o.id === aId)?.isCorrect;
      }).length;
      onComplete?.(score, questions.length);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setRevealedExplanations(new Set());
    setShowHint(null);
    setIsComplete(false);
  };

  const score = Object.entries(selectedAnswers).filter(([qId, aId]) => {
    const q = questions.find((q) => q.id === qId);
    return q?.options.find((o) => o.id === aId)?.isCorrect;
  }).length;

  if (isComplete && showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="relative">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-3xl font-bold">{percentage}%</span>
              </div>
              {percentage >= 70 && (
                <Sparkles className="absolute top-0 right-1/3 h-6 w-6 text-yellow-500 animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {percentage >= 90
                  ? "Excellent! 🎉"
                  : percentage >= 70
                  ? "Great Job! 👏"
                  : percentage >= 50
                  ? "Good Effort! 💪"
                  : "Keep Practicing! 📚"}
              </h3>
              <p className="text-muted-foreground">
                You got {score} out of {questions.length} correct
              </p>
            </div>
            <Button onClick={handleReset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Score: {score}/{Object.keys(selectedAnswers).length}
          </span>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1 mt-3">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                idx === currentQuestion
                  ? "bg-primary"
                  : selectedAnswers[q.id]
                  ? questions[idx].options.find((o) => o.id === selectedAnswers[q.id])?.isCorrect
                    ? "bg-green-500"
                    : "bg-red-500"
                  : "bg-secondary"
              )}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardTitle className="text-lg leading-relaxed">{question.question}</CardTitle>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const showCorrect = isAnswered && option.isCorrect;
            const showWrong = isSelected && !option.isCorrect;

            return (
              <motion.button
                key={option.id}
                onClick={() => handleSelectAnswer(option.id)}
                disabled={isAnswered}
                whileHover={!isAnswered ? { scale: 1.01 } : {}}
                whileTap={!isAnswered ? { scale: 0.99 } : {}}
                className={cn(
                  "w-full p-4 text-left rounded-lg border transition-all",
                  "flex items-center justify-between gap-3",
                  !isAnswered && "hover:border-primary hover:bg-muted/50 cursor-pointer",
                  isAnswered && "cursor-default",
                  isSelected && !isAnswered && "border-primary bg-primary/5",
                  showCorrect && "border-green-500 bg-green-500/10",
                  showWrong && "border-red-500 bg-red-500/10"
                )}
              >
                <span className={cn(
                  showCorrect && "text-green-700 dark:text-green-400",
                  showWrong && "text-red-700 dark:text-red-400"
                )}>
                  {option.text}
                </span>
                <AnimatePresence>
                  {showCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                  {showWrong && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <XCircle className="h-5 w-5 text-red-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Hint */}
        {question.hint && !isAnswered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHint(showHint === question.id ? null : question.id)}
            className="gap-2 text-muted-foreground"
          >
            <Lightbulb className="h-4 w-4" />
            {showHint === question.id ? "Hide Hint" : "Show Hint"}
          </Button>
        )}
        <AnimatePresence>
          {showHint === question.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm">
                <span className="font-medium text-yellow-600 dark:text-yellow-400">Hint: </span>
                {question.hint}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explanation */}
        {isAnswered && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRevealExplanation}
              className="gap-2 w-full justify-between"
              disabled={revealedExplanations.has(question.id)}
            >
              <span>
                {revealedExplanations.has(question.id)
                  ? "Explanation"
                  : "Reveal Explanation"}
              </span>
              {revealedExplanations.has(question.id) ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <AnimatePresence>
              {revealedExplanations.has(question.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-4 rounded-lg bg-muted/50 border text-sm">
                    {question.explanation}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleNext}
            disabled={!isAnswered}
            className="gap-2"
          >
            {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Single reveal question component
interface RevealQuestionProps {
  question: string;
  answer: string;
  className?: string;
}

export function RevealQuestion({ question, answer, className }: RevealQuestionProps) {
  const [isRevealed, setIsRevealed] = React.useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <button
        onClick={() => setIsRevealed(!isRevealed)}
        className={cn(
          "w-full p-4 text-left rounded-lg border transition-all",
          "hover:border-primary hover:bg-muted/50",
          "flex items-center justify-between gap-3"
        )}
      >
        <span className="font-medium">{question}</span>
        <motion.div
          animate={{ rotate: isRevealed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
