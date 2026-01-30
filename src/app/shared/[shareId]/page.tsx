"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSharedDocument, formatFileSize, type DocumentFile } from "@/lib/documents-storage";
import {
  FileText,
  Download,
  Loader2,
  AlertCircle,
  Eye,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SharedDocumentPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  
  const [document, setDocument] = useState<DocumentFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const doc = await getSharedDocument(shareId);
        if (doc) {
          setDocument(doc);
        } else {
          setError("Document not found or sharing has been disabled.");
        }
      } catch (err) {
        setError("Failed to load document.");
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      loadDocument();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Document Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error || "This document doesn't exist or the sharing link has expired."}
            </p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to UniPeasy
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canPreview =
    document.fileType.includes("pdf") || document.fileType.includes("image");

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              UniPeasy
            </Button>
          </Link>
        </div>

        {/* Document Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl mb-1">{document.name}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>•</span>
                  <span>{document.subject}</span>
                  <span>•</span>
                  <span>{document.folder}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This document has been shared with you via UniPeasy.
            </p>
            <div className="flex gap-3">
              {canPreview && (
                <Button onClick={() => setPreviewOpen(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button
                variant={canPreview ? "outline" : "default"}
                onClick={() => window.open(document.fileUrl, "_blank")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>{document.name}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden rounded-lg">
              {document.fileType.includes("pdf") ? (
                <iframe
                  src={`${document.fileUrl}#toolbar=1`}
                  className="w-full h-full min-h-[60vh]"
                  title={document.name}
                />
              ) : document.fileType.includes("image") ? (
                <img
                  src={document.fileUrl}
                  alt={document.name}
                  className="w-full h-full object-contain"
                />
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Want to organize your own study materials?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Join UniPeasy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
