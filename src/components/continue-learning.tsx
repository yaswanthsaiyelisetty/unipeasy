"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Clock, FolderOpen, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface LastAccessedItem {
  type: "material" | "skill" | "document";
  title: string;
  subtitle?: string;
  href: string;
  timestamp: number;
  icon?: "book" | "folder" | "zap";
}

interface ContinueLearningProps {
  className?: string;
}

// Hook to track and retrieve last accessed content
export function useLastAccessed() {
  const { user } = useAuth();
  const [lastAccessed, setLastAccessed] = React.useState<LastAccessedItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load last accessed items
  React.useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    const loadLastAccessed = async () => {
      try {
        const docRef = doc(db, "users", user.uid, "progress", "lastAccessed");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setLastAccessed(data.items || []);
        }
      } catch (error) {
        console.error("Error loading last accessed:", error);
        // Fallback to localStorage
        const stored = localStorage.getItem(`lastAccessed_${user.uid}`);
        if (stored) {
          setLastAccessed(JSON.parse(stored));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLastAccessed();
  }, [user?.uid]);

  // Track new access
  const trackAccess = React.useCallback(
    async (item: Omit<LastAccessedItem, "timestamp">) => {
      if (!user?.uid) return;

      const newItem: LastAccessedItem = {
        ...item,
        timestamp: Date.now(),
      };

      // Update state optimistically
      setLastAccessed((prev) => {
        // Remove duplicate if exists
        const filtered = prev.filter(
          (i) => !(i.type === item.type && i.href === item.href)
        );
        // Add new item at the beginning, keep only last 5
        return [newItem, ...filtered].slice(0, 5);
      });

      try {
        const docRef = doc(db, "users", user.uid, "progress", "lastAccessed");
        const docSnap = await getDoc(docRef);

        let items: LastAccessedItem[] = [];
        if (docSnap.exists()) {
          items = docSnap.data().items || [];
        }

        // Remove duplicate and add new
        items = items.filter(
          (i: LastAccessedItem) => !(i.type === item.type && i.href === item.href)
        );
        items = [newItem, ...items].slice(0, 5);

        await setDoc(docRef, {
          items,
          updatedAt: serverTimestamp(),
        });

        // Also store in localStorage as fallback
        localStorage.setItem(`lastAccessed_${user.uid}`, JSON.stringify(items));
      } catch (error) {
        console.error("Error tracking access:", error);
      }
    },
    [user?.uid]
  );

  return { lastAccessed, isLoading, trackAccess };
}

export function ContinueLearning({ className }: ContinueLearningProps) {
  const { lastAccessed, isLoading } = useLastAccessed();

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-3">
          <div className="h-5 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lastAccessed.length === 0) {
    return null;
  }

  const getIcon = (icon?: string) => {
    switch (icon) {
      case "folder":
        return <FolderOpen className="h-5 w-5" />;
      case "zap":
        return <Zap className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className={cn("border shadow-sm", className)}>
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-secondary">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-lg">Continue Learning</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pick up where you left off
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <div className="space-y-3">
          {lastAccessed.slice(0, 3).map((item, index) => (
            <motion.div
              key={`${item.type}-${item.href}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.href}>
                <div className="group flex items-center gap-4 p-3 rounded-lg bg-muted/50 border hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-secondary group-hover:bg-foreground group-hover:text-background transition-colors">
                    {getIcon(item.icon)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {item.title}
                      </p>
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {item.type}
                      </Badge>
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.subtitle}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatTime(item.timestamp)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
