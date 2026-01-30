
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  BrainCircuit,
  LayoutGrid,
  Lightbulb,
  Rocket,
  Target,
  User,
  LogOut,
  FolderOpen,
  FileText,
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
    href: "/my-documents",
    icon: FileText,
    label: "My Documents",
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
    href: "/memory-palace",
    icon: BrainCircuit,
    label: "Memory Palace",
  },
];

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
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Rocket className="w-8 h-8 text-primary" />
            <span className="text-xl font-headline font-semibold">
              UniPeasy
            </span>
          </div>
          <ThemeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
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
                    "cursor-pointer transition-all duration-300",
                    isNavigating && "animate-pulse"
                  )}
                >
                  <item.icon className={cn(
                    "transition-transform duration-300",
                    isNavigating && "scale-110"
                  )} />
                  <span>{item.label}</span>
                  {isNavigating && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{user?.displayName || "User"}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </div>
  );
}
