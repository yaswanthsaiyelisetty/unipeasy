"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { YearCard } from "@/components/materials/year-card";
import { MaterialsBreadcrumb } from "@/components/materials/materials-breadcrumb";
import { years, getBranchById, formatBranchName } from "@/lib/materials-data";

export default function BranchPage() {
  const params = useParams();
  const branchId = params.branch as string;
  const branch = getBranchById(branchId);

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Branch Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The requested branch does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MaterialsBreadcrumb
        items={[{ label: formatBranchName(branchId) }]}
      />

      <PageHeader
        title={`${branch.shortName} Materials`}
        description={`${branch.name} - Select your year to browse study materials.`}
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Select Your Year
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {years.map((year) => (
            <YearCard key={year.id} year={year} branchId={branchId} />
          ))}
        </div>
      </div>
    </div>
  );
}
