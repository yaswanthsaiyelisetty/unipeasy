"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Only animate if pathname actually changed
    if (prevPathname.current !== pathname) {
      setIsAnimating(true);
      setShouldRender(false);

      // Quick fade out
      const fadeOutTimer = setTimeout(() => {
        setShouldRender(true);
        // Quick fade in
        const fadeInTimer = setTimeout(() => {
          setIsAnimating(false);
        }, 50);
        return () => clearTimeout(fadeInTimer);
      }, 150);

      prevPathname.current = pathname;
      return () => clearTimeout(fadeOutTimer);
    }
  }, [pathname]);

  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out will-change-transform",
        isAnimating && !shouldRender
          ? "opacity-0 translate-y-3"
          : "opacity-100 translate-y-0"
      )}
    >
      {children}
    </div>
  );
}

