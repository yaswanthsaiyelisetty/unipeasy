"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, BookOpen, Sparkles } from "lucide-react";
import { searchMaterials, MaterialRecommendation } from "@/lib/materials-search";
import { Skeleton } from "@/components/ui/skeleton";

interface MaterialRecommendationsProps {
  topic: string;
}

export function MaterialRecommendations({ topic }: MaterialRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<MaterialRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!topic) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await searchMaterials(topic);
        setRecommendations(results);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [topic]);

  if (loading) {
    return (
      <Card className="border border-dashed">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Related Study Materials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.subject.id}
            className="p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{rec.subject.title || 'Untitled'}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {(rec.subject.units || []).length} Units
              </Badge>
            </div>
            <div className="space-y-1.5">
              {(rec.matchedUnits || []).slice(0, 2).map((unit) => (
                <Button
                  key={unit.unit_number}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-auto py-2 px-2 text-left"
                  onClick={() => {
                    if ((unit.drive_link || '').startsWith('data:')) {
                      const link = document.createElement('a');
                      link.href = unit.drive_link;
                      link.download = `${unit.unit_title || `Unit_${unit.unit_number}`}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else if (unit.drive_link) {
                      window.open(unit.drive_link, "_blank");
                    }
                  }}
                >
                  <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground mr-1">Unit {unit.unit_number}:</span>
                  <span className="text-xs truncate flex-1">{unit.unit_title || 'Untitled'}</span>
                  <ExternalLink className="h-3 w-3 ml-2 text-muted-foreground flex-shrink-0" />
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
