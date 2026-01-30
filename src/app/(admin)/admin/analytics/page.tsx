"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Activity,
  BarChart3,
  Loader2,
  RefreshCw,
  Search,
  Eye,
  Target,
  ChevronRight,
} from "lucide-react";
import { getPlatformAnalytics, PlatformAnalytics, getSkillsAnalytics, SkillAnalyticsWithUsers, SkillUserInfo } from "@/lib/analytics";
import { skillTracks, branches, type Branch } from "@/lib/skills-data";

interface SkillAnalytics {
  slug: string;
  title: string;
  branch: string;
  totalCompletions: number;
  usersStarted: number;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [skillsAnalytics, setSkillsAnalytics] = useState<SkillAnalyticsWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<SkillAnalyticsWithUsers | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statDialog, setStatDialog] = useState<{
    type: 'users' | 'topics' | 'materials' | 'levels' | 'active' | null;
    open: boolean;
  }>({ type: null, open: false });

  const fetchAnalytics = async () => {
    setLoading(true);
    const data = await getPlatformAnalytics();
    const skills = await getSkillsAnalytics();
    setAnalytics(data);
    setSkillsAnalytics(skills);
    setLoading(false);
  };

  const handleSkillClick = (skillSlug: string) => {
    const stats = skillsAnalytics.find(s => s.slug === skillSlug);
    if (stats && stats.users.length > 0) {
      setSelectedSkill(stats);
      setDialogOpen(true);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  const totalSkillsCompleted = skillsAnalytics.reduce((sum, s) => sum + s.totalCompletions, 0);

  const statCards = [
    {
      title: "Total Users",
      value: analytics.totalUsers,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      description: "Registered users",
      dialogType: 'users' as const,
    },
    {
      title: "Topics Searched",
      value: analytics.totalTopicsSearched,
      icon: Search,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/20",
      description: "Total AI queries",
      dialogType: 'topics' as const,
    },
    {
      title: "Materials Accessed",
      value: analytics.totalMaterialsAccessed,
      icon: FileText,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      description: "PDF views",
      dialogType: 'materials' as const,
    },
    {
      title: "Levels Completed",
      value: totalSkillsCompleted,
      icon: Target,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-950/20",
      description: "Across all skills",
      dialogType: 'levels' as const,
    },
    {
      title: "Active Today",
      value: analytics.activeUsersToday,
      icon: Activity,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      description: "Users today",
      dialogType: 'active' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Platform Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Overview of user engagement and content performance
          </p>
        </div>
        <Button variant="outline" onClick={fetchAnalytics} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <Card 
            key={stat.title}
            className={`cursor-pointer hover:shadow-md hover:border-primary/50 transition-all ${
              index === statCards.length - 1 ? 'col-span-2 sm:col-span-1' : ''
            }`}
            onClick={() => setStatDialog({ type: stat.dialogType, open: true })}
          >
            <CardContent className="p-4 sm:pt-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Engagement
          </CardTitle>
          <CardDescription>
            User activity over the past 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
              <p className="text-2xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">{analytics.activeUsersWeek}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Active This Week</p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10">
              <p className="text-2xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {analytics.totalUsers > 0
                  ? Math.round((analytics.activeUsersWeek / analytics.totalUsers) * 100)
                  : 0}%
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Weekly Retention</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-pink-600" />
            Skills Overview
          </CardTitle>
          <CardDescription>
            All available skills and their completion stats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillTracks.map((skill) => {
              const stats = skillsAnalytics.find(s => s.slug === skill.slug);
              const branchInfo = branches.find(b => b.id === skill.branch);
              const hasUsers = stats && stats.usersStarted > 0;
              return (
                <div 
                  key={skill.slug} 
                  className={`p-4 rounded-lg border bg-card transition-all ${
                    hasUsers 
                      ? 'hover:shadow-md hover:border-primary/50 cursor-pointer' 
                      : 'hover:shadow-sm'
                  }`}
                  onClick={() => hasUsers && handleSkillClick(skill.slug)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm">{skill.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs shrink-0 ${
                        skill.branch === 'CSE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                        skill.branch === 'CSM' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                        skill.branch === 'CSD' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                        skill.branch === 'CSC' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                        skill.branch === 'ECE' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {branchInfo?.name || skill.branch}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{skill.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      <Badge variant="outline" className="mr-2">{skill.level}</Badge>
                      {skill.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {hasUsers ? (
                        <span className="text-primary flex items-center gap-1">
                          {stats?.usersStarted} users
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{stats?.usersStarted || 0} users</span>
                      )}
                      <Badge variant="secondary">{stats?.totalCompletions || 0} levels</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {selectedSkill?.title} - User Progress
            </DialogTitle>
            <DialogDescription>
              {selectedSkill?.usersStarted} user(s) working on this skill • {selectedSkill?.totalCompletions} total levels completed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedSkill?.users.map((user, index) => {
              const progress = (user.completedLevels.length / user.totalLevels) * 100;
              return (
                <div key={user.userId || index} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={progress === 100 ? "default" : "secondary"}>
                      {user.completedLevels.length}/{user.totalLevels} levels
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress: {progress.toFixed(0)}%</span>
                      {user.lastActiveDate && (
                        <span>Last active: {user.lastActiveDate}</span>
                      )}
                    </div>
                    {user.completedLevels.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Completed levels:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.completedLevels.map(level => (
                            <Badge key={level} variant="outline" className="text-xs">
                              Level {level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Popular Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              Top Searched Topics
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Most popular AI learning queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.popularTopics.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No data yet
              </p>
            ) : (
              <div className="space-y-2">
                {analytics.popularTopics.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border bg-card">
                    <p className="font-medium text-sm truncate flex-1 mr-2">
                      {item.topic.length > 30
                        ? item.topic.substring(0, 30) + "..."
                        : item.topic}
                    </p>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              Most Accessed Materials
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Subjects with highest engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.popularSubjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No data yet
              </p>
            ) : (
              <div className="space-y-2">
                {analytics.popularSubjects.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border bg-card">
                    <p className="font-medium text-sm truncate flex-1 mr-2">{item.title}</p>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Detail Dialog */}
      <Dialog open={statDialog.open} onOpenChange={(open) => setStatDialog({ ...statDialog, open })}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {statDialog.type === 'users' && <><Users className="h-5 w-5 text-blue-600" /> Total Users</>}
              {statDialog.type === 'topics' && <><Search className="h-5 w-5 text-purple-600" /> Topics Searched</>}
              {statDialog.type === 'materials' && <><FileText className="h-5 w-5 text-emerald-600" /> Materials Accessed</>}
              {statDialog.type === 'levels' && <><Target className="h-5 w-5 text-pink-600" /> Levels Completed</>}
              {statDialog.type === 'active' && <><Activity className="h-5 w-5 text-orange-600" /> Active Today</>}
            </DialogTitle>
            <DialogDescription>
              {statDialog.type === 'users' && `${analytics.totalUsers} registered users on the platform`}
              {statDialog.type === 'topics' && `${analytics.totalTopicsSearched} total topic searches`}
              {statDialog.type === 'materials' && `${analytics.totalMaterialsAccessed} materials accessed`}
              {statDialog.type === 'levels' && `${totalSkillsCompleted} skill levels completed across all users`}
              {statDialog.type === 'active' && `${analytics.activeUsersToday} users active today`}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            {/* Topics */}
            {statDialog.type === 'topics' && (
              <div className="space-y-2">
                {analytics.popularTopics.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No topics searched yet</p>
                ) : (
                  analytics.popularTopics.map((topic, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <p className="font-medium flex-1 truncate">{topic.topic}</p>
                      <Badge variant="secondary">{topic.count} searches</Badge>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Materials */}
            {statDialog.type === 'materials' && (
              <div className="space-y-2">
                {analytics.popularSubjects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No materials accessed yet</p>
                ) : (
                  analytics.popularSubjects.map((subject, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <p className="font-medium flex-1">{subject.title}</p>
                      <Badge variant="secondary">{subject.count} views</Badge>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Levels */}
            {statDialog.type === 'levels' && (
              <div className="space-y-2">
                {skillsAnalytics.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No levels completed yet</p>
                ) : (
                  skillsAnalytics.filter(s => s.totalCompletions > 0).map((skill) => (
                    <div key={skill.slug} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{skill.title}</p>
                          <p className="text-sm text-muted-foreground">{skill.usersStarted} user(s) started</p>
                        </div>
                        <Badge variant="secondary">{skill.totalCompletions} levels</Badge>
                      </div>
                      {skill.users.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {skill.users.map((user, i) => (
                            <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                              <span>{user.displayName} ({user.email})</span>
                              <Badge variant="outline" className="text-xs">
                                {user.completedLevels.length}/{user.totalLevels} levels
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Users / Active - show message to check Users tab */}
            {(statDialog.type === 'users' || statDialog.type === 'active') && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {statDialog.type === 'users' 
                    ? `There are ${analytics.totalUsers} registered users.`
                    : `${analytics.activeUsersToday} users are active today.`
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Visit the <strong>Users</strong> tab for detailed user information.
                </p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
