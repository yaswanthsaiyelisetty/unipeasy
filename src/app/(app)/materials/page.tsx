"use client";

import { PageHeader } from "@/components/page-header";
import { BranchCard } from "@/components/materials/branch-card";
import { MaterialsBreadcrumb } from "@/components/materials/materials-breadcrumb";
import { branches } from "@/lib/materials-data";

export default function MaterialsPage() {
  return (
    <div className="min-h-screen">
      <MaterialsBreadcrumb items={[]} />
      
      <PageHeader
        title="Study Materials"
        description="Access topper-verified notes organized by branch. Select your branch to get started."
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Select Your Branch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      </div>
    </div>
  );
}
