"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Filter, Sparkles, Trophy, BookOpen } from "lucide-react";
import { skillTracks, branches, type Branch, type SkillTrack } from "@/lib/skills-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { getAllUserSkillsProgress, type SkillProgress } from "@/lib/analytics";

export default function SkillsPage() {
  const [selectedBranch, setSelectedBranch] = useState<Branch | 'All'>('All');
  const [mounted, setMounted] = useState(false);
  const [skillsProgress, setSkillsProgress] = useState<Record<string, SkillProgress>>({});
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user's skill progress
  useEffect(() => {
    if (user?.uid) {
      getAllUserSkillsProgress(user.uid).then(setSkillsProgress).catch(console.error);
    }
  }, [user?.uid]);

  const filteredTracks = useMemo((): Omit<SkillTrack, 'journey'>[] => {
    if (selectedBranch === 'All') {
      return skillTracks;
    }
    return skillTracks.filter(
      (track: Omit<SkillTrack, 'journey'>) => track.branch === selectedBranch || track.branch === 'General'
    );
  }, [selectedBranch]);

  const branchCounts = useMemo((): Record<string, number> => {
    const counts: Record<string, number> = { All: skillTracks.length };
    branches.forEach((b: { id: Branch; name: string; description: string }) => {
      counts[b.id] = skillTracks.filter((t: Omit<SkillTrack, 'journey'>) => t.branch === b.id).length;
    });
    return counts;
  }, []);

  const getProgressPercentage = (slug: string) => {
    const progress = skillsProgress[slug];
    if (!progress) return 0;
    return Math.round((progress.completedLevels.length / progress.totalLevels) * 100);
  };

  return (
    <div className={cn(
      "space-y-4 sm:space-y-6 md:space-y-8 transition-all duration-500",
      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <PageHeader
        title="Skills"
        description="Level up your abilities with AI-powered training."
      />
      
      {/* Branch Filter */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Filter by Branch</span>
        </div>
        <Tabs value={selectedBranch} onValueChange={(v) => setSelectedBranch(v as Branch | 'All')}>
          <TabsList className="flex flex-wrap h-auto gap-1.5 sm:gap-2 bg-transparent p-0">
            <TabsTrigger 
              value="All" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-2.5 sm:px-4 text-xs sm:text-sm h-7 sm:h-9"
            >
              All ({branchCounts['All']})
            </TabsTrigger>
            {branches.filter((b: { id: Branch; name: string }) => branchCounts[b.id] > 0).map((branch: { id: Branch; name: string }) => (
              <TabsTrigger 
                key={branch.id} 
                value={branch.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-2.5 sm:px-4 text-xs sm:text-sm h-7 sm:h-9"
              >
                {branch.name} ({branchCounts[branch.id]})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Banner */}
      {user && Object.keys(skillsProgress).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold">{Object.keys(skillsProgress).length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Skills Started</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/20">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold">
                  {Object.values(skillsProgress).reduce((acc, p) => acc + p.completedLevels.length, 0)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Levels Done</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/20">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold">
                  {Object.values(skillsProgress).filter(p => p.completedLevels.length === p.totalLevels).length}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Mastered</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/20">
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold">
                  {Object.values(skillsProgress).length > 0 
                    ? Math.max(...Object.values(skillsProgress).map(p => p.lastLevelCompleted))
                    : 0}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Top Level</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTracks.map((track: Omit<SkillTrack, 'journey'>, index: number) => {
          const progress = getProgressPercentage(track.slug);
          const isStarted = skillsProgress[track.slug] !== undefined;
          
          return (
            <Card 
              key={track.slug} 
              className={cn(
                "group flex flex-col border shadow-sm hover:shadow-md transition-all duration-300",
                mounted && "animate-in fade-in slide-in-from-bottom-4",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
                <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                  <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">
                      {track.category}
                    </Badge>
                    <Badge 
                      className={cn(
                        "border-0 text-[10px] sm:text-xs",
                        track.branch === 'CSE' && "bg-blue-500/80 text-white",
                        track.branch === 'CSM' && "bg-purple-500/80 text-white",
                        track.branch === 'CSD' && "bg-green-500/80 text-white",
                        track.branch === 'CSC' && "bg-red-500/80 text-white",
                        track.branch === 'ECE' && "bg-orange-500/80 text-white",
                        track.branch === 'General' && "bg-gray-500/80 text-white",
                      )}
                    >
                      {track.branch}
                    </Badge>
                  </div>
                  {progress === 100 && (
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 shrink-0" />
                  )}
                </div>
                <CardTitle className="text-sm sm:text-base md:text-lg">
                  {track.title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm line-clamp-2">{track.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0 flex-grow">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    {track.level}
                  </Badge>
                  {isStarted && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-green-500/10 text-green-600">
                      In Progress
                    </Badge>
                  )}
                </div>
                {isStarted && (
                  <div className="mt-2 sm:mt-3">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="p-3 sm:p-4 md:p-6 pt-0">
                <Button asChild variant={isStarted ? "default" : "outline"} className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                  <Link href={`/skills/${track.slug}`}>
                    {isStarted ? "Continue" : "Start Training"}
                    <ArrowRight className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredTracks.length === 0 && (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No skills found for this branch.</p>
          <Button 
            variant="link" 
            onClick={() => setSelectedBranch('All')}
            className="mt-2"
          >
            View all skills
          </Button>
        </div>
      )}
    </div>
  );
}
