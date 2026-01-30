"use client";

import { useFocusMode } from "@/context/focus-mode-context";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FocusModeToggleProps {
  variant?: "default" | "floating" | "minimal";
  className?: string;
}

export function FocusModeToggle({
  variant = "default",
  className,
}: FocusModeToggleProps) {
  const { isFocusMode, toggleFocusMode } = useFocusMode();

  if (variant === "floating") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={cn(
            "fixed bottom-20 right-6 z-40",
            className
          )}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isFocusMode ? "default" : "outline"}
                  size="icon"
                  onClick={toggleFocusMode}
                  className={cn(
                    "h-12 w-12 rounded-full shadow-lg",
                    isFocusMode && "bg-primary text-primary-foreground"
                  )}
                >
                  {isFocusMode ? (
                    <Minimize2 className="h-5 w-5" />
                  ) : (
                    <Maximize2 className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}</p>
                <p className="text-xs text-muted-foreground">Ctrl+Shift+F</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (variant === "minimal") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFocusMode}
              className={cn("gap-2", className)}
            >
              {isFocusMode ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFocusMode ? "Exit Focus Mode" : "Focus Mode"}</p>
            <p className="text-xs text-muted-foreground">Ctrl+Shift+F</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isFocusMode ? "default" : "outline"}
            size="sm"
            onClick={toggleFocusMode}
            className={cn("gap-2", className)}
          >
            {isFocusMode ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span className="hidden sm:inline">Exit Focus</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Focus Mode</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isFocusMode ? "Show navigation" : "Hide navigation for distraction-free reading"}</p>
          <p className="text-xs text-muted-foreground">Ctrl+Shift+F</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
