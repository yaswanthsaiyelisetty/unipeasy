"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
import { PlanGuard } from "@/components/plan-guard";
import { staggerContainer, fadeUpVariant, hoverGlow, tapEffect } from "@/lib/animations";

// Skill background images mapping
const skillImages: Record<string, string> = {
  'skill-python': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=200&fit=crop',
  'skill-dsa': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=200&fit=crop',
  'skill-web': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=200&fit=crop',
  'skill-database': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=200&fit=crop',
  'skill-ml': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
  'skill-dl': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=200&fit=crop',
  'skill-nlp': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=200&fit=crop',
  'skill-viz': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
  'skill-stats': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
  'skill-bigdata': 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=200&fit=crop',
  'skill-network-sec': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop',
  'skill-hacking': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop',
  'skill-crypto': 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=200&fit=crop',
  'skill-embedded': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
  'skill-vlsi': 'https://images.unsplash.com/photo-1601134467661-3d775b999c8b?w=400&h=200&fit=crop',
  'skill-iot': 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=200&fit=crop',
  'skill-public-speaking': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=200&fit=crop',
  'skill-ui-ux': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop',
  'skill-project-management': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop',
  'skill-writing': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=200&fit=crop',
  'skill-problem-solving': 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400&h=200&fit=crop',
  'skill-interview': 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=400&h=200&fit=crop',
};

function SkillsContent() {
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

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredTracks.map((track: Omit<SkillTrack, 'journey'>, index: number) => {
          const progress = getProgressPercentage(track.slug);
          const isStarted = skillsProgress[track.slug] !== undefined;

          return (
            <motion.div
              key={track.slug}
              variants={fadeUpVariant}
              whileHover={hoverGlow}
              whileTap={tapEffect}
            >
              <Card
                className={cn(
                  "group flex flex-col border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden",
                  mounted && "animate-in fade-in slide-in-from-bottom-4",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Background Image Section */}
                <div className="relative h-28 sm:h-32 overflow-hidden">
                  <Image
                    src={skillImages[track.imageId] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'}
                    alt={track.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="absolute top-2 right-2">
                    {progress === 100 && (
                      <div className="p-1.5 rounded-full bg-yellow-500/90 shadow-lg shadow-yellow-500/30">
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 pt-2 sm:pt-3">
                  <div className="flex gap-1.5 sm:gap-2 flex-wrap mb-1.5 sm:mb-2">
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
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-3 sm:p-4 md:p-6 pt-0">
                  <Button asChild variant={isStarted ? "default" : "outline"} className="w-full h-8 sm:h-9 text-xs sm:text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link href={`/skills/${track.slug}`}>
                      {isStarted ? "Continue" : "Start Training"}
                      <ArrowRight className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredTracks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 border border-dashed rounded-lg"
        >
          <p className="text-muted-foreground">No skills found for this branch.</p>
          <Button
            variant="link"
            onClick={() => setSelectedBranch('All')}
            className="mt-2"
          >
            View all skills
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default function SkillsPage() {
  return (
    <PlanGuard>
      <SkillsContent />
    </PlanGuard>
  );
}
