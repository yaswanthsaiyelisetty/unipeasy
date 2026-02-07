"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Sparkles,
  X,
  Loader2,
  Bot,
  User,
  Crown,
  Minimize2,
  Maximize2,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { usePlan } from "@/context/plan-context";
import { answerStudentQuestion } from "@/ai/flows/answer-student-question";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export function GlobalAIChat() {
  const { hasActivePlan, openClaimModal } = usePlan();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Close chat on route change (navigation listener)
  React.useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
      // Cancel any ongoing API request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsLoading(false);
      }
    }
  }, [pathname]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  React.useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Lock body scroll when chat is open on mobile
  React.useEffect(() => {
    if (isOpen && !isMinimized) {
      // Save current scroll position and lock body
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore body scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen, isMinimized]);

  // Close chat handler with cleanup
  const handleCloseChat = React.useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    // Cancel any ongoing API request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = async (submittedQuestion?: string) => {
    const q = submittedQuestion || question;
    if (!q.trim() || isLoading) return;

    // Check plan access
    if (!hasActivePlan) {
      openClaimModal();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: q.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await answerStudentQuestion({ question: q.trim() });

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
        suggestions: response.followUpSuggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Don't show error if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an issue processing your question. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
      abortControllerRef.current = null;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(suggestion);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button
                size="sm"
                onClick={() => setIsOpen(true)}
                className={cn(
                  "h-10 rounded-full shadow-lg shadow-primary/25",
                  "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90",
                  "transition-all duration-300",
                  isExpanded ? "w-auto px-4" : "w-10"
                )}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
              >
                <Sparkles className="h-4 w-4" />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-2 overflow-hidden whitespace-nowrap font-medium text-sm"
                    >
                      Ask AI
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop Overlay - Click to close */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none"
            onClick={handleCloseChat}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              height: isMinimized ? "auto" : "min(600px, 80vh)",
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "w-[calc(100vw-48px)] sm:w-[420px]",
              "bg-background/95 backdrop-blur-xl",
              "border border-border/50 rounded-2xl",
              "shadow-2xl shadow-black/20",
              "flex flex-col overflow-hidden"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-purple-600">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">UniPeasy AI</h3>
                  <p className="text-xs text-muted-foreground">Always here to help</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearChat}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseChat}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content - Hidden when minimized */}
            {!isMinimized && (
              <>
                {/* Plan Gate Banner */}
                {!hasActivePlan && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-500" />
                        <span className="text-xs">Unlock unlimited AI assistance</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={openClaimModal}
                        className="h-7 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        Claim Free
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="mx-auto p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 w-fit">
                          <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">How can I help you today?</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ask me anything about your studies
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                          {[
                            "Explain recursion",
                            "What is Big O notation?",
                            "Help with calculus",
                          ].map((suggestion) => (
                            <Button
                              key={suggestion}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSubmit(suggestion)}
                              className="text-xs rounded-full"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex gap-3",
                            message.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          {message.role === "assistant" && (
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 h-fit">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "max-w-[85%] rounded-2xl px-4 py-2.5",
                              message.role === "user"
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            )}
                          >
                            {message.role === "assistant" ? (
                              <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none prose-headings:text-primary prose-headings:font-semibold prose-h2:text-base prose-h2:mt-2 prose-h2:mb-1 prose-ul:my-1 prose-li:my-0 prose-p:my-1 prose-p:leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            )}

                            {/* Follow-up suggestions */}
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                                <p className="text-xs text-muted-foreground">Follow-up questions:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {message.suggestions.map((suggestion, i) => (
                                    <Button
                                      key={i}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSuggestionClick(suggestion)}
                                      className="h-auto py-1 px-2 text-xs text-left whitespace-normal hover:bg-primary/10"
                                    >
                                      {suggestion}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {message.role === "user" && (
                            <div className="p-1.5 rounded-lg bg-primary/20 h-fit">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {/* Loading indicator */}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                          <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1.5">
                              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t bg-background/50">
                  <div className="relative flex items-end gap-2">
                    <Textarea
                      ref={inputRef}
                      placeholder={hasActivePlan ? "Ask anything..." : "Claim your free plan to start..."}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading || !hasActivePlan}
                      className="min-h-[44px] max-h-[120px] resize-none pr-12 rounded-xl bg-muted/50"
                      rows={1}
                    />
                    <Button
                      size="icon"
                      onClick={() => handleSubmit()}
                      disabled={!question.trim() || isLoading || !hasActivePlan}
                      className="absolute right-2 bottom-2 h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Powered by Google Gemini • Press Enter to send
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

