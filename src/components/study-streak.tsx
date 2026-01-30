"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { triggerSmallConfetti } from "@/lib/confetti";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  totalDaysStudied: number;
  weeklyProgress: boolean[]; // Last 7 days
}

interface StudyStreakProps {
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

export function StudyStreak({ variant = "default", className }: StudyStreakProps) {
  const { user } = useAuth();
  const [streakData, setStreakData] = React.useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [justUpdated, setJustUpdated] = React.useState(false);

  // Load and update streak data
  React.useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    const loadAndUpdateStreak = async () => {
      try {
        const streakRef = doc(db, "users", user.uid, "progress", "streak");
        const streakDoc = await getDoc(streakRef);

        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

        if (streakDoc.exists()) {
          const data = streakDoc.data() as StreakData;
          const lastDate = data.lastStudyDate;

          // Check if we need to update the streak
          if (lastDate !== today) {
            let newStreak = data.currentStreak;
            let showCelebration = false;

            if (lastDate === yesterday) {
              // Continuing streak
              newStreak += 1;
              showCelebration = true;
            } else if (lastDate !== today) {
              // Streak broken, start fresh
              newStreak = 1;
            }

            const updatedData: StreakData = {
              currentStreak: newStreak,
              longestStreak: Math.max(data.longestStreak, newStreak),
              lastStudyDate: today,
              totalDaysStudied: data.totalDaysStudied + 1,
              weeklyProgress: updateWeeklyProgress(data.weeklyProgress, true),
            };

            await updateDoc(streakRef, {
              ...updatedData,
              updatedAt: serverTimestamp(),
            });

            setStreakData(updatedData);

            if (showCelebration && newStreak > 1) {
              setJustUpdated(true);
              setTimeout(() => {
                triggerSmallConfetti();
                setJustUpdated(false);
              }, 500);
            }
          } else {
            setStreakData(data);
          }
        } else {
          // Create new streak document
          const newData: StreakData = {
            currentStreak: 1,
            longestStreak: 1,
            lastStudyDate: today,
            totalDaysStudied: 1,
            weeklyProgress: [false, false, false, false, false, false, true],
          };

          await setDoc(streakRef, {
            ...newData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          setStreakData(newData);
        }
      } catch (error) {
        console.error("Error loading streak data:", error);
        // Fallback to localStorage
        const localStreak = localStorage.getItem(`streak_${user.uid}`);
        if (localStreak) {
          setStreakData(JSON.parse(localStreak));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAndUpdateStreak();
  }, [user?.uid]);

  const updateWeeklyProgress = (current: boolean[], addToday: boolean): boolean[] => {
    const updated = [...current.slice(1), addToday];
    return updated;
  };

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-4">
          <div className="h-12 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!streakData) {
    return null;
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <motion.div
          animate={justUpdated ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Flame
            className={cn(
              "h-5 w-5",
              streakData.currentStreak > 0
                ? "text-orange-500"
                : "text-muted-foreground"
            )}
          />
        </motion.div>
        <span className="font-semibold tabular-nums">
          {streakData.currentStreak}
        </span>
        <span className="text-xs text-muted-foreground">day streak</span>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-5 space-y-4">
          {/* Main streak display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={
                  justUpdated
                    ? {
                        scale: [1, 1.3, 1],
                        rotate: [0, -10, 10, 0],
                      }
                    : {}
                }
                transition={{ duration: 0.5 }}
                className={cn(
                  "p-3 rounded-xl",
                  streakData.currentStreak > 0
                    ? "bg-gradient-to-br from-orange-500/20 to-red-500/20"
                    : "bg-muted"
                )}
              >
                <Flame
                  className={cn(
                    "h-8 w-8",
                    streakData.currentStreak > 0
                      ? "text-orange-500"
                      : "text-muted-foreground"
                  )}
                />
              </motion.div>
              <div>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    key={streakData.currentStreak}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold"
                  >
                    {streakData.currentStreak}
                  </motion.span>
                  <span className="text-muted-foreground">day streak</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {streakData.currentStreak > 0
                    ? "Keep it up! 🔥"
                    : "Start studying to build your streak!"}
                </p>
              </div>
            </div>
            <AnimatePresence>
              {justUpdated && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="text-2xl"
                >
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Weekly progress */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">This Week</p>
            <div className="flex gap-1.5">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      streakData.weeklyProgress[idx]
                        ? "bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {streakData.weeklyProgress[idx] ? (
                      <Flame className="h-4 w-4" />
                    ) : (
                      <span className="text-xs">{day}</span>
                    )}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Trophy className="h-4 w-4" />
                <span className="text-xs">Best Streak</span>
              </div>
              <p className="font-semibold">{streakData.longestStreak} days</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Total Days</span>
              </div>
              <p className="font-semibold">{streakData.totalDaysStudied} days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <motion.div
            animate={
              justUpdated
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, -5, 5, 0],
                  }
                : {}
            }
            transition={{ duration: 0.4 }}
            className={cn(
              "p-2.5 rounded-lg",
              streakData.currentStreak > 0
                ? "bg-gradient-to-br from-orange-500/20 to-red-500/20"
                : "bg-muted"
            )}
          >
            <Flame
              className={cn(
                "h-6 w-6",
                streakData.currentStreak > 0
                  ? "text-orange-500"
                  : "text-muted-foreground"
              )}
            />
          </motion.div>
          <div className="flex-grow">
            <div className="flex items-baseline gap-2">
              <motion.span
                key={streakData.currentStreak}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-2xl font-bold"
              >
                {streakData.currentStreak}
              </motion.span>
              <span className="text-sm text-muted-foreground">day streak</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Best: {streakData.longestStreak} days
            </p>
          </div>
          {/* Mini weekly progress */}
          <div className="flex gap-0.5">
            {streakData.weeklyProgress.slice(-7).map((active, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-6 rounded-full",
                  active ? "bg-green-500" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
