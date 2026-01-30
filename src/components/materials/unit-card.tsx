"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Unit } from "@/lib/materials-data";
import { FileText, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { trackMaterialAccessed } from "@/lib/analytics";

interface UnitCardProps {
  unit: Unit;
  subjectId?: string;
  subjectTitle?: string;
  branch?: string;
  year?: string;
}

export function UnitCard({ unit, subjectId, subjectTitle, branch, year }: UnitCardProps) {
  const { user } = useAuth();

  const handleClick = () => {
    // Track material access
    if (user?.uid && subjectId && subjectTitle) {
      trackMaterialAccessed(user.uid, {
        subjectId,
        subjectTitle,
        unitNumber: unit.unit_number,
        unitTitle: unit.unit_title,
        branch: branch || "",
        year: year || "",
      });
    }
    
    // Handle data URLs by triggering download instead of navigation
    if (unit.drive_link.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = unit.drive_link;
      link.download = `${unit.unit_title || `Unit_${unit.unit_number}`}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(unit.drive_link, "_blank");
    }
  };

  return (
    <Card
      className="group cursor-pointer bg-card hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border border-border"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex-shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                Unit {unit.unit_number}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {unit.unit_title}
            </h3>
          </div>
          <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Click to open PDF in Google Drive
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
