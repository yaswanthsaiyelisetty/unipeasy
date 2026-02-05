"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Loader2,
    Search,
    RefreshCw,
    ExternalLink,
    Lightbulb,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Calendar,
    Link2,
    FileText,
    Trash2,
    Eye,
    CheckCheck,
    Ban,
    Sparkles,
    ArrowRight,
    Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InternshipCategory, categoryLabels } from "@/lib/internships-data";
import { cn } from "@/lib/utils";

interface InternshipSuggestion {
    id: string;
    name: string;
    link: string;
    description: string | null;
    submittedBy: string;
    submittedByUid: string | null;
    submittedByName: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Timestamp | { seconds: number; nanoseconds: number };
    reviewedAt?: Timestamp | { seconds: number; nanoseconds: number };
    reviewNote?: string;
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export default function AdminSuggestionsPage() {
    const { toast } = useToast();
    const [suggestions, setSuggestions] = useState<InternshipSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [selectedSuggestion, setSelectedSuggestion] = useState<InternshipSuggestion | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<InternshipSuggestion | null>(null);
    const [processing, setProcessing] = useState(false);

    // Form data for approving (converting to real internship)
    const [approveFormData, setApproveFormData] = useState({
        name: "",
        details: "",
        link: "",
        category: "tech" as InternshipCategory,
        deadline: "",
        location: "",
        stipend: "",
    });

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "internship_suggestions"));
            const list: InternshipSuggestion[] = [];
            querySnapshot.forEach((docSnap) => {
                list.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                } as InternshipSuggestion);
            });
            // Sort by createdAt (newest first)
            list.sort((a, b) => {
                const aTime = a.createdAt && typeof a.createdAt === 'object' && 'seconds' in a.createdAt
                    ? a.createdAt.seconds
                    : 0;
                const bTime = b.createdAt && typeof b.createdAt === 'object' && 'seconds' in b.createdAt
                    ? b.createdAt.seconds
                    : 0;
                return bTime - aTime;
            });
            setSuggestions(list);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            toast({
                title: "Error",
                description: "Failed to load suggestions. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const formatDate = (timestamp: Timestamp | { seconds: number; nanoseconds: number } | undefined) => {
        if (!timestamp) return "—";
        const date = 'toDate' in timestamp ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleViewSuggestion = (suggestion: InternshipSuggestion) => {
        setSelectedSuggestion(suggestion);
        setViewDialogOpen(true);
    };

    const handleOpenApprove = (suggestion: InternshipSuggestion) => {
        setSelectedSuggestion(suggestion);
        setApproveFormData({
            name: suggestion.name,
            details: suggestion.description || "",
            link: suggestion.link,
            category: "tech",
            deadline: "",
            location: "",
            stipend: "",
        });
        setApproveDialogOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedSuggestion) return;

        if (!approveFormData.name.trim() || !approveFormData.link.trim()) {
            toast({
                title: "Missing Fields",
                description: "Please fill in name and link.",
                variant: "destructive",
            });
            return;
        }

        setProcessing(true);
        try {
            const now = new Date().toISOString();

            // Create the internship in the internships collection
            await addDoc(collection(db, "internships"), {
                name: approveFormData.name.trim(),
                details: approveFormData.details.trim() || "No details provided.",
                link: approveFormData.link.trim(),
                category: approveFormData.category,
                deadline: approveFormData.deadline || null,
                location: approveFormData.location.trim() || null,
                stipend: approveFormData.stipend.trim() || null,
                createdAt: now,
                updatedAt: now,
            });

            // Update the suggestion status
            await updateDoc(doc(db, "internship_suggestions", selectedSuggestion.id), {
                status: "approved",
                reviewedAt: Timestamp.now(),
            });

            setSuggestions((prev) =>
                prev.map((s) =>
                    s.id === selectedSuggestion.id
                        ? { ...s, status: "approved" as const, reviewedAt: Timestamp.now() }
                        : s
                )
            );

            toast({
                title: "Approved & Published! 🎉",
                description: `"${approveFormData.name}" has been added to internships.`,
            });

            setApproveDialogOpen(false);
            setSelectedSuggestion(null);
        } catch (error) {
            console.error("Error approving suggestion:", error);
            toast({
                title: "Error",
                description: "Failed to approve suggestion. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (suggestion: InternshipSuggestion) => {
        setProcessing(true);
        try {
            await updateDoc(doc(db, "internship_suggestions", suggestion.id), {
                status: "rejected",
                reviewedAt: Timestamp.now(),
            });

            setSuggestions((prev) =>
                prev.map((s) =>
                    s.id === suggestion.id
                        ? { ...s, status: "rejected" as const, reviewedAt: Timestamp.now() }
                        : s
                )
            );

            toast({
                title: "Rejected",
                description: `Suggestion "${suggestion.name}" has been rejected.`,
            });
        } catch (error) {
            console.error("Error rejecting suggestion:", error);
            toast({
                title: "Error",
                description: "Failed to reject suggestion. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setProcessing(true);
        try {
            await deleteDoc(doc(db, "internship_suggestions", deleteTarget.id));
            setSuggestions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
            toast({
                title: "Deleted",
                description: `Suggestion "${deleteTarget.name}" has been deleted.`,
            });
        } catch (error) {
            console.error("Error deleting suggestion:", error);
            toast({
                title: "Error",
                description: "Failed to delete suggestion. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessing(false);
            setDeleteTarget(null);
        }
    };

    const filteredSuggestions = useMemo(() => {
        return suggestions.filter((s) => {
            const matchesSearch =
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.submittedByName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === "all" || s.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [suggestions, searchQuery, filterStatus]);

    const statusCounts = useMemo(() => {
        return {
            all: suggestions.length,
            pending: suggestions.filter((s) => s.status === "pending").length,
            approved: suggestions.filter((s) => s.status === "approved").length,
            rejected: suggestions.filter((s) => s.status === "rejected").length,
        };
    }, [suggestions]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                    </Badge>
                );
            case "approved":
                return (
                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 gap-1">
                        <XCircle className="h-3 w-3" />
                        Rejected
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                            <Lightbulb className="h-6 w-6 text-amber-500" />
                        </div>
                        Internship Suggestions
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Review and approve internship suggestions from students
                    </p>
                </div>
                <Button variant="outline" onClick={fetchSuggestions} disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setFilterStatus("all")}>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{statusCounts.all}</p>
                                <p className="text-sm text-muted-foreground">Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className={cn(
                        "cursor-pointer hover:shadow-md transition-all",
                        filterStatus === "pending" && "ring-2 ring-amber-500"
                    )}
                    onClick={() => setFilterStatus("pending")}
                >
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg relative">
                                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                {statusCounts.pending > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                                        {statusCounts.pending}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{statusCounts.pending}</p>
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className={cn(
                        "cursor-pointer hover:shadow-md transition-all",
                        filterStatus === "approved" && "ring-2 ring-emerald-500"
                    )}
                    onClick={() => setFilterStatus("approved")}
                >
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{statusCounts.approved}</p>
                                <p className="text-sm text-muted-foreground">Approved</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className={cn(
                        "cursor-pointer hover:shadow-md transition-all",
                        filterStatus === "rejected" && "ring-2 ring-red-500"
                    )}
                    onClick={() => setFilterStatus("rejected")}
                >
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{statusCounts.rejected}</p>
                                <p className="text-sm text-muted-foreground">Rejected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Suggestions List */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Student Suggestions
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or submitter..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-full sm:w-[280px]"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                                        <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                                        <SelectItem value="approved">Approved ({statusCounts.approved})</SelectItem>
                                        <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3 text-muted-foreground">Loading suggestions...</span>
                        </div>
                    ) : filteredSuggestions.length === 0 ? (
                        <div className="text-center py-12">
                            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground">
                                {searchQuery || filterStatus !== "all" ? "No suggestions found" : "No suggestions yet"}
                            </h3>
                            <p className="text-muted-foreground mt-1">
                                {searchQuery || filterStatus !== "all"
                                    ? "Try adjusting your filters"
                                    : "Student suggestions will appear here"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {filteredSuggestions.map((suggestion, index) => (
                                    <motion.div
                                        key={suggestion.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={cn(
                                            "p-4 rounded-lg border bg-card hover:shadow-md transition-all",
                                            suggestion.status === "pending" && "border-l-4 border-l-amber-500"
                                        )}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <h3 className="font-semibold text-foreground truncate">
                                                                {suggestion.name}
                                                            </h3>
                                                            {getStatusBadge(suggestion.status)}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {suggestion.submittedByName}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {suggestion.submittedBy}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(suggestion.createdAt)}
                                                            </span>
                                                        </div>
                                                        {suggestion.description && (
                                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                                {suggestion.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewSuggestion(suggestion)}
                                                    className="gap-1"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </Button>
                                                {suggestion.status === "pending" && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleOpenApprove(suggestion)}
                                                            className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                                                        >
                                                            <CheckCheck className="h-3.5 w-3.5" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReject(suggestion)}
                                                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            disabled={processing}
                                                        >
                                                            <Ban className="h-3.5 w-3.5" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setDeleteTarget(suggestion)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Suggestion Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-500" />
                            Suggestion Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedSuggestion && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                {getStatusBadge(selectedSuggestion.status)}
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-muted-foreground text-xs">Internship Name</Label>
                                    <p className="font-medium text-foreground">{selectedSuggestion.name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Application Link</Label>
                                    <a
                                        href={selectedSuggestion.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-primary hover:underline"
                                    >
                                        {selectedSuggestion.link}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                                {selectedSuggestion.description && (
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Description</Label>
                                        <p className="text-foreground whitespace-pre-wrap">{selectedSuggestion.description}</p>
                                    </div>
                                )}
                                <hr />
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Submitted By</Label>
                                        <p className="font-medium">{selectedSuggestion.submittedByName}</p>
                                        <p className="text-muted-foreground text-xs">{selectedSuggestion.submittedBy}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Submitted On</Label>
                                        <p className="font-medium">{formatDate(selectedSuggestion.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                                    Close
                                </Button>
                                {selectedSuggestion.status === "pending" && (
                                    <Button
                                        onClick={() => {
                                            setViewDialogOpen(false);
                                            handleOpenApprove(selectedSuggestion);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                                    >
                                        <CheckCheck className="h-4 w-4" />
                                        Approve & Publish
                                    </Button>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCheck className="h-5 w-5 text-emerald-500" />
                            Approve & Publish Internship
                        </DialogTitle>
                        <DialogDescription>
                            Review and edit the details before publishing to the internships page.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="approve-name">Internship Name *</Label>
                            <Input
                                id="approve-name"
                                value={approveFormData.name}
                                onChange={(e) => setApproveFormData({ ...approveFormData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="approve-link">Application Link *</Label>
                            <Input
                                id="approve-link"
                                type="url"
                                value={approveFormData.link}
                                onChange={(e) => setApproveFormData({ ...approveFormData, link: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="approve-details">Details (Markdown supported)</Label>
                            <Textarea
                                id="approve-details"
                                placeholder="Add details about the internship..."
                                value={approveFormData.details}
                                onChange={(e) => setApproveFormData({ ...approveFormData, details: e.target.value })}
                                className="min-h-[150px] font-mono text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="approve-category">Category</Label>
                                <Select
                                    value={approveFormData.category}
                                    onValueChange={(value) => setApproveFormData({ ...approveFormData, category: value as InternshipCategory })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(categoryLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="approve-deadline">Deadline (Optional)</Label>
                                <Input
                                    id="approve-deadline"
                                    type="date"
                                    value={approveFormData.deadline}
                                    onChange={(e) => setApproveFormData({ ...approveFormData, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="approve-location">Location (Optional)</Label>
                                <Input
                                    id="approve-location"
                                    placeholder="e.g., Remote, Bangalore"
                                    value={approveFormData.location}
                                    onChange={(e) => setApproveFormData({ ...approveFormData, location: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="approve-stipend">Stipend (Optional)</Label>
                                <Input
                                    id="approve-stipend"
                                    placeholder="e.g., ₹15,000/month"
                                    value={approveFormData.stipend}
                                    onChange={(e) => setApproveFormData({ ...approveFormData, stipend: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <CheckCheck className="h-4 w-4" />
                                    Approve & Publish
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Suggestion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the suggestion &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={processing}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
