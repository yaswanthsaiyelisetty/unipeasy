"use client";

import { StrategistForm } from "./strategist-form";
import { PlanGuard } from "@/components/plan-guard";

export default function StrategistPage() {
  return (
    <PlanGuard>
      <div className="space-y-6">
        <StrategistForm />
      </div>
    </PlanGuard>
  );
}

