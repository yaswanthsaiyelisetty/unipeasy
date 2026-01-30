
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
import { Loader2, Rocket } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageTransition } from "@/components/page-transition";
import { NavigationProgress } from "@/components/navigation-progress";

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
        <div className="min-h-screen w-full">
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <SidebarProvider>
            <Sidebar>
              <Navigation />
            </Sidebar>
            <SidebarInset>
              {/* Mobile Header */}
              <header className="flex md:hidden items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                  <SidebarTrigger />
                  <div className="flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-primary" />
                    <span className="font-headline font-semibold">UniPeasy</span>
                  </div>
                </div>
              </header>
              <main className="p-4 sm:p-6 lg:p-8">
                <PageTransition>{children}</PageTransition>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </MemoryPalaceProvider>
    </UserInterestsProvider>
  );
}
