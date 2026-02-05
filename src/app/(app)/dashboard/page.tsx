"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Book,
  BrainCircuit,
  Compass,
  Lightbulb,
  Target,
  FlaskConical,
  Waypoints,
  Star,
  Sparkles,
  Zap,
  Trophy,
  Rocket,
  BookOpen,
  Mail,
  Copy,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { skillsData, type SkillTrack, type Level } from "@/lib/skills-data";
import { useState, useEffect } from "react";
import { useMemoryPalace } from "@/context/memory-palace-context";
import { useAuth } from "@/context/auth-context";
import { usePlan } from "@/context/plan-context";
import { cn } from "@/lib/utils";
import { initializeUserAnalytics } from "@/lib/analytics";
import { StudyStreak } from "@/components/study-streak";
import { ContinueLearning } from "@/components/continue-learning";
import { GamifiedProgress } from "@/components/gamified-progress";
import { FeedbackForm } from "@/components/feedback";
import { FeatureLock, ClaimPlanBanner } from "@/components/feature-lock";
import { staggerContainer, fadeUpVariant, hoverGlow, tapEffect } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";

const quickAccessItems = [
  {
    title: "Interactive Learning",
    href: "/learn",
    icon: Lightbulb,
    description: "AI-powered explanations",
    requiresPlan: true,
    gradient: "from-yellow-500 to-orange-500",
    bgGradient: "from-yellow-500/10 to-orange-500/10",
    iconColor: "text-white",
  },
  {
    title: "AI Exam Strategist",
    href: "/strategist",
    icon: Target,
    description: "Plan your success",
    requiresPlan: true,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-white",
  },
  {
    title: "Study Materials",
    href: "/materials",
    icon: BookOpen,
    description: "Verified notes & resources",
    requiresPlan: true,
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-white",
  },
  {
    title: "All Skills",
    href: "/skills",
    icon: Star,
    description: "Master new abilities",
    requiresPlan: true,
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-white",
  },
  {
    title: "Memory Palace",
    href: "/memory-palace",
    icon: BrainCircuit,
    description: "Store your knowledge",
    requiresPlan: true,
    gradient: "from-red-500 to-rose-500",
    bgGradient: "from-red-500/10 to-rose-500/10",
    iconColor: "text-white",
  },
  {
    title: "About UniPeasy",
    href: "/about",
    icon: Info,
    description: "Meet the team",
    requiresPlan: false,
    gradient: "from-cyan-500 to-teal-500",
    bgGradient: "from-cyan-500/10 to-teal-500/10",
    iconColor: "text-white",
  },
];

type ProgressData = {
  title: string;
  progress: number;
  slug: string;
};

type LastVisitedLevel = {
  track: SkillTrack;
  level: Level;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { hasActivePlan } = usePlan();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [lastVisited, setLastVisited] = useState<LastVisitedLevel | null>(null);
  const { memoryItems, isLoaded } = useMemoryPalace();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Initialize user analytics
    if (user?.uid && user?.email) {
      initializeUserAnalytics(user.uid, user.email, user.displayName || "Student");
    }

    // Calculate Progress
    const allProgress = Object.values(skillsData).map((track: SkillTrack) => {
      const totalLevels = track.journey.reduce(
        (sum, tier) => sum + tier.levels.length,
        0
      );
      let completedLevels = 0;
      if (typeof window !== "undefined") {
        track.journey.forEach((tier) => {
          tier.levels.forEach((level) => {
            if (
              localStorage.getItem(
                `skill-${track.slug}-level-${level.level}`
              ) === "completed"
            ) {
              completedLevels++;
            }
          });
        });
      }
      const progress =
        totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
      return {
        title: track.title,
        progress: Math.round(progress),
        slug: track.slug,
      };
    });
    setProgressData(allProgress.filter((p) => p.progress > 0));

    // Get Last Visited Level
    const lastVisitedStr = localStorage.getItem("lastVisitedSkillLevel");
    if (lastVisitedStr) {
      try {
        const { slug, level: levelNumber } = JSON.parse(lastVisitedStr);
        const track = skillsData[slug];
        const allLevels = track.journey.flatMap((tier) => tier.levels);
        const level = allLevels.find((l) => l.level === levelNumber);
        if (track && level) {
          setLastVisited({ track, level });
        }
      } catch (e) {
        console.error("Could not parse last visited level", e);
      }
    }
  }, []);

  const getMemoryItemIcon = (type: string) => {
    switch (type) {
      case "Explanation":
        return <Book className="w-5 h-5" />;
      case "Analogy":
        return <Compass className="w-5 h-5" />;
      case "Mind Map":
        return <Waypoints className="w-5 h-5" />;
      default:
        return <BrainCircuit className="w-5 h-5" />;
    }
  };

  const recentMemories = memoryItems.slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div
      className={cn(
        "space-y-8 transition-all duration-500",
        mounted ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Claim Plan Banner for free users */}
      <ClaimPlanBanner />

      {/* Hero Section */}
      <div
        className={cn(
          "relative rounded-2xl p-8 overflow-hidden",
          "bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10",
          "border border-primary/20 shadow-lg shadow-primary/5",
          "transform transition-all duration-500",
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm font-medium bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-1">
              {getGreeting()} ✨
            </p>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">{user?.displayName?.split(" ")[0] || "Learner"}</span>!
            </h1>
            <p className="text-muted-foreground mt-2">
              Ready to continue your learning journey?
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Study Streak - Compact Version */}
            <StudyStreak variant="compact" />

            {/* Active Tracks Stat */}
            <div className="hidden sm:flex flex-col items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                  {progressData.length}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Active Tracks</p>
            </div>

            {/* Saved Items Stat */}
            <div className="hidden sm:flex flex-col items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {memoryItems.length}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Saved Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Study Streak Card - Detailed Version */}
      <StudyStreak variant="detailed" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning from Last Access */}
          <ContinueLearning />

          {/* Continue Learning Card */}
          {lastVisited && (
            <Card className="border shadow-sm">
              <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-secondary">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Continue Learning</CardTitle>
                    <CardDescription>Pick up where you left off</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-10 h-10 rounded-lg bg-foreground text-background items-center justify-center font-semibold">
                      {lastVisited.level.level}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {lastVisited.track.title}
                      </p>
                      <p className="font-medium">{lastVisited.level.title}</p>
                    </div>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/skills/${lastVisited.track.slug}/${lastVisited.level.level}`}>
                      Continue
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Access Grid */}
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-muted-foreground" />
              Quick Access
            </h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-4"
            >
              {quickAccessItems.map((item, index) => {
                const cardContent = (
                  <motion.div
                    variants={fadeUpVariant}
                    whileHover={hoverGlow}
                    whileTap={tapEffect}
                  >
                    <Card className={cn(
                      "h-full border shadow-sm transition-all duration-300",
                      "hover:shadow-xl hover:border-primary/30 hover:-translate-y-1",
                      "bg-gradient-to-br",
                      item.bgGradient
                    )}>
                      <CardContent className="p-5">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                          "bg-gradient-to-br shadow-lg",
                          item.gradient,
                          "ring-2 ring-white/20 group-hover:ring-white/40 transition-all",
                          "group-hover:scale-110 group-hover:shadow-xl"
                        )}>
                          <item.icon className={cn("h-6 w-6 transition-transform", item.iconColor)} />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );

                // If plan is not active and item requires plan, show locked version
                if (item.requiresPlan && !hasActivePlan) {
                  return (
                    <FeatureLock key={item.title}>
                      <div className="group">
                        {cardContent}
                      </div>
                    </FeatureLock>
                  );
                }

                // Otherwise show normal clickable card
                return (
                  <Link href={item.href} key={item.title} className="group">
                    {cardContent}
                  </Link>
                );
              })}
            </motion.div>
          </div>

          {/* Recent Discoveries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border shadow-sm">
              <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-secondary">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Recent Discoveries</CardTitle>
                    <CardDescription>Your latest saved insights</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {isLoaded && recentMemories.length > 0 ? (
                  <div className="space-y-3">
                    {recentMemories.map((item) => {
                      const getIconStyle = (type: string) => {
                        switch (type) {
                          case 'Explanation': return 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20';
                          case 'Analogy': return 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20';
                          case 'Mind Map': return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20';
                          default: return 'bg-gradient-to-br from-primary to-purple-500 text-white shadow-lg';
                        }
                      };
                      return (
                        <div
                          key={item.id}
                          className="group flex items-center gap-4 p-3 rounded-lg bg-muted/50 border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 hover:border-primary/20"
                        >
                          <div className={cn(
                            "p-2.5 rounded-lg ring-2 ring-white/20 group-hover:ring-white/40 group-hover:scale-105 transition-all",
                            getIconStyle(item.type)
                          )}>
                            {getMemoryItemIcon(item.type)}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-semibold text-sm truncate">{item.topic}</p>
                            <p className="text-xs text-muted-foreground">{item.type}</p>
                          </div>
                          <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href="/memory-palace">
                              View <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                      <BrainCircuit className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="font-medium">No discoveries yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start learning to save insights
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link href="/learn">
                        Start Learning <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          className="lg:col-span-1 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-5 pb-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-secondary">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">Progress Overview</CardTitle>
                  <CardDescription>Your skill journey</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {progressData.length > 0 ? (
                progressData.map((item) => (
                  <Link href={`/skills/${item.slug}`} key={item.title} className="block group">
                    <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <GamifiedProgress
                        value={item.progress}
                        label={item.title}
                        showPercentage={true}
                        size="sm"
                        variant="gradient"
                        celebrateOnComplete={true}
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed rounded-lg">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm">No progress yet</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Start a skill track to see progress
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/skills">
                      Browse Skills <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Tip Card */}
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded bg-secondary">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">Daily Tip</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Consistent practice beats cramming. Even 15 minutes daily
                    can lead to remarkable progress over time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Card */}
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded bg-primary/10">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-sm mb-1">Help Us Improve</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Share your thoughts and help us make UniPeasy better for everyone.
                  </p>
                  <FeedbackForm />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {/* Social & Contact Section */}
      <motion.div
        className="mt-12 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ConnectButtons />
      </motion.div>
    </div>
  );
}

// Professional Connect Buttons Component
function ConnectButtons() {
  const [emailCopied, setEmailCopied] = React.useState(false);
  const { toast } = useToast();

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("theunipeasy@gmail.com");
      setEmailCopied(true);
      toast({
        title: "Email Copied!",
        description: "theunipeasy@gmail.com has been copied to your clipboard.",
      });
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please manually copy: theunipeasy@gmail.com",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* Instagram Button with Gradient */}
      <motion.a
        href="https://www.instagram.com/unipeasy?igsh=NjBteXFzMzloMmFu"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative overflow-hidden rounded-xl px-5 py-2.5 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-muted group-hover:bg-transparent transition-colors duration-300" />
        <div className="absolute inset-[2px] bg-background/95 rounded-[10px] group-hover:bg-background/10 transition-colors duration-300" />

        <div className="relative flex items-center gap-2">
          <svg viewBox="0 0 448 512" fill="currentColor" className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors duration-300">
            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9 114.9-51.3 114.9-114.9S287.7 141 224.1 141zm0 186c-39.5 0-71.5-32-71.5-71.5s32-71.5 71.5-71.5 71.5 32 71.5 71.5-32 71.5-71.5 71.5zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zm76.1 27.2c-1.7-35.3-9.9-66.7-36.2-92.1S388.6 1.7 353.3 0C317.5-1.7 130.5-1.7 94.7 0 59.4 1.7 28 9.9 2.7 36.2S1.7 59.4 0 94.7C-1.7 130.5-1.7 317.5 0 353.3c1.7 35.3 9.9 66.7 36.2 92.1s56.8 34.5 92.1 36.2c35.8 1.7 222.8 1.7 258.6 0 35.3-1.7 66.7-9.9 92.1-36.2s34.5-56.8 36.2-92.1c1.7-35.8 1.7-222.8 0-258.6zM398.8 388c-7.8 19.6-22.9 34.7-42.5 42.5-29.4 11.7-99.2 9-132.3 9s-102.9 2.6-132.3-9c-19.6-7.8-34.7-22.9-42.5-42.5-11.7-29.4-9-99.2-9-132.3s-2.6-102.9 9-132.3c7.8-19.6 22.9-34.7 42.5-42.5C123.1 43.2 192.9 45.8 226 45.8s102.9-2.6 132.3 9c19.6 7.8 34.7 22.9 42.5 42.5 11.7 29.4 9 99.2 9 132.3s2.7 102.9-9 132.3z" />
          </svg>
          <span className="font-medium text-muted-foreground group-hover:text-white transition-colors duration-300">
            @unipeasy
          </span>
        </div>
      </motion.a>

      <span className="hidden sm:block text-muted-foreground/50">•</span>

      {/* Email Button with Copy */}
      <motion.button
        onClick={handleCopyEmail}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative overflow-hidden rounded-xl px-5 py-2.5 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-muted group-hover:bg-transparent transition-colors duration-300" />
        <div className="absolute inset-[2px] bg-background/95 rounded-[10px] group-hover:bg-primary/5 transition-colors duration-300" />

        <div className="relative flex items-center gap-2">
          {emailCopied ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                theunipeasy@gmail.com
              </span>
              <Copy className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/70 transition-colors duration-300" />
            </>
          )}
        </div>
      </motion.button>
    </div>
  );
}
