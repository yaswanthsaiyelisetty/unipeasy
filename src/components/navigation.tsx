
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  BrainCircuit,
  Briefcase,
  LayoutGrid,
  Lightbulb,
  Rocket,
  Target,
  User,
  LogOut,
  FolderOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

import { cn } from "@/lib/utils";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "./ui/button";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutGrid,
    label: "Dashboard",
  },
  {
    href: "/learn",
    icon: Lightbulb,
    label: "Learn",
  },
  {
    href: "/materials",
    icon: FolderOpen,
    label: "Materials",
  },
  {
    href: "/strategist",
    icon: Target,
    label: "Strategist",
  },
  {
    href: "/skills",
    icon: Award,
    label: "Skills",
  },
  {
    href: "/internships",
    icon: Briefcase,
    label: "Internships",
  },
  {
    href: "/memory-palace",
    icon: BrainCircuit,
    label: "Memory Palace",
  },
  {
    href: "/profile",
    icon: User,
    label: "My Profile",
  },
];
// Add About page nav item
navItems.push({
  href: "/about",
  icon: Rocket,
  label: "About",
});

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const { user } = useAuth();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset navigating state when pathname changes
  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  }

  const handleNavigation = (href: string) => {
    if (pathname === href) return;

    setNavigatingTo(href);

    // Close mobile sidebar
    if (isMobile) {
      setOpenMobile(false);
    }

    startTransition(() => {
      router.push(href);
    });
  }

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader className="p-4 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-purple-500 shadow-lg shadow-primary/30">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-headline font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              UniPeasy
            </span>
          </div>
          <ThemeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isNavigating = navigatingTo === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={isMobile ? undefined : item.label}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "cursor-pointer transition-all duration-300 rounded-xl h-11",
                    isNavigating && "animate-pulse",
                    isActive
                      ? "bg-gradient-to-r from-primary/15 to-purple-500/15 border border-primary/20 shadow-sm text-primary font-semibold"
                      : "hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/10 hover:border-primary/10"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg transition-all",
                    isActive
                      ? "bg-gradient-to-br from-primary to-purple-500 shadow-md shadow-primary/20"
                      : "bg-muted group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-purple-500/20"
                  )}>
                    <item.icon className={cn(
                      "w-4 h-4 transition-all duration-300",
                      isActive ? "text-white" : "text-muted-foreground group-hover:text-primary",
                      isNavigating && "scale-110"
                    )} />
                  </div>
                  <span className={cn(
                    "transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}>{item.label}</span>
                  {isNavigating && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator className="bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <SidebarFooter className="p-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20 shadow-lg shadow-primary/5 hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
            <Avatar className="ring-2 ring-primary/50 ring-offset-2 ring-offset-background shadow-lg shadow-primary/20 flex-shrink-0">
              <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white font-semibold">
                {user?.displayName?.split(' ').map(n => n[0]).join('').slice(0, 2) || <User className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 overflow-hidden flex-1">
              <span className="font-bold text-sm bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent truncate block">{user?.displayName || "User"}</span>
              <span className="text-[11px] text-muted-foreground truncate block">
                {user?.email}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all flex-shrink-0">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </div>
  );
}
