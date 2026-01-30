"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquarePlus,
  Send,
  Loader2,
  CheckCircle2,
  Star,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { triggerSmallConfetti } from "@/lib/confetti";

// Quick thumbs up/down rating
interface QuickRatingProps {
  contentId: string;
  contentType: "unit" | "material" | "explanation" | "quiz";
  className?: string;
}

export function QuickRating({ contentId, contentType, className }: QuickRatingProps) {
  const { user } = useAuth();
  const [rating, setRating] = React.useState<"up" | "down" | null>(null);
  const [hasRated, setHasRated] = React.useState(false);

  const handleRate = async (value: "up" | "down") => {
    if (hasRated || !user) return;

    setRating(value);
    setHasRated(true);

    try {
      await addDoc(collection(db, "feedback"), {
        userId: user.uid,
        userEmail: user.email,
        contentId,
        contentType,
        rating: value === "up" ? 5 : 1,
        type: "quick-rating",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg bg-muted/50 border",
        className
      )}
    >
      <span className="text-sm text-muted-foreground">Was this helpful?</span>
      <div className="flex gap-1">
        <Button
          variant={rating === "up" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleRate("up")}
          disabled={hasRated}
          className={cn(
            "gap-1",
            rating === "up" && "bg-green-500 hover:bg-green-600"
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          {hasRated && rating === "up" && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              Thanks!
            </motion.span>
          )}
        </Button>
        <Button
          variant={rating === "down" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleRate("down")}
          disabled={hasRated}
          className={cn(
            "gap-1",
            rating === "down" && "bg-orange-500 hover:bg-orange-600"
          )}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Star rating component
interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

function StarRating({ value, onChange, disabled, size = "md" }: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
          className={cn(
            "transition-all duration-150",
            disabled ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizes[size],
              "transition-colors",
              (hoverValue !== null ? star <= hoverValue : star <= value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// Full feedback form dialog
interface FeedbackFormProps {
  trigger?: React.ReactNode;
  defaultCategory?: string;
  className?: string;
}

export function FeedbackForm({ trigger, defaultCategory, className }: FeedbackFormProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [category, setCategory] = React.useState(defaultCategory || "");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "feedback"), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || "Anonymous",
        rating,
        category,
        message,
        type: "detailed-feedback",
        status: "new",
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      triggerSmallConfetti();

      // Reset after showing success
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setRating(0);
        setCategory(defaultCategory || "");
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={cn("gap-2", className)}>
            <MessageSquarePlus className="h-4 w-4" />
            Give Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">Thank You!</h3>
              <p className="text-muted-foreground mt-1">
                Your feedback helps us improve UniPeasy
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Share Your Feedback
                </DialogTitle>
                <DialogDescription>
                  Help us make UniPeasy better for students like you
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Star Rating */}
                <div className="space-y-2">
                  <Label>Overall Experience</Label>
                  <StarRating value={rating} onChange={setRating} />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Content Quality</SelectItem>
                      <SelectItem value="ai">AI Accuracy</SelectItem>
                      <SelectItem value="performance">App Performance</SelectItem>
                      <SelectItem value="ui">User Interface</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us what you think or suggest improvements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Feature request floating button
interface FeatureRequestButtonProps {
  className?: string;
}

export function FeatureRequestButton({ className }: FeatureRequestButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "feedback"), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || "Anonymous",
        title,
        message: description,
        category: "feature",
        type: "feature-request",
        status: "new",
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      triggerSmallConfetti();

      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setTitle("");
        setDescription("");
      }, 2000);
    } catch (error) {
      console.error("Error submitting feature request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          className={cn(
            "fixed right-0 top-1/2 -translate-y-1/2 z-40",
            "px-2 py-4 rounded-l-lg",
            "bg-gradient-to-b from-primary/90 to-purple-600/90",
            "text-primary-foreground text-xs font-medium",
            "shadow-lg backdrop-blur-sm",
            "writing-mode-vertical",
            className
          )}
          style={{ writingMode: "vertical-rl" }}
        >
          <span className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4" />
            Suggest Feature
          </span>
        </motion.button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">Feature Requested!</h3>
              <p className="text-muted-foreground mt-1">
                We'll review your suggestion soon
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquarePlus className="h-5 w-5 text-primary" />
                  Suggest a Feature
                </DialogTitle>
                <DialogDescription>
                  Tell us what subjects or features you&apos;d like to see next
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="feature-title">Feature Title</Label>
                  <input
                    id="feature-title"
                    type="text"
                    placeholder="e.g., Add more LMR notes for CSE"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feature-description">Description (Optional)</Label>
                  <Textarea
                    id="feature-description"
                    placeholder="Describe what you'd like and why it would help..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Success survey after completing something
interface SuccessSurveyProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  contentType: "skill" | "quiz" | "analogy";
  contentId: string;
}

export function SuccessSurvey({
  isOpen,
  onClose,
  topic,
  contentType,
  contentId,
}: SuccessSurveyProps) {
  const { user } = useAuth();
  const [rating, setRating] = React.useState<"yes" | "no" | "somewhat" | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (value: "yes" | "no" | "somewhat") => {
    if (!user) return;

    setRating(value);
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "feedback"), {
        userId: user.uid,
        userEmail: user.email,
        contentId,
        contentType,
        topic,
        rating: value === "yes" ? 5 : value === "somewhat" ? 3 : 1,
        ratingLabel: value,
        type: "success-survey",
        createdAt: serverTimestamp(),
      });

      if (value === "yes") {
        triggerSmallConfetti();
      }

      setTimeout(onClose, 1500);
    } catch (error) {
      console.error("Error submitting survey:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center">
          <DialogTitle>Quick Feedback</DialogTitle>
          <DialogDescription>
            Did this {contentType === "analogy" ? "analogy" : "content"} help you understand{" "}
            <strong>{topic}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-3 py-4">
          {[
            { value: "yes", label: "Yes! 🎉", color: "bg-green-500 hover:bg-green-600" },
            { value: "somewhat", label: "Somewhat 🤔", color: "bg-yellow-500 hover:bg-yellow-600" },
            { value: "no", label: "Not really 😕", color: "bg-orange-500 hover:bg-orange-600" },
          ].map((option) => (
            <Button
              key={option.value}
              onClick={() => handleSubmit(option.value as "yes" | "no" | "somewhat")}
              disabled={isSubmitting}
              variant={rating === option.value ? "default" : "outline"}
              className={cn(
                "flex-1",
                rating === option.value && option.color
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <AnimatePresence>
          {rating && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-muted-foreground"
            >
              Thanks for your feedback! 💜
            </motion.p>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
