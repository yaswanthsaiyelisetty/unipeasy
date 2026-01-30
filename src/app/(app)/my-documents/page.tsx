"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Upload,
  FolderPlus,
  BookOpen,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  File,
  MoreVertical,
  Download,
  Trash2,
  Share2,
  Eye,
  Copy,
  Check,
  Loader2,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Search,
} from "lucide-react";
import {
  createSubject,
  getSubjects,
  deleteSubject,
  createFolder,
  getFolders,
  deleteFolder,
  uploadDocument,
  getDocuments,
  deleteDocument,
  toggleShareDocument,
  formatFileSize,
  getFileIcon,
  type Subject,
  type Folder,
  type DocumentFile,
} from "@/lib/documents-storage";

// File icon component
function FileIcon({ type }: { type: string }) {
  const iconClass = "h-8 w-8";
  switch (type) {
    case "pdf":
      return <FileText className={`${iconClass} text-red-500`} />;
    case "image":
      return <ImageIcon className={`${iconClass} text-green-500`} />;
    case "doc":
      return <FileText className={`${iconClass} text-blue-500`} />;
    case "excel":
      return <FileSpreadsheet className={`${iconClass} text-emerald-500`} />;
    case "ppt":
      return <Presentation className={`${iconClass} text-orange-500`} />;
    default:
      return <File className={`${iconClass} text-gray-500`} />;
  }
}

export default function MyDocumentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Navigation state
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);

  // Dialog states
  const [newSubjectOpen, setNewSubjectOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form states
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSubject, setUploadSubject] = useState("");
  const [uploadFolder, setUploadFolder] = useState("");

  // Preview & Delete states
  const [previewDoc, setPreviewDoc] = useState<DocumentFile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "subject" | "folder" | "document";
    id: string;
    name: string;
  } | null>(null);

  // Share state
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Load data
  const loadSubjects = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const data = await getSubjects(user.uid);
      setSubjects(data);
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  }, [user?.uid]);

  const loadFolders = useCallback(async () => {
    if (!user?.uid || !currentSubject) return;
    try {
      const data = await getFolders(user.uid, currentSubject.name);
      setFolders(data);
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  }, [user?.uid, currentSubject]);

  const loadDocuments = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const data = await getDocuments(
        user.uid,
        currentSubject?.name,
        currentFolder?.name
      );
      setDocuments(data);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  }, [user?.uid, currentSubject, currentFolder]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadSubjects();
      setLoading(false);
    };
    init();
  }, [loadSubjects]);

  useEffect(() => {
    if (currentSubject) {
      loadFolders();
      loadDocuments();
    }
  }, [currentSubject, loadFolders, loadDocuments]);

  useEffect(() => {
    if (currentFolder) {
      loadDocuments();
    }
  }, [currentFolder, loadDocuments]);

  // Handlers
  const handleCreateSubject = async () => {
    if (!user?.uid || !newSubjectName.trim()) return;
    try {
      await createSubject(user.uid, newSubjectName.trim());
      await loadSubjects();
      setNewSubjectName("");
      setNewSubjectOpen(false);
      toast({
        title: "Subject created",
        description: `"${newSubjectName}" has been created.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subject.",
        variant: "destructive",
      });
    }
  };

  const handleCreateFolder = async () => {
    if (!user?.uid || !currentSubject || !newFolderName.trim()) return;
    try {
      await createFolder(user.uid, newFolderName.trim(), currentSubject.name);
      await loadFolders();
      setNewFolderName("");
      setNewFolderOpen(false);
      toast({
        title: "Folder created",
        description: `"${newFolderName}" has been created.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create folder.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!user?.uid || !selectedFile || !uploadSubject || !uploadFolder) return;
    setUploading(true);
    try {
      await uploadDocument(user.uid, selectedFile, uploadSubject, uploadFolder);
      await loadDocuments();
      setSelectedFile(null);
      setUploadOpen(false);
      toast({
        title: "File uploaded",
        description: `"${selectedFile.name}" has been uploaded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      switch (deleteTarget.type) {
        case "subject":
          await deleteSubject(deleteTarget.id);
          await loadSubjects();
          if (currentSubject?.id === deleteTarget.id) {
            setCurrentSubject(null);
            setCurrentFolder(null);
          }
          break;
        case "folder":
          await deleteFolder(deleteTarget.id);
          await loadFolders();
          if (currentFolder?.id === deleteTarget.id) {
            setCurrentFolder(null);
          }
          break;
        case "document":
          await deleteDocument(deleteTarget.id);
          await loadDocuments();
          break;
      }
      toast({
        title: "Deleted",
        description: `"${deleteTarget.name}" has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleShare = async (doc: DocumentFile) => {
    try {
      await toggleShareDocument(doc.id, !doc.isShared);
      await loadDocuments();
      toast({
        title: doc.isShared ? "Sharing disabled" : "Sharing enabled",
        description: doc.isShared
          ? "Link sharing has been disabled."
          : "Anyone with the link can now view this file.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sharing settings.",
        variant: "destructive",
      });
    }
  };

  const copyShareLink = (shareId: string) => {
    const link = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(link);
    setCopiedShareId(shareId);
    setTimeout(() => setCopiedShareId(null), 2000);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  const handleDownload = (doc: DocumentFile) => {
    // Handle data URLs (base64) by triggering download
    if (doc.fileUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Regular URL - open in new tab
      window.open(doc.fileUrl, "_blank");
    }
  };

  const handlePreview = (doc: DocumentFile) => {
    if (doc.fileType.includes("pdf") || doc.fileType.includes("image")) {
      setPreviewDoc(doc);
      setPreviewOpen(true);
    } else {
      // For non-previewable files, trigger download instead
      handleDownload(doc);
    }
  };

  // Filter documents based on search
  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Breadcrumb navigation
  const goBack = () => {
    if (currentFolder) {
      setCurrentFolder(null);
    } else if (currentSubject) {
      setCurrentSubject(null);
      setFolders([]);
      setDocuments([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Documents"
        description="Store and organize your study materials, PDFs, and notes."
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCurrentSubject(null);
            setCurrentFolder(null);
            setFolders([]);
            setDocuments([]);
          }}
          className="px-2"
        >
          <FolderOpen className="h-4 w-4 mr-1" />
          My Documents
        </Button>
        {currentSubject && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFolder(null)}
              className="px-2"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              {currentSubject.name}
            </Button>
          </>
        )}
        {currentFolder && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Button variant="ghost" size="sm" className="px-2" disabled>
              <FolderOpen className="h-4 w-4 mr-1" />
              {currentFolder.name}
            </Button>
          </>
        )}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          {(currentSubject || currentFolder) && (
            <Button variant="outline" size="sm" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}

          {!currentSubject && (
            <Dialog open={newSubjectOpen} onOpenChange={setNewSubjectOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Subject</DialogTitle>
                  <DialogDescription>
                    Create a subject folder to organize your documents.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Subject Name</Label>
                    <Input
                      placeholder="e.g., Database Management Systems"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateSubject} disabled={!newSubjectName.trim()}>
                    Create Subject
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {currentSubject && !currentFolder && (
            <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <FolderPlus className="h-4 w-4 mr-1" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                    Create a folder inside "{currentSubject.name}".
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Folder Name</Label>
                    <Input
                      placeholder="e.g., Unit 1, Notes, Previous Papers"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                    Create Folder
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {currentFolder && (
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-1" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload File</DialogTitle>
                  <DialogDescription>
                    Upload a file to "{currentFolder.name}" in "{currentSubject?.name}".
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select File</Label>
                    <Input
                      type="file"
                      onChange={(e) => {
                        setSelectedFile(e.target.files?.[0] || null);
                        setUploadSubject(currentSubject?.name || "");
                        setUploadFolder(currentFolder?.name || "");
                      }}
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        {(currentSubject || documents.length > 0) && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {!currentSubject && (
        // Subjects View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subjects.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Subjects Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first subject to start organizing your documents.
                </p>
                <Button onClick={() => setNewSubjectOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Subject
                </Button>
              </CardContent>
            </Card>
          ) : (
            subjects.map((subject) => (
              <Card
                key={subject.id}
                className="cursor-pointer hover:border-primary transition-colors group"
                onClick={() => setCurrentSubject(subject)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-base">{subject.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({
                              type: "subject",
                              id: subject.id,
                              name: subject.name,
                            });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click to view folders and files
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {currentSubject && !currentFolder && (
        // Folders View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {folders.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Folders Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create folders to organize your files in "{currentSubject.name}".
                </p>
                <Button onClick={() => setNewFolderOpen(true)}>
                  <FolderPlus className="h-4 w-4 mr-1" />
                  Create Folder
                </Button>
              </CardContent>
            </Card>
          ) : (
            folders.map((folder) => (
              <Card
                key={folder.id}
                className="cursor-pointer hover:border-primary transition-colors group"
                onClick={() => setCurrentFolder(folder)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                        <FolderOpen className="h-6 w-6 text-amber-500" />
                      </div>
                      <CardTitle className="text-base">{folder.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({
                              type: "folder",
                              id: folder.id,
                              name: folder.name,
                            });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click to view files
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {currentFolder && (
        // Documents View
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Files Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Upload your first file to "{currentFolder.name}".
                </p>
                <Button onClick={() => setUploadOpen(true)}>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload File
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <FileIcon type={getFileIcon(doc.fileType)} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{doc.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>•</span>
                          <span>{doc.createdAt.toLocaleDateString()}</span>
                          {doc.isShared && (
                            <Badge variant="secondary" className="text-xs">
                              <Share2 className="h-3 w-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreview(doc)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(doc)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleShare(doc)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            {doc.isShared ? "Disable Sharing" : "Enable Sharing"}
                          </DropdownMenuItem>
                          {doc.isShared && doc.shareId && (
                            <DropdownMenuItem onClick={() => copyShareLink(doc.shareId!)}>
                              {copiedShareId === doc.shareId ? (
                                <Check className="h-4 w-4 mr-2" />
                              ) : (
                                <Copy className="h-4 w-4 mr-2" />
                              )}
                              Copy Share Link
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeleteTarget({
                                type: "document",
                                id: doc.id,
                                name: doc.name,
                              });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.name}".
              {deleteTarget?.type === "subject" &&
                " All folders and files inside will also be deleted."}
              {deleteTarget?.type === "folder" &&
                " All files inside will also be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF/Image Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden rounded-lg">
            {previewDoc?.fileType.includes("pdf") ? (
              <iframe
                src={`${previewDoc.fileUrl}#toolbar=1`}
                className="w-full h-full min-h-[60vh]"
                title={previewDoc.name}
              />
            ) : previewDoc?.fileType.includes("image") ? (
              <img
                src={previewDoc.fileUrl}
                alt={previewDoc.name}
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
