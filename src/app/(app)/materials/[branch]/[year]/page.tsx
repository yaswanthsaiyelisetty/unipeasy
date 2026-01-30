"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PageHeader } from "@/components/page-header";
import { SubjectCard } from "@/components/materials/subject-card";
import { MaterialsBreadcrumb } from "@/components/materials/materials-breadcrumb";
import {
  Subject,
  getBranchById,
  getYearById,
  formatBranchName,
  formatYearName,
} from "@/lib/materials-data";
import { BookOpen, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function YearPage() {
  const params = useParams();
  const branchId = params.branch as string;
  const yearId = params.year as string;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const branch = getBranchById(branchId);
  const year = getYearById(yearId);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        setLoading(true);
        setError(null);

        const subjectsRef = collection(db, "subjects");
        const q = query(
          subjectsRef,
          where("branch", "array-contains", branchId.toUpperCase()),
          where("year", "==", yearId)
        );

        const querySnapshot = await getDocs(q);
        const fetchedSubjects: Subject[] = [];

        querySnapshot.forEach((doc) => {
          fetchedSubjects.push({
            id: doc.id,
            ...doc.data(),
          } as Subject);
        });

        setSubjects(fetchedSubjects);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError("Failed to load subjects. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (branchId && yearId) {
      fetchSubjects();
    }
  }, [branchId, yearId]);

  if (!branch || !year) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The requested branch or year does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MaterialsBreadcrumb
        items={[
          { label: formatBranchName(branchId), href: `/materials/${branchId}` },
          { label: formatYearName(yearId) },
        ]}
      />

      <PageHeader
        title={`${branch.shortName} - ${year.name}`}
        description={`Browse study materials for ${branch.name}, ${year.name}. All notes are topper-verified.`}
      />

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading subjects...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : subjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">
              No Subjects Found
            </h3>
            <p className="text-muted-foreground mt-2">
              No subjects have been added for {branch.shortName} - {year.name} yet.
              Check back soon!
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Available Subjects ({subjects.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  branchId={branchId}
                  yearId={yearId}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
