"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemoryPalace, MemoryItem } from "@/context/memory-palace-context";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Trash2, Loader2, X, BookOpen, Lightbulb, Map, AlertCircle, Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { PlanGuard } from "@/components/plan-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function MemoryPalaceContent() {
  const { memoryItems, removeMemoryItem, clearMemoryPalace, isLoaded, isLoading, error } = useMemoryPalace();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MemoryItem | null>(null);

  const getTypeIcon = (type: string, className: string = "w-4 h-4") => {
    switch (type) {
      case 'Explanation': return <BookOpen className={className} />;
      case 'Analogy': return <Lightbulb className={className} />;
      case 'Mind Map': return <Map className={className} />;
      default: return <BrainCircuit className={className} />;
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      setDeletingId(id);
      await removeMemoryItem(id);
      toast({
        title: "Item Removed",
        description: "The item has been removed from your Memory Palace.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item. Please try again.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      setIsClearing(true);
      await clearMemoryPalace();
      toast({
        title: "Memory Palace Cleared",
        description: "All items have been removed.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear items. Please try again.",
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Show skeleton loader while loading
  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Memory Palace"
          description="Your saved knowledge for quick revision."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-5 w-20 mt-2" />
              </CardHeader>
              <CardContent className="flex-grow pt-0">
                <Skeleton className="h-24 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Memory Palace"
          description="Your saved knowledge for quick revision."
        />
        <Card className="flex flex-col items-center justify-center text-center py-16 border-destructive">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="mt-6 text-xl">Something went wrong</CardTitle>
          <CardDescription className="mt-2 max-w-sm text-destructive">
            {error}
          </CardDescription>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <PageHeader
          title="Memory Palace"
          description="Your saved knowledge for quick revision."
        />
        {memoryItems.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="shrink-0" disabled={isClearing}>
                {isClearing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Memory Palace?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {memoryItems.length} saved items from your Memory Palace. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {memoryItems.length === 0 ? (
        <Card className="flex flex-col items-center justify-center text-center py-16 border-dashed">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <BrainCircuit className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="mt-6 text-xl">Your Palace is Empty</CardTitle>
          <CardDescription className="mt-2 max-w-sm">
            Go to the Learn section to generate insights and save them here.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memoryItems.map((item) => (
            <Card key={item.id} className="group flex flex-col border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded bg-secondary shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <CardTitle className="text-base truncate">{item.topic}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Full Screen Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setSelectedItem(item)}
                      title="View Full Screen"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit text-xs">{item.type}</Badge>
              </CardHeader>

              <CardContent className="flex-grow pt-0">
                <div
                  className="text-sm text-muted-foreground max-h-32 overflow-y-auto bg-muted/50 p-3 rounded-lg prose prose-sm prose-neutral dark:prose-invert max-w-none cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => setSelectedItem(item)}
                >
                  <ReactMarkdown>{item.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Screen Modal */}
      <Dialog open={selectedItem !== null} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                {selectedItem && getTypeIcon(selectedItem.type, "w-5 h-5")}
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl truncate">
                  {selectedItem?.topic}
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {selectedItem?.type}
                    </Badge>
                    <span className="text-xs">
                      Saved to Memory Palace
                    </span>
                  </div>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:text-primary prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-ul:my-3 prose-li:my-1 prose-p:my-3 prose-p:leading-relaxed prose-strong:text-foreground">
              <ReactMarkdown>{selectedItem?.content || ""}</ReactMarkdown>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MemoryPalacePage() {
  return (
    <PlanGuard>
      <MemoryPalaceContent />
    </PlanGuard>
  );
}
