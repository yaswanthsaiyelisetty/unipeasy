"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserAnalytics } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  BookOpen,
  FileText,
  Calendar,
  Mail,
  TrendingUp,
  Target,
  Trophy,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { branches, getSkillTrack } from "@/lib/skills-data";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserAnalytics | null>(null);
  const [statDialog, setStatDialog] = useState<{
    type: 'users' | 'active' | 'topics' | 'materials' | 'levels' | null;
    open: boolean;
  }>({ type: null, open: false });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "userAnalytics"));
      const usersList: UserAnalytics[] = [];
      querySnapshot.forEach((doc) => {
        usersList.push(doc.data() as UserAnalytics);
      });
      // Sort by last active date (most recent first)
      usersList.sort((a, b) => 
        new Date(b.lastActiveDate).getTime() - new Date(a.lastActiveDate).getTime()
      );
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate unique topics count from history
  const getUniqueTopicsCount = (user: UserAnalytics) => {
    if (!user.topicsHistory || user.topicsHistory.length === 0) return 0;
    const uniqueTopics = new Set(user.topicsHistory.filter(t => t.topic).map(t => t.topic.toLowerCase().trim()));
    return uniqueTopics.size;
  };

  // Calculate total unique topics across all users
  const totalUniqueTopics = users.reduce((sum, u) => sum + getUniqueTopicsCount(u), 0);

  // Get all topics with user info
  const getAllTopicsWithUsers = () => {
    const topicsMap: Record<string, { topic: string; users: { name: string; email: string; timestamp: string }[] }> = {};
    users.forEach(user => {
      (user.topicsHistory || []).forEach(t => {
        if (!t.topic) return;
        const key = t.topic.toLowerCase().trim();
        if (!topicsMap[key]) {
          topicsMap[key] = { topic: t.topic, users: [] };
        }
        topicsMap[key].users.push({
          name: user.displayName || 'Unknown',
          email: user.email,
          timestamp: t.timestamp,
        });
      });
    });
    return Object.values(topicsMap).sort((a, b) => b.users.length - a.users.length);
  };

  // Get all materials with user info
  const getAllMaterialsWithUsers = () => {
    const materialsMap: Record<string, { title: string; users: { name: string; email: string; timestamp: string }[] }> = {};
    users.forEach(user => {
      (user.materialsHistory || []).forEach(m => {
        const key = m.subjectId;
        if (!materialsMap[key]) {
          materialsMap[key] = { title: m.subjectTitle, users: [] };
        }
        materialsMap[key].users.push({
          name: user.displayName || 'Unknown',
          email: user.email,
          timestamp: m.timestamp,
        });
      });
    });
    return Object.values(materialsMap).sort((a, b) => b.users.length - a.users.length);
  };

  // Get all skill levels with user info
  const getAllLevelsWithUsers = () => {
    const levelsData: { skillTitle: string; userName: string; email: string; completedLevels: number[]; totalLevels: number }[] = [];
    users.forEach(user => {
      Object.values(user.skillsProgress || {}).forEach((progress: any) => {
        if (progress.completedLevels?.length > 0) {
          levelsData.push({
            skillTitle: progress.skillTitle || progress.skillSlug,
            userName: user.displayName || 'Unknown',
            email: user.email,
            completedLevels: progress.completedLevels,
            totalLevels: progress.totalLevels || 30,
          });
        }
      });
    });
    return levelsData;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  const isActiveToday = (lastActive: string) => {
    const today = new Date().toISOString().split("T")[0];
    return lastActive === today;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            View all registered users and their learning analytics
          </p>
        </div>
        <Button variant="outline" onClick={fetchUsers} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
          onClick={() => setStatDialog({ type: 'users', open: true })}
        >
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{users.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
          onClick={() => setStatDialog({ type: 'active', open: true })}
        >
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {users.filter((u) => isActiveToday(u.lastActiveDate)).length}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
          onClick={() => setStatDialog({ type: 'topics', open: true })}
        >
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {totalUniqueTopics}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Topics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
          onClick={() => setStatDialog({ type: 'materials', open: true })}
        >
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {users.reduce((sum, u) => sum + (u.totalMaterialsAccessed || 0), 0)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Materials</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="col-span-2 sm:col-span-1 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
          onClick={() => setStatDialog({ type: 'levels', open: true })}
        >
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {users.reduce((sum, u) => sum + (u.totalSkillLevelsCompleted || 0), 0)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Levels Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users ({filteredUsers.length})
            </CardTitle>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">
                {searchQuery ? "No users found" : "No users yet"}
              </h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Users will appear here once they sign up"}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {filteredUsers.map((user) => (
                  <div 
                    key={user.userId} 
                    className="p-4 rounded-lg border bg-card cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {isActiveToday(user.lastActiveDate) && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0"></span>
                          )}
                          <p className="font-medium truncate">{user.displayName || "Unknown"}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {getUniqueTopicsCount(user)} topics
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {user.totalMaterialsAccessed || 0} materials
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        <Target className="h-3 w-3 mr-1" />
                        {user.totalSkillLevelsCompleted || 0} levels
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last active: {formatDate(user.lastActiveDate)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold text-center">Topics</TableHead>
                      <TableHead className="font-semibold text-center">Materials</TableHead>
                      <TableHead className="font-semibold text-center">Levels</TableHead>
                      <TableHead className="font-semibold">Last Active</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.userId} className="hover:bg-muted/30">
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.displayName || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{getUniqueTopicsCount(user)}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{user.totalMaterialsAccessed || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            <Target className="h-3 w-3 mr-1" />
                            {user.totalSkillLevelsCompleted || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isActiveToday(user.lastActiveDate) && (
                              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            )}
                            <span className={isActiveToday(user.lastActiveDate) ? "text-emerald-600 font-medium" : ""}>
                              {formatDate(user.lastActiveDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Detailed analytics for {selectedUser?.displayName || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* User Info */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {(selectedUser.displayName || selectedUser.email || "U")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{selectedUser.displayName || "Unknown User"}</h3>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedUser.email}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Joined: {formatDate(selectedUser.joinedDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className={`text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 transition-all ${
                      selectedUser.topicsHistory && selectedUser.topicsHistory.length > 0 
                        ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' 
                        : ''
                    }`}
                    onClick={() => {
                      if (selectedUser.topicsHistory && selectedUser.topicsHistory.length > 0) {
                        document.getElementById('user-topics-section')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{getUniqueTopicsCount(selectedUser)}</p>
                    <p className="text-xs text-muted-foreground">Topics Learned</p>
                  </div>
                  <div 
                    className={`text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 transition-all ${
                      selectedUser.materialsHistory && selectedUser.materialsHistory.length > 0 
                        ? 'cursor-pointer hover:ring-2 hover:ring-emerald-400' 
                        : ''
                    }`}
                    onClick={() => {
                      if (selectedUser.materialsHistory && selectedUser.materialsHistory.length > 0) {
                        document.getElementById('user-materials-section')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <FileText className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedUser.totalMaterialsAccessed || 0}</p>
                    <p className="text-xs text-muted-foreground">Materials</p>
                  </div>
                  <div 
                    className={`text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 transition-all ${
                      selectedUser.skillsProgress && Object.keys(selectedUser.skillsProgress).length > 0 
                        ? 'cursor-pointer hover:ring-2 hover:ring-purple-400' 
                        : ''
                    }`}
                    onClick={() => {
                      if (selectedUser.skillsProgress && Object.keys(selectedUser.skillsProgress).length > 0) {
                        document.getElementById('user-skills-section')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <Target className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedUser.totalSkillLevelsCompleted || 0}</p>
                    <p className="text-xs text-muted-foreground">Skills Levels</p>
                  </div>
                </div>

                {/* Skills Progress */}
                {selectedUser.skillsProgress && Object.keys(selectedUser.skillsProgress).length > 0 && (
                  <div id="user-skills-section">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      Skills Progress
                    </h4>
                    <div className="space-y-3">
                      {Object.values(selectedUser.skillsProgress).map((skill) => {
                        const skillData = getSkillTrack(skill.skillSlug);
                        const progress = Math.round((skill.completedLevels.length / skill.totalLevels) * 100);
                        const branchInfo = branches.find(b => b.id === skill.branch);
                        return (
                          <div key={skill.skillSlug} className="p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{skill.skillTitle}</span>
                                {skill.branch && (
                                  <Badge variant="outline" className="text-xs">
                                    {branchInfo?.name || skill.branch}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {skill.completedLevels.length}/{skill.totalLevels}
                                </span>
                                {progress === 100 && (
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              Last active: {new Date(skill.lastActiveDate).toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Topics */}
                {selectedUser.topicsHistory && selectedUser.topicsHistory.length > 0 && (
                  <div id="user-topics-section">
                    <h4 className="font-semibold mb-3">Recent Topics Searched</h4>
                    <div className="space-y-2">
                      {/* Show unique topics only */}
                      {[...new Map(selectedUser.topicsHistory.filter(e => e.topic).map(e => [e.topic.toLowerCase(), e])).values()]
                        .slice(0, 10)
                        .map((entry, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm">
                          <span className="truncate flex-1">{entry.topic}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Materials */}
                {selectedUser.materialsHistory && selectedUser.materialsHistory.length > 0 && (
                  <div id="user-materials-section">
                    <h4 className="font-semibold mb-3">Recent Materials Accessed</h4>
                    <div className="space-y-2">
                      {selectedUser.materialsHistory.slice(0, 10).map((entry, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm">
                          <div>
                            <p className="font-medium">{entry.subjectTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              Unit {entry.unitNumber}: {entry.unitTitle}
                            </p>
                          </div>
                          <Badge variant="outline">{entry.branch}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats Detail Dialog */}
      <Dialog open={statDialog.open} onOpenChange={(open) => setStatDialog({ ...statDialog, open })}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {statDialog.type === 'users' && <><Users className="h-5 w-5 text-blue-600" /> All Users</>}
              {statDialog.type === 'active' && <><TrendingUp className="h-5 w-5 text-emerald-600" /> Active Today</>}
              {statDialog.type === 'topics' && <><BookOpen className="h-5 w-5 text-purple-600" /> Topics Searched</>}
              {statDialog.type === 'materials' && <><FileText className="h-5 w-5 text-orange-600" /> Materials Accessed</>}
              {statDialog.type === 'levels' && <><Target className="h-5 w-5 text-pink-600" /> Levels Completed</>}
            </DialogTitle>
            <DialogDescription>
              {statDialog.type === 'users' && `${users.length} registered users`}
              {statDialog.type === 'active' && `${users.filter(u => isActiveToday(u.lastActiveDate)).length} users active today`}
              {statDialog.type === 'topics' && `${totalUniqueTopics} unique topics searched`}
              {statDialog.type === 'materials' && `${users.reduce((sum, u) => sum + (u.totalMaterialsAccessed || 0), 0)} materials accessed`}
              {statDialog.type === 'levels' && `${users.reduce((sum, u) => sum + (u.totalSkillLevelsCompleted || 0), 0)} skill levels completed`}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            {/* All Users */}
            {statDialog.type === 'users' && (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">{user.displayName || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Joined {formatDate(user.joinedDate)}</p>
                      {isActiveToday(user.lastActiveDate) && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Active</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active Today */}
            {statDialog.type === 'active' && (
              <div className="space-y-2">
                {users.filter(u => isActiveToday(u.lastActiveDate)).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No users active today</p>
                ) : (
                  users.filter(u => isActiveToday(u.lastActiveDate)).map((user) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <div>
                          <p className="font-medium">{user.displayName || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <Badge variant="secondary">{getUniqueTopicsCount(user)} topics</Badge>
                        <Badge variant="secondary" className="ml-2">{user.totalSkillLevelsCompleted || 0} levels</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Topics */}
            {statDialog.type === 'topics' && (
              <div className="space-y-2">
                {getAllTopicsWithUsers().length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No topics searched yet</p>
                ) : (
                  getAllTopicsWithUsers().map((topic, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium flex-1">{topic.topic}</p>
                        <Badge variant="secondary">{topic.users.length} search(es)</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {topic.users.slice(0, 5).map((u, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {u.name}
                          </Badge>
                        ))}
                        {topic.users.length > 5 && (
                          <Badge variant="outline" className="text-xs">+{topic.users.length - 5} more</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Materials */}
            {statDialog.type === 'materials' && (
              <div className="space-y-2">
                {getAllMaterialsWithUsers().length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No materials accessed yet</p>
                ) : (
                  getAllMaterialsWithUsers().map((material, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium flex-1">{material.title}</p>
                        <Badge variant="secondary">{material.users.length} access(es)</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {material.users.slice(0, 5).map((u, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {u.name}
                          </Badge>
                        ))}
                        {material.users.length > 5 && (
                          <Badge variant="outline" className="text-xs">+{material.users.length - 5} more</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Levels */}
            {statDialog.type === 'levels' && (
              <div className="space-y-2">
                {getAllLevelsWithUsers().length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No levels completed yet</p>
                ) : (
                  getAllLevelsWithUsers().map((item, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{item.skillTitle}</p>
                          <p className="text-sm text-muted-foreground">{item.userName} ({item.email})</p>
                        </div>
                        <Badge variant="secondary">{item.completedLevels.length}/{item.totalLevels} levels</Badge>
                      </div>
                      <Progress value={(item.completedLevels.length / item.totalLevels) * 100} className="h-2 mb-2" />
                      <div className="flex flex-wrap gap-1">
                        {item.completedLevels.map((level) => (
                          <Badge key={level} variant="outline" className="text-xs">
                            Level {level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
