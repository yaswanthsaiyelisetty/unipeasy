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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                    <div className="space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{item.title}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-foreground transition-all duration-500"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
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
        </div>
      </div>
    </div>
  );
}
