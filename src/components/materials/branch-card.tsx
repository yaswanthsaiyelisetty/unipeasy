"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BranchInfo } from "@/lib/materials-data";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Color mapping for each branch - text/icon colors
const branchColors: Record<string, { text: string; bg: string }> = {
  cse: { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
  csm: { text: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" },
  csd: { text: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  it: { text: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30" },
  ece: { text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30" },
  eee: { text: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  civil: { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
  mech: { text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30" },
};

// SVG Icons for each branch
const BranchIcons: Record<string, React.FC<{ className?: string }>> = {
  cse: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 8l3 2-3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  csm: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  ),
  csd: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 16l4-4 4 4 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="7" cy="16" r="1.5" fill="currentColor"/>
      <circle cx="11" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="16" r="1.5" fill="currentColor"/>
      <circle cx="20" cy="10" r="1.5" fill="currentColor"/>
    </svg>
  ),
  it: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2c3 3 4.5 6 4.5 10s-1.5 7-4.5 10c-3-3-4.5-6-4.5-10s1.5-7 4.5-10z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  ece: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  eee: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  civil: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 21V7l7-4 7 4v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="8" y="9" width="2" height="2" fill="currentColor" rx="0.5"/>
      <rect x="14" y="9" width="2" height="2" fill="currentColor" rx="0.5"/>
      <rect x="8" y="13" width="2" height="2" fill="currentColor" rx="0.5"/>
      <rect x="14" y="13" width="2" height="2" fill="currentColor" rx="0.5"/>
    </svg>
  ),
  mech: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2"/>
    </svg>
  ),
};

interface BranchCardProps {
  branch: BranchInfo;
}

export function BranchCard({ branch }: BranchCardProps) {
  const IconComponent = BranchIcons[branch.id];
  const colors = branchColors[branch.id] || { text: "text-primary", bg: "bg-muted" };

  return (
    <Link href={`/materials/${branch.id}`}>
      <Card className="group cursor-pointer bg-card hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("p-2", colors.text)}>
                {IconComponent ? (
                  <IconComponent className="h-7 w-7" />
                ) : (
                  <div className="h-7 w-7" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {branch.shortName}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {branch.description}
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
