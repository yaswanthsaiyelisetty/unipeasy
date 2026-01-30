"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-14 h-7 rounded-full bg-muted animate-pulse" />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isDark 
          ? "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]" 
          : "bg-gradient-to-br from-sky-400 via-cyan-300 to-blue-400 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)]"
      )}
      aria-label="Toggle theme"
    >
      {/* Animated background glow */}
      <span className={cn(
        "absolute inset-0 rounded-full transition-opacity duration-700",
        isDark 
          ? "bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 opacity-100" 
          : "bg-gradient-to-r from-yellow-200/40 via-transparent to-orange-200/40 opacity-100"
      )} />

      {/* Stars container */}
      <span className={cn(
        "absolute inset-0 overflow-hidden rounded-full transition-all duration-700",
        isDark ? "opacity-100" : "opacity-0 scale-50"
      )}>
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 60 + 5}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          />
        ))}
      </span>

      {/* Clouds */}
      <span className={cn(
        "absolute inset-0 overflow-hidden rounded-full transition-all duration-700",
        isDark ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      )}>
        <span className="absolute top-0.5 left-1 w-4 h-2 bg-white/70 rounded-full blur-[2px] animate-[drift_8s_ease-in-out_infinite]" />
        <span className="absolute bottom-1 left-2 w-3 h-1.5 bg-white/50 rounded-full blur-[1px] animate-[drift_6s_ease-in-out_infinite_reverse]" />
      </span>

      {/* Toggle orb */}
      <span
        className={cn(
          "relative flex h-6 w-6 items-center justify-center rounded-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark 
            ? "translate-x-7 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 shadow-[0_0_20px_rgba(148,163,184,0.6),inset_0_-2px_4px_rgba(0,0,0,0.1)]" 
            : "translate-x-0 bg-gradient-to-br from-yellow-200 via-yellow-300 to-orange-300 shadow-[0_0_25px_rgba(250,204,21,0.8),0_0_50px_rgba(250,204,21,0.4),inset_0_-2px_4px_rgba(0,0,0,0.1)]"
        )}
      >
        {/* Sun rays */}
        <span className={cn(
          "absolute inset-0 transition-all duration-700",
          isDark ? "opacity-0 scale-0 rotate-180" : "opacity-100 scale-100 rotate-0"
        )}>
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="absolute top-1/2 left-1/2 w-0.5 h-1.5 bg-gradient-to-t from-yellow-400 to-transparent rounded-full origin-bottom"
              style={{
                transform: `translate(-50%, -100%) rotate(${i * 45}deg) translateY(-10px)`,
              }}
            />
          ))}
        </span>

        {/* Sun face */}
        <span className={cn(
          "absolute w-4 h-4 rounded-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark 
            ? "bg-transparent scale-0 rotate-90" 
            : "bg-gradient-to-br from-yellow-300 to-orange-400 scale-100 rotate-0"
        )} />

        {/* Moon with craters */}
        <span className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-90"
        )}>
          <span className="relative w-4 h-4 rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 overflow-hidden">
            {/* Moon craters */}
            <span className="absolute top-0.5 left-1 w-1 h-1 rounded-full bg-slate-400/50" />
            <span className="absolute bottom-1 right-0.5 w-1.5 h-1.5 rounded-full bg-slate-400/40" />
            <span className="absolute top-2 right-1 w-0.5 h-0.5 rounded-full bg-slate-400/60" />
            {/* Moon shadow */}
            <span className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-500/30 rounded-full" />
          </span>
        </span>
      </span>

      {/* Hover ripple effect */}
      <span className={cn(
        "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        isDark 
          ? "bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10" 
          : "bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10"
      )} />
    </button>
  )
}


