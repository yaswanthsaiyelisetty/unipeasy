"use client";

import Link from "next/link";
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
  FileText,
  BookOpen,
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
import { cn } from "@/lib/utils";
import { initializeUserAnalytics } from "@/lib/analytics";
import { StudyStreak } from "@/components/study-streak";
import { ContinueLearning } from "@/components/continue-learning";
import { GamifiedProgress } from "@/components/gamified-progress";
import { FeedbackForm } from "@/components/feedback";

const quickAccessItems = [
  {
    title: "Interactive Learning",
    href: "/learn",
    icon: Lightbulb,
    description: "AI-powered explanations",
  },
  {
    title: "AI Exam Strategist",
    href: "/strategist",
    icon: Target,
    description: "Plan your success",
  },
  {
    title: "Study Materials",
    href: "/materials",
    icon: BookOpen,
    description: "JNTUK notes & resources",
  },
  {
    title: "My Documents",
    href: "/my-documents",
    icon: FileText,
    description: "Store your PDFs & notes",
  },
  {
    title: "All Skills",
    href: "/skills",
    icon: Star,
    description: "Master new abilities",
  },
  {
    title: "Memory Palace",
    href: "/memory-palace",
    icon: BrainCircuit,
    description: "Store your knowledge",
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
      {/* Hero Section */}
      <div
        className={cn(
          "relative rounded-xl p-8 bg-muted/50 border",
          "transform transition-all duration-500",
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{getGreeting()}</p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Welcome back, {user?.displayName?.split(" ")[0] || "Learner"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to continue your learning journey?
            </p>
          </div>
          <div className="flex items-center gap-6">
            {/* Study Streak - Compact Version */}
            <StudyStreak variant="compact" />
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div className="text-right hidden sm:block">
              <p className="text-xl font-semibold">
                {progressData.length}
              </p>
              <p className="text-xs text-muted-foreground">Active Tracks</p>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div className="text-right hidden sm:block">
              <p className="text-xl font-semibold">
                {memoryItems.length}
              </p>
              <p className="text-xs text-muted-foreground">Saved Items</p>
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
            <div className="grid grid-cols-2 gap-4">
              {quickAccessItems.map((item) => (
                <Link href={item.href} key={item.title} className="group">
                  <Card className="h-full border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-3 group-hover:bg-foreground group-hover:text-background transition-colors">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Discoveries */}
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
                  {recentMemories.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-4 p-3 rounded-lg bg-muted/50 border hover:shadow-sm transition-shadow"
                    >
                      <div className="p-2 rounded bg-secondary">
                        {getMemoryItemIcon(item.type)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-sm truncate">{item.topic}</p>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href="/memory-palace">
                          View <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  ))}
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
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border shadow-sm">
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
          <Card className="border shadow-sm">
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
        </div>
      </div>
      {/* Social & Contact Section */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <Link
          href="https://www.instagram.com/unipeasy?igsh=NjBteXFzMzloMmFu"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-semibold shadow hover:scale-105 transition-transform"
        >
          <span className="w-5 h-5">
            {/* Instagram Icon */}
            <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" className="w-5 h-5"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9 114.9-51.3 114.9-114.9S287.7 141 224.1 141zm0 186c-39.5 0-71.5-32-71.5-71.5s32-71.5 71.5-71.5 71.5 32 71.5 71.5-32 71.5-71.5 71.5zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zm76.1 27.2c-1.7-35.3-9.9-66.7-36.2-92.1S388.6 1.7 353.3 0C317.5-1.7 130.5-1.7 94.7 0 59.4 1.7 28 9.9 2.7 36.2S1.7 59.4 0 94.7C-1.7 130.5-1.7 317.5 0 353.3c1.7 35.3 9.9 66.7 36.2 92.1s56.8 34.5 92.1 36.2c35.8 1.7 222.8 1.7 258.6 0 35.3-1.7 66.7-9.9 92.1-36.2s34.5-56.8 36.2-92.1c1.7-35.8 1.7-222.8 0-258.6zM398.8 388c-7.8 19.6-22.9 34.7-42.5 42.5-29.4 11.7-99.2 9-132.3 9s-102.9 2.6-132.3-9c-19.6-7.8-34.7-22.9-42.5-42.5-11.7-29.4-9-99.2-9-132.3s-2.6-102.9 9-132.3c7.8-19.6 22.9-34.7 42.5-42.5C123.1 43.2 192.9 45.8 226 45.8s102.9-2.6 132.3 9c19.6 7.8 34.7 22.9 42.5 42.5 11.7 29.4 9 99.2 9 132.3s2.7 102.9-9 132.3z" /></svg>
          </span>
          <span>Follow us on Instagram</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold shadow">
          <span className="w-5 h-5">
            {/* Gmail Icon */}
            <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" className="w-5 h-5"><path d="M502.3 190.8L327.4 338.3c-15.9 13.2-39.1 13.2-55 0L9.7 190.8C3.9 186.1 0 178.7 0 170.7V80c0-26.5 21.5-48 48-48h416c26.5 0 48 21.5 48 48v90.7c0 8-3.9 15.4-9.7 20.1zM464 80c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16v61.8l208 172.2 208-172.2V80zm48 90.7c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V432c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V170.7z" /></svg>
          </span>
          <span>theunipeasy@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
