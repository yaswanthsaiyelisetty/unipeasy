
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { Navigation } from "@/components/navigation";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MemoryPalaceProvider } from "@/context/memory-palace-context";
import { UserInterestsProvider } from "@/context/user-interests-context";
import { FocusModeProvider, useFocusMode } from "@/context/focus-mode-context";
import { PlanProvider } from "@/context/plan-context";
import { Loader2, Rocket } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageTransition } from "@/components/page-transition";
import { NavigationProgress } from "@/components/navigation-progress";
import { FocusModeToggle } from "@/components/focus-mode-toggle";
import { FloatingAIButton } from "@/components/floating-ai-button";
import { GlobalAIChat } from "@/components/global-ai-chat";
import { FeatureRequestButton } from "@/components/feedback";
import { ClaimPlanModal } from "@/components/claim-plan-modal";
import { cn } from "@/lib/utils";

function AppContent({ children }: { children: React.ReactNode }) {
  const { isFocusMode } = useFocusMode();

  return (
    <div className="min-h-screen w-full">
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <SidebarProvider>
        <Sidebar className={cn(
          "transition-all duration-300",
          isFocusMode && "!-translate-x-full md:!-translate-x-full"
        )}>
          <Navigation />
        </Sidebar>
        <SidebarInset className={cn(
          "transition-all duration-300",
          isFocusMode && "!ml-0"
        )}>
          {/* Mobile Header */}
          <header className={cn(
            "flex md:hidden items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300",
            isFocusMode && "opacity-0 pointer-events-none h-0 p-0 border-0 overflow-hidden"
          )}>
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Rocket className="w-6 h-6 text-primary" />
                <span className="font-headline font-semibold">UniPeasy</span>
              </div>
            </div>
            <FocusModeToggle variant="minimal" />
          </header>
          
          {/* Focus Mode Exit Button */}
          {isFocusMode && (
            <div className="fixed top-4 right-4 z-50">
              <FocusModeToggle variant="default" />
            </div>
          )}
          
          <main className={cn(
            "p-4 sm:p-6 lg:p-8 transition-all duration-300",
            isFocusMode && "max-w-4xl mx-auto"
          )}>
            <PageTransition>{children}</PageTransition>
          </main>
        </SidebarInset>
      </SidebarProvider>
      
      {/* Floating Components */}
      {!isFocusMode && (
        <>
          <GlobalAIChat />
          <FeatureRequestButton />
        </>
      )}
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <Loader2 className="relative h-16 w-16 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserInterestsProvider>
      <MemoryPalaceProvider>
        <FocusModeProvider>
          <PlanProvider>
            <AppContent>{children}</AppContent>
            <ClaimPlanModal />
          </PlanProvider>
        </FocusModeProvider>
      </MemoryPalaceProvider>
    </UserInterestsProvider>
  );
}
