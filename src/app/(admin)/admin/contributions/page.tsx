"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import {
    Loader2,
    Search,
    RefreshCw,
    BookOpen,
    Phone,
    User,
    Calendar,
    Trash2,
    CheckCircle2,
    Clock,
    XCircle,
    GraduationCap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MaterialContribution {
    id: string;
    contributorName?: string;
    subjectName: string;
    mobileNumber: string;
    branch: string;
    year: string;
    submittedBy: string;
    submittedByName: string;
    submittedByUid: string | null;
    status: "pending" | "contacted" | "completed";
    createdAt: Timestamp | { seconds: number; nanoseconds: number };
}

type FilterStatus = "all" | "pending" | "contacted" | "completed";

export default function AdminContributionsPage() {
    const { toast } = useToast();
    const [contributions, setContributions] = useState<MaterialContribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [deleteTarget, setDeleteTarget] = useState<MaterialContribution | null>(null);
    const [processing, setProcessing] = useState(false);

    const fetchContributions = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "material_contributions"));
            const list: MaterialContribution[] = [];
            querySnapshot.forEach((docSnap) => {
                list.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                } as MaterialContribution);
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
            setContributions(list);
        } catch (error) {
            console.error("Error fetching contributions:", error);
            toast({
                title: "Error",
                description: "Failed to load contributions. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContributions();
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

    const handleStatusChange = async (contribution: MaterialContribution, newStatus: "contacted" | "completed") => {
        setProcessing(true);
        try {
            await updateDoc(doc(db, "material_contributions", contribution.id), {
                status: newStatus,
            });
            setContributions((prev) =>
                prev.map((c) =>
                    c.id === contribution.id ? { ...c, status: newStatus } : c
                )
            );
            toast({
                title: "Status Updated",
                description: `Marked as ${newStatus}.`,
            });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: "Error",
                description: "Failed to update status.",
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
            await deleteDoc(doc(db, "material_contributions", deleteTarget.id));
            setContributions((prev) => prev.filter((c) => c.id !== deleteTarget.id));
            toast({
                title: "Deleted",
                description: "Contribution request has been deleted.",
            });
        } catch (error) {
            console.error("Error deleting:", error);
            toast({
                title: "Error",
                description: "Failed to delete. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessing(false);
            setDeleteTarget(null);
        }
    };

    const filteredContributions = useMemo(() => {
        return contributions.filter((c) => {
            const matchesSearch =
                c.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.mobileNumber.includes(searchQuery) ||
                c.submittedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.contributorName && c.contributorName.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus = filterStatus === "all" || c.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [contributions, searchQuery, filterStatus]);

    const statusCounts = useMemo(() => {
        return {
            all: contributions.length,
            pending: contributions.filter((c) => c.status === "pending").length,
            contacted: contributions.filter((c) => c.status === "contacted").length,
            completed: contributions.filter((c) => c.status === "completed").length,
        };
    }, [contributions]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                    </Badge>
                );
            case "contacted":
                return (
                    <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1">
                        <Phone className="h-3 w-3" />
                        Contacted
                    </Badge>
                );
            case "completed":
                return (
                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
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
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                            <BookOpen className="h-6 w-6 text-emerald-500" />
                        </div>
                        Material Contributions
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Students who want to contribute study materials
                    </p>
                </div>
                <Button variant="outline" onClick={fetchContributions} disabled={loading}>
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
                                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                        filterStatus === "contacted" && "ring-2 ring-blue-500"
                    )}
                    onClick={() => setFilterStatus("contacted")}
                >
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{statusCounts.contacted}</p>
                                <p className="text-sm text-muted-foreground">Contacted</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className={cn(
                        "cursor-pointer hover:shadow-md transition-all",
                        filterStatus === "completed" && "ring-2 ring-emerald-500"
                    )}
                    onClick={() => setFilterStatus("completed")}
                >
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{statusCounts.completed}</p>
                                <p className="text-sm text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Contributions List */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-emerald-500" />
                            Contribution Requests
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by subject or phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-full sm:w-[280px]"
                                />
                            </div>
                            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                                    <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                                    <SelectItem value="contacted">Contacted ({statusCounts.contacted})</SelectItem>
                                    <SelectItem value="completed">Completed ({statusCounts.completed})</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3 text-muted-foreground">Loading contributions...</span>
                        </div>
                    ) : filteredContributions.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground">
                                {searchQuery || filterStatus !== "all" ? "No contributions found" : "No contributions yet"}
                            </h3>
                            <p className="text-muted-foreground mt-1">
                                {searchQuery || filterStatus !== "all"
                                    ? "Try adjusting your filters"
                                    : "Contribution requests will appear here"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {filteredContributions.map((contribution, index) => (
                                    <motion.div
                                        key={contribution.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={cn(
                                            "p-4 rounded-lg border bg-card hover:shadow-md transition-all",
                                            contribution.status === "pending" && "border-l-4 border-l-amber-500"
                                        )}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                    <h3 className="font-semibold text-foreground">
                                                        {contribution.subjectName}
                                                    </h3>
                                                    {getStatusBadge(contribution.status)}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        <a href={`tel:${contribution.mobileNumber}`} className="text-primary hover:underline font-medium">
                                                            {contribution.mobileNumber}
                                                        </a>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {contribution.contributorName || contribution.submittedByName}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <GraduationCap className="h-3 w-3" />
                                                        {contribution.branch.toUpperCase()} - {contribution.year}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(contribution.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {contribution.status === "pending" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusChange(contribution, "contacted")}
                                                        disabled={processing}
                                                        className="gap-1"
                                                    >
                                                        <Phone className="h-3.5 w-3.5" />
                                                        Mark Contacted
                                                    </Button>
                                                )}
                                                {contribution.status === "contacted" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleStatusChange(contribution, "completed")}
                                                        disabled={processing}
                                                        className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Mark Complete
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setDeleteTarget(contribution)}
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

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Contribution Request</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the contribution request for &quot;{deleteTarget?.subjectName}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={processing}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
