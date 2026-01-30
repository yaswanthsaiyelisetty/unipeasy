"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PageHeader } from "@/components/page-header";
import { UnitCard } from "@/components/materials/unit-card";
import { MaterialsBreadcrumb } from "@/components/materials/materials-breadcrumb";
import {
  Subject,
  getBranchById,
  getYearById,
  formatBranchName,
  formatYearName,
} from "@/lib/materials-data";
import { BookOpen, Loader2, AlertCircle, BadgeCheck, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function SubjectPage() {
  const params = useParams();
  const branchId = params.branch as string;
  const yearId = params.year as string;
  const subjectId = params.subjectId as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const branch = getBranchById(branchId);
  const year = getYearById(yearId);

  useEffect(() => {
    async function fetchSubject() {
      try {
        setLoading(true);
        setError(null);

        const docRef = doc(db, "subjects", subjectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSubject({
            id: docSnap.id,
            ...docSnap.data(),
          } as Subject);
        } else {
          setError("Subject not found.");
        }
      } catch (err) {
        console.error("Error fetching subject:", err);
        setError("Failed to load subject. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);

  if (!branch || !year) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The requested page does not exist.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <MaterialsBreadcrumb
          items={[
            { label: formatBranchName(branchId), href: `/materials/${branchId}` },
            { label: formatYearName(yearId), href: `/materials/${branchId}/${yearId}` },
            { label: "Loading..." },
          ]}
        />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading subject...</span>
        </div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen">
        <MaterialsBreadcrumb
          items={[
            { label: formatBranchName(branchId), href: `/materials/${branchId}` },
            { label: formatYearName(yearId), href: `/materials/${branchId}/${yearId}` },
            { label: "Error" },
          ]}
        />
        <div className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "Subject not found."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MaterialsBreadcrumb
        items={[
          { label: formatBranchName(branchId), href: `/materials/${branchId}` },
          { label: formatYearName(yearId), href: `/materials/${branchId}/${yearId}` },
          { label: subject.title },
        ]}
      />

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-foreground">{subject.title}</h1>
          <Badge className="w-fit bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0">
            <BadgeCheck className="h-3.5 w-3.5 mr-1" />
            Topper Verified
          </Badge>
        </div>
        <p className="text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          High-quality notes verified by top performers
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Unit-wise Study Materials ({subject.units.length} Units)
        </h2>
        
        {subject.units.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">
              No Units Available
            </h3>
            <p className="text-muted-foreground mt-2">
              Units for this subject are being prepared. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subject.units
              .sort((a, b) => a.unit_number - b.unit_number)
              .map((unit) => (
                <UnitCard 
                  key={unit.unit_number} 
                  unit={unit}
                  subjectId={subjectId}
                  subjectTitle={subject.title}
                  branch={branchId}
                  year={yearId}
                />
              ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Tip:</strong> Click on any unit card to open the PDF notes directly in Google Drive.
          You can view, download, or print the materials from there.
        </p>
      </div>
    </div>
  );
}
