"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Subject } from "@/lib/materials-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  BookOpen,
  FileText,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statDialog, setStatDialog] = useState<{
    type: 'subjects' | 'units' | 'branches' | null;
    open: boolean;
  }>({ type: null, open: false });

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "subjects"));
      const subjectsList: Subject[] = [];
      querySnapshot.forEach((doc) => {
        subjectsList.push({
          id: doc.id,
          ...doc.data(),
        } as Subject);
      });
      // Sort by title (handle undefined titles)
      subjectsList.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      setSubjects(subjectsList);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description: "Failed to load subjects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "subjects", deleteTarget.id));
      setSubjects((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast({
        title: "Deleted",
        description: `"${deleteTarget.title}" has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast({
        title: "Error",
        description: "Failed to delete subject. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      (subject.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.branch || []).some((b) =>
        b.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (subject.year || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatYear = (year: string) => {
    return year.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const totalUnits = subjects.reduce((acc, s) => acc + (s.units?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Materials Manager</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage study materials for JNTUK students
          </p>
        </div>
        <Link href="/admin/materials">
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Subject
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
          onClick={() => setStatDialog({ type: 'subjects', open: true })}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{subjects.length}</p>
                <p className="text-sm text-muted-foreground">Total Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
          onClick={() => setStatDialog({ type: 'units', open: true })}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalUnits}</p>
                <p className="text-sm text-muted-foreground">Total Units</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
          onClick={() => setStatDialog({ type: 'branches', open: true })}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <FolderOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(subjects.flatMap((s) => s.branch || [])).size}
                </p>
                <p className="text-sm text-muted-foreground">Active Branches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              All Subjects
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchSubjects} className="shrink-0 self-end sm:self-auto">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading subjects...</span>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                {searchQuery ? "No subjects found" : "No subjects yet"}
              </h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Click 'Add New Subject' to get started"}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {filteredSubjects.map((subject) => (
                  <div key={subject.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-sm">{subject.title}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <Link href={`/admin/materials/edit/${subject.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setDeleteTarget(subject)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(subject.branch || []).map((b) => (
                        <Badge key={b} variant="secondary" className="text-xs">
                          {b}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatYear(subject.year || '')}</span>
                      <Badge variant="outline">{(subject.units || []).length} units</Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Subject Title</TableHead>
                      <TableHead className="font-semibold">Branches</TableHead>
                      <TableHead className="font-semibold">Year</TableHead>
                      <TableHead className="font-semibold text-center">Units</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects.map((subject) => (
                      <TableRow key={subject.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{subject.title || 'Untitled'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(subject.branch || []).map((b) => (
                              <Badge key={b} variant="secondary" className="text-xs">
                                {b}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{formatYear(subject.year || '')}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{(subject.units || []).length}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/materials/edit/${subject.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDeleteTarget(subject)}
                            >
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This action
              cannot be undone and will remove all associated units.
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

      {/* Stats Detail Dialog */}
      <Dialog open={statDialog.open} onOpenChange={(open) => setStatDialog({ ...statDialog, open })}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {statDialog.type === 'subjects' && <><BookOpen className="h-5 w-5 text-blue-600" /> All Subjects</>}
              {statDialog.type === 'units' && <><FileText className="h-5 w-5 text-emerald-600" /> All Units</>}
              {statDialog.type === 'branches' && <><FolderOpen className="h-5 w-5 text-purple-600" /> Active Branches</>}
            </DialogTitle>
            <DialogDescription>
              {statDialog.type === 'subjects' && `${subjects.length} subjects in the system`}
              {statDialog.type === 'units' && `${totalUnits} units across all subjects`}
              {statDialog.type === 'branches' && `${new Set(subjects.flatMap((s) => s.branch || [])).size} branches with materials`}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            {/* Subjects List */}
            {statDialog.type === 'subjects' && (
              <div className="space-y-2">
                {subjects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No subjects added yet</p>
                ) : (
                  subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium">{subject.title || 'Untitled'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{formatYear(subject.year || '')}</Badge>
                          <span className="text-xs text-muted-foreground">{(subject.units || []).length} units</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(subject.branch || []).map((b) => (
                          <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Units List */}
            {statDialog.type === 'units' && (
              <div className="space-y-3">
                {subjects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No units added yet</p>
                ) : (
                  subjects.map((subject) => (
                    <div key={subject.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{subject.title || 'Untitled'}</p>
                        <Badge variant="secondary">{(subject.units || []).length} units</Badge>
                      </div>
                      <div className="space-y-1 ml-4">
                        {(subject.units || []).map((unit) => (
                          <div key={unit.unit_number} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                            <span>Unit {unit.unit_number}: {unit.unit_title}</span>
                            {unit.drive_link && (
                              <Badge variant="outline" className="text-xs">PDF Linked</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Branches List */}
            {statDialog.type === 'branches' && (
              <div className="space-y-2">
                {(() => {
                  const branchData: Record<string, Subject[]> = {};
                  subjects.forEach(s => {
                    (s.branch || []).forEach(b => {
                      if (!branchData[b]) branchData[b] = [];
                      branchData[b].push(s);
                    });
                  });
                  const branchEntries = Object.entries(branchData).sort((a, b) => b[1].length - a[1].length);
                  
                  if (branchEntries.length === 0) {
                    return <p className="text-center text-muted-foreground py-8">No branches with materials yet</p>;
                  }
                  
                  return branchEntries.map(([branch, branchSubjects]) => (
                    <div key={branch} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{branch}</p>
                        <Badge variant="secondary">{branchSubjects.length} subjects</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {branchSubjects.map((s) => (
                          <Badge key={s.id} variant="outline" className="text-xs">
                            {s.title || 'Untitled'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
