/**
 * Universal Animation System for UniPeasy
 * Consistent framer-motion variants and utilities for global interactivity
 */

import { Variants } from "framer-motion";

// Stagger container for child animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Fade up animation for cards and sections
export const fadeUpVariant: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// Scale up with fade for interactive elements
export const scaleUpVariant: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -30,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// Slide in from right
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 30,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// Hover glow effect configuration
export const hoverGlow = {
  scale: 1.02,
  transition: { type: "spring", stiffness: 400, damping: 17 },
} as const;

// Tap effect configuration
export const tapEffect = {
  scale: 0.98,
};

// Button press animation
export const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: {
    scale: 1.03,
    transition: { type: "spring", stiffness: 400, damping: 17 },
  },
  tap: {
    scale: 0.97,
    transition: { type: "spring", stiffness: 400, damping: 17 },
  },
};

// Card hover with glow
export const cardHoverVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: "0 0 0 0 rgba(var(--primary), 0)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 0 20px 2px rgba(var(--primary), 0.15)",
    transition: { type: "spring", stiffness: 400, damping: 17 },
  },
};

// Pulse glow animation for loading states
export const pulseGlow: Variants = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(var(--primary), 0.4)",
      "0 0 0 10px rgba(var(--primary), 0)",
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// List item stagger for menus
export const listItemVariant: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// Page transition variants
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Float animation for decorative elements
export const floatAnimation: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Skeleton shimmer effect
export const shimmerVariant: Variants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Success checkmark animation
export const checkmarkVariant: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: "easeOut" },
      opacity: { duration: 0.2 },
    },
  },
};

// Modal/Dialog animation
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.15,
    },
  },
};

// Notification slide in
export const notificationVariant: Variants = {
  hidden: { opacity: 0, x: 100, scale: 0.9 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};
