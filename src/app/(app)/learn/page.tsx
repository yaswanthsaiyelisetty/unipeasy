"use client";

import { PageHeader } from "@/components/page-header";
import { LearnForm } from "./learn-form";
import { PlanGuard } from "@/components/plan-guard";

export default function LearnPage() {
  return (
    <PlanGuard>
      <div className="space-y-10">
        <PageHeader
          title="Learn"
          description="AI-powered explanations that make complex topics simple."
        />
        <LearnForm />
      </div>
    </PlanGuard>
  );
}
