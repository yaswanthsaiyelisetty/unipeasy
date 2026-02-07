"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Hackathon, HackathonCategory, categoryLabels, categoryColors, formatDeadline } from "@/lib/hackathons-data";
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
    Trophy,
    RefreshCw,
    ExternalLink,
    Calendar,
    CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HackathonFormData {
    name: string;
    details: string;
    link: string;
    category: HackathonCategory;
    deadline: string;
    location: string;
    prizePool: string;
    teamSize: string;
}

const initialFormData: HackathonFormData = {
    name: "",
    details: "",
    link: "",
    category: "tech",
    deadline: "",
    location: "",
    prizePool: "",
    teamSize: "",
};

export default function AdminHackathonsPage() {
    const { toast } = useToast();
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<HackathonFormData>(initialFormData);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Hackathon | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchHackathons = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "hackathons"));
            const list: Hackathon[] = [];
            querySnapshot.forEach((docSnap) => {
                list.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                } as Hackathon);
            });
            // Sort by createdAt (newest first)
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setHackathons(list);
        } catch (error) {
            console.error("Error fetching hackathons:", error);
            toast({
                title: "Error",
                description: "Failed to load hackathons. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHackathons();
    }, []);

    const handleOpenDialog = (hackathon?: Hackathon) => {
        if (hackathon) {
            setEditingId(hackathon.id);
            setFormData({
                name: hackathon.name,
                details: hackathon.details,
                link: hackathon.link,
                category: hackathon.category,
                deadline: hackathon.deadline || "",
                location: hackathon.location || "",
                prizePool: hackathon.prizePool || "",
                teamSize: hackathon.teamSize || "",
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
                deadline: formData.deadline || undefined,
                location: formData.location.trim() || undefined,
                prizePool: formData.prizePool.trim() || undefined,
                teamSize: formData.teamSize.trim() || undefined,
                updatedAt: now,
            };

            if (editingId) {
                await updateDoc(doc(db, "hackathons", editingId), data);
                setHackathons((prev) =>
                    prev.map((h) =>
                        h.id === editingId ? ({ ...h, ...data } as Hackathon) : h
                    )
                );
                toast({
                    title: "Updated",
                    description: `"${formData.name}" has been updated.`,
                });
            } else {
                const newDoc = await addDoc(collection(db, "hackathons"), {
                    ...data,
                    createdAt: now,
                });
                setHackathons((prev) => [
                    { id: newDoc.id, ...data, createdAt: now } as Hackathon,
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
            console.error("Error saving hackathon:", error);
            toast({
                title: "Error",
                description: "Failed to save hackathon. Please try again.",
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
            await deleteDoc(doc(db, "hackathons", deleteTarget.id));
            setHackathons((prev) => prev.filter((h) => h.id !== deleteTarget.id));
            toast({
                title: "Deleted",
                description: `"${deleteTarget.name}" has been deleted.`,
            });
        } catch (error) {
            console.error("Error deleting hackathon:", error);
            toast({
                title: "Error",
                description: "Failed to delete hackathon. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const filteredHackathons = hackathons.filter(
        (h) =>
            h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
            categoryLabels[h.category].toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Hackathons Manager</h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Add and manage verified hackathons for students
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Hackathon
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-50 dark:bg-violet-950/20 rounded-lg">
                                <Trophy className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{hackathons.length}</p>
                                <p className="text-sm text-muted-foreground">Total Hackathons</p>
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
                                    {hackathons.filter((h) => h.category === "tech").length}
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
                                    {hackathons.filter((h) => h.deadline && new Date(h.deadline) > new Date()).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                                <ExternalLink className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {hackathons.filter((h) => h.category === "ai-ml").length}
                                </p>
                                <p className="text-sm text-muted-foreground">AI/ML</p>
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
                            <Trophy className="h-5 w-5" />
                            All Hackathons
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search hackathons..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-full sm:w-[250px]"
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={fetchHackathons} className="shrink-0 self-end sm:self-auto">
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3 text-muted-foreground">Loading hackathons...</span>
                        </div>
                    ) : filteredHackathons.length === 0 ? (
                        <div className="text-center py-12">
                            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground">
                                {searchQuery ? "No hackathons found" : "No hackathons yet"}
                            </h3>
                            <p className="text-muted-foreground mt-1">
                                {searchQuery ? "Try a different search term" : "Click 'Add Hackathon' to get started"}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="sm:hidden space-y-3">
                                {filteredHackathons.map((hackathon) => (
                                    <div key={hackathon.id} className="p-4 rounded-lg border bg-card">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-medium text-sm">{hackathon.name}</h3>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(hackathon)}>
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(hackathon)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            <Badge className={categoryColors[hackathon.category]}>
                                                {categoryLabels[hackathon.category]}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            {hackathon.deadline && <span>{formatDeadline(hackathon.deadline)}</span>}
                                            <a href={hackathon.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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
                                        {filteredHackathons.map((hackathon) => (
                                            <TableRow key={hackathon.id} className="hover:bg-muted/30">
                                                <TableCell className="font-medium">{hackathon.name}</TableCell>
                                                <TableCell>
                                                    <Badge className={categoryColors[hackathon.category]}>
                                                        {categoryLabels[hackathon.category]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {hackathon.deadline ? formatDeadline(hackathon.deadline) : "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <a
                                                        href={hackathon.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        Visit <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(hackathon)}>
                                                            <Pencil className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(hackathon)}>
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
                        <DialogTitle>{editingId ? "Edit Hackathon" : "Add New Hackathon"}</DialogTitle>
                        <DialogDescription>
                            {editingId
                                ? "Update the hackathon details below."
                                : "Fill in the details of the verified hackathon. The details field supports Markdown formatting."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Hackathon Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Smart India Hackathon 2026"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="details">Details * (Markdown supported)</Label>
                            <Textarea
                                id="details"
                                placeholder={`# About the Hackathon

**Themes:**
- AI/ML
- Sustainability

**Eligibility:**
- Open to all college students

**Prizes:**
- 1st Place: ₹1,00,000
- 2nd Place: ₹50,000`}
                                value={formData.details}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                className="min-h-[200px] font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                Use Markdown for headings (#), bold (**text**), lists (- item), and more.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link">Registration Link *</Label>
                            <Input
                                id="link"
                                type="url"
                                placeholder="https://hackathon.example.com/register"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value as HackathonCategory })}
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
                                    placeholder="e.g., Online, Bangalore"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prizePool">Prize Pool (Optional)</Label>
                                <Input
                                    id="prizePool"
                                    placeholder="e.g., ₹1,00,000"
                                    value={formData.prizePool}
                                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="teamSize">Team Size (Optional)</Label>
                            <Input
                                id="teamSize"
                                placeholder="e.g., 2-4 members"
                                value={formData.teamSize}
                                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : editingId ? (
                                "Update"
                            ) : (
                                "Add Hackathon"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Hackathon</AlertDialogTitle>
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
