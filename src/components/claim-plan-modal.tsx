"use client";

import { useState } from "react";
import { usePlan } from "@/context/plan-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Target,
  Zap,
  BrainCircuit,
  FolderOpen,
  Lightbulb,
  CheckCircle2,
  Loader2,
  Gift,
  Crown,
} from "lucide-react";
import { triggerConfetti } from "@/lib/confetti";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Lightbulb,
    title: "AI Learning Assistant",
    description: "Personalized explanations for any topic",
  },
  {
    icon: Target,
    title: "AI Exam Strategist",
    description: "Smart study plans and exam strategies",
  },
  {
    icon: Zap,
    title: "AI Skill Accelerator",
    description: "Industry-ready skill tracks",
  },
  {
    icon: BrainCircuit,
    title: "Memory Palace",
    description: "Save and organize AI insights",
  },
  {
    icon: FolderOpen,
    title: "Materials Hub",
    description: "Verified study materials",
  },
];

export function ClaimPlanModal() {
  const { showClaimModal, setShowClaimModal, claimPlan } = usePlan();
  const [isLoading, setIsLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      await claimPlan();
      setClaimed(true);
      triggerConfetti();
      
      // Close modal after a brief celebration
      setTimeout(() => {
        setShowClaimModal(false);
        setClaimed(false);
      }, 2000);
    } catch (error) {
      console.error("Error claiming plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={showClaimModal} onOpenChange={setShowClaimModal}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Success State */}
        {claimed ? (
          <div className="flex flex-col items-center justify-center py-8 px-6 gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
              <div className="relative bg-green-500/10 rounded-full p-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-green-500">Success!</h3>
            <p className="text-muted-foreground text-center">
              You now have full access to all UniPeasy features!
            </p>
          </div>
        ) : (
          <>
            {/* Fixed Header */}
            <div className="relative flex-shrink-0 px-6 pt-6 pb-4 border-b bg-background">
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/10" />
              <DialogHeader className="relative">
                <div className="flex items-center justify-center mb-2">
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                    <Gift className="h-3.5 w-3.5" />
                    Launch Special
                  </Badge>
                </div>
                <DialogTitle className="text-xl text-center">
                  Unlock Your Academic Power-Ups
                </DialogTitle>
                <DialogDescription className="text-center text-sm">
                  Get instant access to all AI-powered features
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Pricing Card */}
              <div className="relative mb-4">
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card/50 backdrop-blur">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-xl text-muted-foreground line-through decoration-2">
                      ₹300
                    </span>
                    <span className="text-4xl font-bold text-green-500">₹0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Limited Time Offer</p>
                  <Sparkles className="absolute top-2 right-3 h-4 w-4 text-yellow-500/60 animate-pulse" />
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  What you&apos;ll unlock:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {features.map((feature) => (
                    <div
                      key={feature.title}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border bg-background/50 transition-all duration-300",
                        "hover:bg-accent/50 hover:border-primary/20"
                      )}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 flex-shrink-0">
                        <feature.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{feature.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {feature.description}
                        </p>
                      </div>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500/70 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t bg-background">
              <Button
                onClick={handleClaim}
                disabled={isLoading}
                size="lg"
                className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    Claim My Access
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                No payment required • Instant activation
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
