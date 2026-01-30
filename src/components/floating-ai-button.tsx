"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Sparkles, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingAIButtonProps {
  context?: string; // Current page context (e.g., PDF name, topic)
  onAskQuestion?: (question: string) => Promise<string>;
  className?: string;
}

export function FloatingAIButton({
  context,
  onAskQuestion,
  className,
}: FloatingAIButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleSubmit = async () => {
    if (!question.trim() || !onAskQuestion) return;

    setIsLoading(true);
    try {
      const response = await onAskQuestion(question);
      setAnswer(response);
    } catch (error) {
      setAnswer("Sorry, I couldn't process your question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuestion("");
    setAnswer(null);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className={cn(
            "fixed bottom-6 right-6 z-50",
            className
          )}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className={cn(
                "h-14 rounded-full shadow-lg",
                "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90",
                "transition-all duration-300",
                isExpanded ? "w-auto px-6" : "w-14"
              )}
              onMouseEnter={() => setIsExpanded(true)}
              onMouseLeave={() => setIsExpanded(false)}
            >
              <MessageCircle className="h-6 w-6" />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-2 overflow-hidden whitespace-nowrap"
                  >
                    Ask AI
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
          
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              Ask AI Assistant
            </DialogTitle>
            <DialogDescription>
              {context
                ? `Ask me anything about: ${context}`
                : "Ask me anything about your study materials"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Question input */}
            <div className="relative">
              <Textarea
                placeholder="Type your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[100px] resize-none pr-12"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!question.trim() || isLoading}
                className="absolute bottom-2 right-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Answer display */}
            <AnimatePresence>
              {answer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-lg bg-muted/50 border"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium mb-1">AI Response</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick suggestions */}
            {!answer && !isLoading && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Quick prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Explain this simply",
                    "Give me an analogy",
                    "What are key points?",
                    "Create a summary",
                  ].map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestion(prompt)}
                      className="text-xs"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
