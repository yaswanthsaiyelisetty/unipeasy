"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Star,
  Trash2,
  CheckCircle,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  Filter,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedbackItem {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  rating?: number;
  ratingLabel?: string;
  category?: string;
  message?: string;
  title?: string;
  type: string;
  status: string;
  contentId?: string;
  contentType?: string;
  topic?: string;
  createdAt: Timestamp;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);

  // Real-time listener for feedback
  useEffect(() => {
    const feedbackRef = collection(db, "feedback");
    const q = query(feedbackRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: FeedbackItem[] = [];
        snapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data(),
          } as FeedbackItem);
        });
        setFeedback(items);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching feedback:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter feedback
  const filteredFeedback = React.useMemo(() => {
    return feedback.filter((item) => {
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      return true;
    });
  }, [feedback, filterCategory, filterStatus]);

  // Analytics calculations
  const analytics = React.useMemo(() => {
    const total = feedback.length;
    const withRating = feedback.filter((f) => f.rating !== undefined);
    const avgRating =
      withRating.length > 0
        ? withRating.reduce((sum, f) => sum + (f.rating || 0), 0) / withRating.length
        : 0;

    const categoryCount: Record<string, number> = {};
    feedback.forEach((f) => {
      if (f.category) {
        categoryCount[f.category] = (categoryCount[f.category] || 0) + 1;
      }
    });

    const topCategory = Object.entries(categoryCount).sort(
      ([, a], [, b]) => b - a
    )[0];

    const newCount = feedback.filter((f) => f.status === "new").length;

    return {
      total,
      avgRating: avgRating.toFixed(1),
      topCategory: topCategory ? topCategory[0] : "N/A",
      topCategoryCount: topCategory ? topCategory[1] : 0,
      newCount,
    };
  }, [feedback]);

  // Handle mark as resolved
  const handleMarkResolved = async (id: string) => {
    try {
      await updateDoc(doc(db, "feedback", id), {
        status: "resolved",
      });
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
  };

  // Handle mark as new (unresolve)
  const handleMarkNew = async (id: string) => {
    try {
      await updateDoc(doc(db, "feedback", id), {
        status: "new",
      });
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!feedbackToDelete) return;

    try {
      await deleteDoc(doc(db, "feedback", feedbackToDelete));
      setIsDeleteDialogOpen(false);
      setFeedbackToDelete(null);
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  const getCategoryBadge = (category?: string) => {
    const colors: Record<string, string> = {
      content: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      ai: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      performance: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      ui: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      feature: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      bug: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };

    const labels: Record<string, string> = {
      content: "Content Quality",
      ai: "AI Accuracy",
      performance: "Performance",
      ui: "User Interface",
      feature: "Feature Request",
      bug: "Bug Report",
      other: "Other",
    };

    return (
      <Badge className={cn("font-medium", colors[category || "other"])}>
        {labels[category || "other"] || category || "Unknown"}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      "quick-rating": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      "detailed-feedback": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      "feature-request": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      "success-survey": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };

    const labels: Record<string, string> = {
      "quick-rating": "Quick Rating",
      "detailed-feedback": "Detailed",
      "feature-request": "Feature",
      "success-survey": "Survey",
    };

    return (
      <Badge variant="outline" className={cn("text-xs", colors[type])}>
        {labels[type] || type}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            )}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Feedback Results</h1>
        <p className="text-muted-foreground">
          Monitor and respond to student feedback in real-time
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{analytics.total}</p>
                <p className="text-sm text-muted-foreground">Total Feedbacks</p>
              </div>
            </div>
            {analytics.newCount > 0 && (
              <Badge className="mt-3 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                {analytics.newCount} new
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{analytics.avgRating}</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
            <div className="mt-3">{renderStars(parseFloat(analytics.avgRating))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-lg font-bold capitalize">
                  {analytics.topCategory}
                </p>
                <p className="text-sm text-muted-foreground">
                  Most Reported Issue
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {analytics.topCategoryCount} reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Feedback
            </CardTitle>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="content">Content Quality</SelectItem>
                  <SelectItem value="ai">AI Accuracy</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="ui">User Interface</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardContent className="p-0">
          {filteredFeedback.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No feedback yet</h3>
              <p className="text-muted-foreground">
                Feedback from students will appear here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn(
                      item.status === "new" && "bg-orange-50/50 dark:bg-orange-900/10"
                    )}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {item.userName || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {item.userEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(item.type)}</TableCell>
                    <TableCell>{getCategoryBadge(item.category)}</TableCell>
                    <TableCell>
                      {item.rating !== undefined ? (
                        <div className="flex items-center gap-1">
                          {renderStars(item.rating)}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({item.rating})
                          </span>
                        </div>
                      ) : item.ratingLabel ? (
                        <Badge variant="outline" className="capitalize">
                          {item.ratingLabel}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm truncate">
                        {item.title || item.message || item.topic || "-"}
                      </p>
                      {(item.message || item.title) && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => setSelectedFeedback(item)}
                        >
                          View full
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === "resolved" ? "secondary" : "default"}
                        className={cn(
                          item.status === "new" &&
                            "bg-orange-500 hover:bg-orange-600"
                        )}
                      >
                        {item.status === "resolved" ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            New
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.createdAt?.toDate
                        ? format(item.createdAt.toDate(), "MMM d, h:mm a")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {item.status === "new" ? (
                            <DropdownMenuItem
                              onClick={() => handleMarkResolved(item.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Resolved
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleMarkNew(item.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Mark as New
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setSelectedFeedback(item)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setFeedbackToDelete(item.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog
        open={!!selectedFeedback}
        onOpenChange={() => setSelectedFeedback(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              From {selectedFeedback?.userName || selectedFeedback?.userEmail}
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <div>{getTypeBadge(selectedFeedback.type)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <div>{getCategoryBadge(selectedFeedback.category)}</div>
                </div>
                {selectedFeedback.rating !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <div className="flex items-center gap-2">
                      {renderStars(selectedFeedback.rating)}
                      <span>({selectedFeedback.rating}/5)</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedFeedback.status === "resolved"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {selectedFeedback.status}
                  </Badge>
                </div>
              </div>

              {selectedFeedback.title && (
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedFeedback.title}</p>
                </div>
              )}

              {selectedFeedback.message && (
                <div>
                  <p className="text-sm text-muted-foreground">Message</p>
                  <p className="whitespace-pre-wrap bg-muted p-3 rounded-lg">
                    {selectedFeedback.message}
                  </p>
                </div>
              )}

              {selectedFeedback.topic && (
                <div>
                  <p className="text-sm text-muted-foreground">Topic</p>
                  <p>{selectedFeedback.topic}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p>
                  {selectedFeedback.createdAt?.toDate
                    ? format(
                        selectedFeedback.createdAt.toDate(),
                        "MMMM d, yyyy 'at' h:mm a"
                      )
                    : "-"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedFeedback?.status === "new" ? (
              <Button
                onClick={() => {
                  handleMarkResolved(selectedFeedback.id);
                  setSelectedFeedback(null);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Resolved
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedFeedback) handleMarkNew(selectedFeedback.id);
                  setSelectedFeedback(null);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Mark as New
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feedback</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this feedback? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setFeedbackToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
