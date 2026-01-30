"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/ai/flows/generate-simple-explanation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle, Trophy, BookOpen, ArrowRight } from "lucide-react";

interface QuizProps {
  questions: QuizQuestion[];
  onQuizFail: () => void;
}

export function Quiz({ questions, onQuizFail }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let finalScore = 0;
    questions.forEach((q, index) => {
      if (q.correctAnswer === selectedAnswers[index]) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setShowResults(true);

    if (finalScore < 3) {
      onQuizFail();
    }
  };

  if (showResults && score !== null) {
    const isPassing = score >= 3;
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-8 text-center">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${isPassing ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
            {isPassing ? (
              <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
            ) : (
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="mt-4 text-xl">
            {isPassing ? 'Great job!' : 'Keep learning!'}
          </CardTitle>
          <CardDescription className="mt-2 text-base">
            You scored {score} out of {questions.length}
          </CardDescription>
          
          <div className="mt-8 space-y-3 text-left">
            {questions.map((q, index) => {
              const isCorrect = selectedAnswers[index] === q.correctAnswer;
              return (
                <div 
                  key={index} 
                  className={`rounded-lg p-4 border ${isCorrect ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}
                >
                  <p className="font-medium text-sm">{q.question}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                      {selectedAnswers[index] || "Not answered"}
                    </span>
                  </div>
                  {!isCorrect && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Correct: {q.correctAnswer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div 
            className="h-full rounded-full bg-foreground transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-4 rounded-lg bg-muted/50">
        <p className="font-medium">{currentQuestion.question}</p>
      </div>

      {/* Options */}
      <RadioGroup
        onValueChange={handleAnswerSelect}
        value={selectedAnswers[currentQuestionIndex]}
        className="space-y-2"
      >
        {currentQuestion.options.map((option, index) => (
          <Label 
            key={index}
            htmlFor={`q${currentQuestionIndex}-o${index}`}
            className={`
              flex items-center space-x-3 rounded-lg p-4 cursor-pointer transition-all
              border
              ${selectedAnswers[currentQuestionIndex] === option 
                ? 'border-foreground bg-secondary' 
                : 'border-border hover:bg-muted/50'
              }
            `}
          >
            <RadioGroupItem value={option} id={`q${currentQuestionIndex}-o${index}`} />
            <span className="text-sm">{option}</span>
          </Label>
        ))}
      </RadioGroup>

      {/* Navigation */}
      <div className="flex justify-end pt-2">
        {isLastQuestion ? (
          <Button onClick={handleSubmit} disabled={!selectedAnswers[currentQuestionIndex]}>
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestionIndex]}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
