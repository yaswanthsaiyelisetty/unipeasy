"use client";

import { PageHeader } from "@/components/page-header";
import { StrategistForm } from "./strategist-form";
import { PlanGuard } from "@/components/plan-guard";

export default function StrategistPage() {
  return (
    <PlanGuard>
      <div className="space-y-10">
        <PageHeader
          title="Strategist"
          description="Create your personalized study plan for exam success."
        />
        <StrategistForm />
      </div>
    </PlanGuard>
  );
}
