"use client";

import { ReactNode } from "react";
import { usePlan } from "@/context/plan-context";
import { cn } from "@/lib/utils";
import { Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeatureLockProps {
  children: ReactNode;
  className?: string;
  showBadge?: boolean;
}

// Wraps a feature card with a lock overlay when plan is not active
export function FeatureLock({ children, className, showBadge = true }: FeatureLockProps) {
  const { hasActivePlan, setShowClaimModal, isLoading } = usePlan();

  // Don't show lock while loading or if plan is active
  if (isLoading || hasActivePlan) {
    return <>{children}</>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowClaimModal(true);
  };

  return (
    <div className={cn("relative group", className)}>
      {/* The actual content with blur effect */}
      <div className="pointer-events-none select-none blur-[2px] opacity-70 grayscale-[30%] transition-all duration-300 group-hover:blur-[3px]">
        {children}
      </div>

      {/* Lock overlay */}
      <div
        onClick={handleClick}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer rounded-lg bg-background/40 backdrop-blur-[1px] transition-all duration-300 hover:bg-background/50"
      >
        <div className="flex flex-col items-center gap-2 p-4">
          {/* Lock icon with animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20">
              <Lock className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Badge */}
          {showBadge && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              Plan Required
            </Badge>
          )}

          {/* Unlock text */}
          <p className="text-xs text-muted-foreground text-center max-w-[150px]">
            Click to claim your free access
          </p>
        </div>
      </div>
    </div>
  );
}

// A banner shown to free users encouraging them to claim the plan
export function ClaimPlanBanner() {
  const { hasActivePlan, setShowClaimModal, isLoading } = usePlan();

  if (isLoading || hasActivePlan) {
    return null;
  }

  return (
    <div
      onClick={() => setShowClaimModal(true)}
      className="mb-6 p-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 cursor-pointer transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              Special Launch Offer
            </p>
            <p className="text-xs text-muted-foreground">
              Get{" "}
              <span className="line-through text-muted-foreground/70">₹300</span>{" "}
              worth of AI tools for{" "}
              <span className="font-bold text-green-500">₹0</span> today!
            </p>
          </div>
        </div>
        <Badge className="gap-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
          Claim Now
        </Badge>
      </div>
    </div>
  );
}

// A component to protect entire pages/routes
interface ProtectedFeatureProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedFeature({ children, fallback }: ProtectedFeatureProps) {
  const { hasActivePlan, setShowClaimModal, isLoading } = usePlan();

  if (isLoading) {
    return fallback || null;
  }

  if (!hasActivePlan) {
    // Show the claim modal when trying to access
    setShowClaimModal(true);
    return fallback || null;
  }

  return <>{children}</>;
}
