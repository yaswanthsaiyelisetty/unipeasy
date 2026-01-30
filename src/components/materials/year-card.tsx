"use client";

import { Card, CardContent } from "@/components/ui/card";
import { YearInfo } from "@/lib/materials-data";
import { ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";

interface YearCardProps {
  year: YearInfo;
  branchId: string;
}

export function YearCard({ year, branchId }: YearCardProps) {
  return (
    <Link href={`/materials/${branchId}/${year.id}`}>
      <Card className="group cursor-pointer bg-card hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500 text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {year.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {year.semester}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
