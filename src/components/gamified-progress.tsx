"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { triggerSmallConfetti, triggerStarConfetti } from "@/lib/confetti";
import { CheckCircle2, Trophy, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GamifiedProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  celebrateOnComplete?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gradient" | "striped";
  className?: string;
}

export function GamifiedProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
  celebrateOnComplete = true,
  size = "md",
  variant = "default",
  className,
}: GamifiedProgressProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);
  const [hasCelebrated, setHasCelebrated] = React.useState(false);
  const prevValueRef = React.useRef(0);
  
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  React.useEffect(() => {
    // Animate the progress value
    const duration = 1000; // 1 second animation
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = (percentage - displayValue) / steps;
    
    if (percentage !== displayValue) {
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayValue(percentage);
          clearInterval(timer);
        } else {
          setDisplayValue((prev) => Math.min(prev + increment, percentage));
        }
      }, stepDuration);
      
      return () => clearInterval(timer);
    }
  }, [percentage]);

  React.useEffect(() => {
    // Check for completion
    if (percentage >= 100 && !isComplete) {
      setIsComplete(true);
      if (celebrateOnComplete && !hasCelebrated && prevValueRef.current < 100) {
        setHasCelebrated(true);
        triggerStarConfetti();
      }
    } else if (percentage < 100) {
      setIsComplete(false);
    }
    prevValueRef.current = percentage;
  }, [percentage, celebrateOnComplete, hasCelebrated, isComplete]);

  const sizeStyles = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const indicatorStyles = {
    default: "bg-primary",
    gradient: "bg-gradient-to-r from-primary via-purple-500 to-pink-500",
    striped: "bg-primary bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] animate-[progress-stripes_1s_linear_infinite]",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="font-medium text-foreground">{label}</span>
          )}
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="complete"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-1 text-green-600 dark:text-green-400"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-semibold">Complete!</span>
              </motion.div>
            ) : showPercentage ? (
              <motion.span
                key="percentage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground tabular-nums"
              >
                {Math.round(displayValue)}%
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      )}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-secondary",
          sizeStyles[size]
        )}
      >
        <motion.div
          className={cn(
            "h-full rounded-full transition-all",
            indicatorStyles[variant],
            isComplete && "bg-green-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${displayValue}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {/* Shimmer effect */}
        {displayValue > 0 && displayValue < 100 && (
          <motion.div
            className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ["-100%", "400%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ width: `${displayValue}%` }}
          />
        )}
      </div>
    </div>
  );
}

// Milestone progress with checkpoints
interface MilestoneProgressProps {
  current: number;
  total: number;
  milestones?: number[];
  onMilestoneReached?: (milestone: number) => void;
  className?: string;
}

export function MilestoneProgress({
  current,
  total,
  milestones = [25, 50, 75, 100],
  onMilestoneReached,
  className,
}: MilestoneProgressProps) {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  const [reachedMilestones, setReachedMilestones] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    milestones.forEach((milestone) => {
      if (percentage >= milestone && !reachedMilestones.has(milestone)) {
        setReachedMilestones((prev) => new Set([...prev, milestone]));
        onMilestoneReached?.(milestone);
        if (milestone === 100) {
          triggerStarConfetti();
        } else {
          triggerSmallConfetti();
        }
      }
    });
  }, [percentage, milestones, reachedMilestones, onMilestoneReached]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {current} / {total} completed
        </span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {/* Milestone markers */}
        {milestones.map((milestone) => (
          <div
            key={milestone}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${milestone}%` }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: percentage >= milestone ? 1.2 : 1,
                backgroundColor: percentage >= milestone ? "rgb(34, 197, 94)" : "rgb(148, 163, 184)"
              }}
              className={cn(
                "h-3 w-3 -ml-1.5 rounded-full border-2 border-background",
                percentage >= milestone ? "bg-green-500" : "bg-slate-400"
              )}
            />
          </div>
        ))}
      </div>
      {/* Milestone labels */}
      <div className="relative h-4">
        {milestones.map((milestone) => (
          <div
            key={milestone}
            className="absolute -translate-x-1/2 text-xs"
            style={{ left: `${milestone}%` }}
          >
            <AnimatePresence>
              {percentage >= milestone && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-0.5 text-green-600 dark:text-green-400"
                >
                  {milestone === 100 ? (
                    <Trophy className="h-3 w-3" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
