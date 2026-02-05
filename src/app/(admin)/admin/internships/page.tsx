"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Internship, InternshipCategory, categoryLabels, categoryColors, formatDeadline } from "@/lib/internships-data";
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
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Search,
    Briefcase,
    RefreshCw,
    ExternalLink,
    Calendar,
    CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InternshipFormData {
    name: string;
    details: string;
    link: string;
    category: InternshipCategory;
    deadline: string;
    location: string;
    stipend: string;
}

const initialFormData: InternshipFormData = {
    name: "",
    details: "",
    link: "",
    category: "tech",
    deadline: "",
    location: "",
    stipend: "",
};

export default function AdminInternshipsPage() {
    const { toast } = useToast();
    const [internships, setInternships] = useState<Internship[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<InternshipFormData>(initialFormData);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Internship | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchInternships = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "internships"));
            const list: Internship[] = [];
            querySnapshot.forEach((docSnap) => {
                list.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                } as Internship);
            });
            // Sort by createdAt (newest first)
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setInternships(list);
        } catch (error) {
            console.error("Error fetching internships:", error);
            toast({
                title: "Error",
                description: "Failed to load internships. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInternships();
    }, []);

    const handleOpenDialog = (internship?: Internship) => {
        if (internship) {
            setEditingId(internship.id);
            setFormData({
                name: internship.name,
                details: internship.details,
                link: internship.link,
                category: internship.category,
                deadline: internship.deadline || "",
                location: internship.location || "",
                stipend: internship.stipend || "",
            });
        } else {
            setEditingId(null);
            setFormData(initialFormData);
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.details.trim() || !formData.link.trim()) {
            toast({
                title: "Missing Fields",
                description: "Please fill in name, details, and link.",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        try {
            const now = new Date().toISOString();
            const data = {
                name: formData.name.trim(),
                details: formData.details.trim(),
                link: formData.link.trim(),
                category: formData.category,
                deadline: formData.deadline || null,
                location: formData.location.trim() || null,
                stipend: formData.stipend.trim() || null,
                updatedAt: now,
            };

            if (editingId) {
                await updateDoc(doc(db, "internships", editingId), data);
                setInternships((prev) =>
                    prev.map((i) =>
                        i.id === editingId ? { ...i, ...data } : i
                    )
                );
                toast({
                    title: "Updated",
                    description: `"${formData.name}" has been updated.`,
                });
            } else {
                const newDoc = await addDoc(collection(db, "internships"), {
                    ...data,
                    createdAt: now,
                });
                setInternships((prev) => [
                    { id: newDoc.id, ...data, createdAt: now } as Internship,
                    ...prev,
                ]);
                toast({
                    title: "Added",
                    description: `"${formData.name}" has been added.`,
                });
            }

            setDialogOpen(false);
            setFormData(initialFormData);
            setEditingId(null);
        } catch (error) {
            console.error("Error saving internship:", error);
            toast({
                title: "Error",
                description: "Failed to save internship. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            await deleteDoc(doc(db, "internships", deleteTarget.id));
            setInternships((prev) => prev.filter((i) => i.id !== deleteTarget.id));
            toast({
                title: "Deleted",
                description: `"${deleteTarget.name}" has been deleted.`,
            });
        } catch (error) {
            console.error("Error deleting internship:", error);
            toast({
                title: "Error",
                description: "Failed to delete internship. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const filteredInternships = internships.filter(
        (i) =>
            i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
            categoryLabels[i.category].toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Internships Manager</h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Add and manage verified internships for students
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Internship
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                                <Briefcase className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{internships.length}</p>
                                <p className="text-sm text-muted-foreground">Total Internships</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {internships.filter((i) => i.category === "tech").length}
                                </p>
                                <p className="text-sm text-muted-foreground">Tech</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {internships.filter((i) => i.deadline && new Date(i.deadline) > new Date()).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
                                <ExternalLink className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {internships.filter((i) => i.category !== "tech").length}
                                </p>
                                <p className="text-sm text-muted-foreground">Non-Tech</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            All Internships
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search internships..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-full sm:w-[250px]"
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={fetchInternships} className="shrink-0 self-end sm:self-auto">
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3 text-muted-foreground">Loading internships...</span>
                        </div>
                    ) : filteredInternships.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground">
                                {searchQuery ? "No internships found" : "No internships yet"}
                            </h3>
                            <p className="text-muted-foreground mt-1">
                                {searchQuery ? "Try a different search term" : "Click 'Add Internship' to get started"}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="sm:hidden space-y-3">
                                {filteredInternships.map((internship) => (
                                    <div key={internship.id} className="p-4 rounded-lg border bg-card">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-medium text-sm">{internship.name}</h3>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(internship)}>
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(internship)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            <Badge className={categoryColors[internship.category]}>
                                                {categoryLabels[internship.category]}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            {internship.deadline && <span>{formatDeadline(internship.deadline)}</span>}
                                            <a href={internship.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                View Link
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="font-semibold">Name</TableHead>
                                            <TableHead className="font-semibold">Category</TableHead>
                                            <TableHead className="font-semibold">Deadline</TableHead>
                                            <TableHead className="font-semibold">Link</TableHead>
                                            <TableHead className="font-semibold text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInternships.map((internship) => (
                                            <TableRow key={internship.id} className="hover:bg-muted/30">
                                                <TableCell className="font-medium">{internship.name}</TableCell>
                                                <TableCell>
                                                    <Badge className={categoryColors[internship.category]}>
                                                        {categoryLabels[internship.category]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {internship.deadline ? formatDeadline(internship.deadline) : "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <a
                                                        href={internship.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        Visit <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(internship)}>
                                                            <Pencil className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(internship)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
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

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Internship" : "Add New Internship"}</DialogTitle>
                        <DialogDescription>
                            {editingId
                                ? "Update the internship details below."
                                : "Fill in the details of the verified internship. The details field supports Markdown formatting."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Company / Internship Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Google Summer of Code 2026"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="details">Details * (Markdown supported)</Label>
                            <Textarea
                                id="details"
                                placeholder={`# About the Internship

**Requirements:**
- Python programming
- Communication skills

**Benefits:**
- Certificate provided
- Stipend: ₹15,000/month`}
                                value={formData.details}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                className="min-h-[200px] font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                Use Markdown for headings (#), bold (**text**), lists (- item), and more.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link">Application Link *</Label>
                            <Input
                                id="link"
                                type="url"
                                placeholder="https://example.com/apply"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value as InternshipCategory })}
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
                                <Label htmlFor="deadline">Deadline (Optional)</Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Location (Optional)</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g., Remote, Bangalore"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stipend">Stipend (Optional)</Label>
                                <Input
                                    id="stipend"
                                    placeholder="e.g., ₹15,000/month, Unpaid"
                                    value={formData.stipend}
                                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : editingId ? (
                                "Update"
                            ) : (
                                "Add Internship"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Internship</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleting ? (
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
