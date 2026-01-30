"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Subject } from "@/lib/materials-data";
import { ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface SubjectCardProps {
  subject: Subject;
  branchId: string;
  yearId: string;
}

export function SubjectCard({ subject, branchId, yearId }: SubjectCardProps) {
  return (
    <Link href={`/materials/${branchId}/${yearId}/${subject.id}`}>
      <Card className="group cursor-pointer bg-card hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border border-border h-full">
        <CardContent className="p-6">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {subject.units.length} Units
              </Badge>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {subject.title}
              </h3>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                View study materials
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
