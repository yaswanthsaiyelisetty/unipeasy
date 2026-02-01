"use client";

import { useEffect } from "react";
import { usePlan } from "@/context/plan-context";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PlanGuardProps {
  children: React.ReactNode;
}

export function PlanGuard({ children }: PlanGuardProps) {
  const { hasActivePlan, isLoading, setShowClaimModal } = usePlan();

  // Show loading while checking plan status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If plan is not active, show the locked state
  if (!hasActivePlan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md mx-auto border-primary/20">
          <CardContent className="flex flex-col items-center text-center p-8">
            {/* Lock icon with glow effect */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-2">Feature Locked</h2>
            <p className="text-muted-foreground mb-6">
              Claim your free access to unlock this feature and all other AI-powered tools.
            </p>

            {/* Pricing display */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg text-muted-foreground line-through">₹300</span>
              <span className="text-3xl font-bold text-green-500">₹0</span>
              <span className="text-sm text-muted-foreground">(Launch Special)</span>
            </div>

            <Button
              onClick={() => setShowClaimModal(true)}
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Sparkles className="h-4 w-4" />
              Claim My Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Plan is active, show the content
  return <>{children}</>;
}
