"use client";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemoryPalace } from "@/context/memory-palace-context";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Trash2, Loader2, X, BookOpen, Lightbulb, Map } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function MemoryPalacePage() {
  const { memoryItems, removeMemoryItem, clearMemoryPalace, isLoaded } = useMemoryPalace();

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Explanation': return <BookOpen className="w-4 h-4" />;
      case 'Analogy': return <Lightbulb className="w-4 h-4" />;
      case 'Mind Map': return <Map className="w-4 h-4" />;
      default: return <BrainCircuit className="w-4 h-4" />;
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <PageHeader
          title="Memory Palace"
          description="Your saved knowledge for quick revision."
        />
        {memoryItems.length > 0 && (
          <Button variant="outline" onClick={clearMemoryPalace} className="shrink-0">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => removeMemoryItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Badge variant="secondary" className="w-fit text-xs">{item.type}</Badge>
              </CardHeader>
              
              <CardContent className="flex-grow pt-0">
                <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto bg-muted/50 p-3 rounded-lg prose prose-sm prose-neutral dark:prose-invert max-w-none">
                  <ReactMarkdown>{item.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
