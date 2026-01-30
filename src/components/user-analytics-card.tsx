"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  FileText,
  TrendingUp,
  Calendar,
  Target,
  History,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getUserAnalytics, UserAnalytics } from "@/lib/analytics";

export function UserAnalyticsCard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (user?.uid) {
        const data = await getUserAnalytics(user.uid);
        setAnalytics(data);
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Learning Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Start learning to see your stats here!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate unique topics count
  const uniqueTopicsCount = analytics.topicsHistory 
    ? [...new Set(analytics.topicsHistory.map(e => e.topic.toLowerCase()))].length 
    : 0;

  const stats = [
    {
      label: "Topics Learned",
      value: uniqueTopicsCount,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-950/30",
    },
    {
      label: "Materials Accessed",
      value: analytics.totalMaterialsAccessed,
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-950/30",
    },
    {
      label: "Skills Completed",
      value: analytics.totalSkillLevelsCompleted || 0,
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-950/30",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Your Learning Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-lg bg-muted/50"
            >
              <div
                className={`inline-flex p-2 rounded-lg ${stat.bg} mb-2`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Topics */}
        {analytics.topicsHistory && analytics.topicsHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {/* Show unique topics only */}
              {[...new Map(analytics.topicsHistory.map(e => [e.topic.toLowerCase(), e])).values()]
                .slice(0, 8)
                .map((entry, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {entry.topic.length > 30
                    ? entry.topic.substring(0, 30) + "..."
                    : entry.topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Materials */}
        {analytics.materialsHistory && analytics.materialsHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recent Materials
            </h4>
            <ScrollArea className="h-[120px]">
              <div className="space-y-2">
                {analytics.materialsHistory.slice(0, 5).map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {entry.subjectTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Unit {entry.unitNumber}: {entry.unitTitle}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {entry.branch}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Member Since */}
        <div className="flex items-center justify-between pt-4 border-t border-border text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Member since {new Date(analytics.joinedDate).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Last active: {analytics.lastActiveDate}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
