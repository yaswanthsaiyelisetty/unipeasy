"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { BranchCard } from "@/components/materials/branch-card";
import { MaterialsBreadcrumb } from "@/components/materials/materials-breadcrumb";
import { branches } from "@/lib/materials-data";
import { PlanGuard } from "@/components/plan-guard";
import { staggerContainer, fadeUpVariant } from "@/lib/animations";

export default function MaterialsPage() {
  return (
    <PlanGuard>
      <div className="min-h-screen">
        <MaterialsBreadcrumb items={[]} />
        
        <PageHeader
          title="Study Materials"
          description="Access topper-verified notes organized by branch. Select your branch to get started."
        />

        <motion.div 
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Select Your Branch
          </h2>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {branches.map((branch) => (
              <motion.div key={branch.id} variants={fadeUpVariant}>
                <BranchCard branch={branch} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </PlanGuard>
  );
}
