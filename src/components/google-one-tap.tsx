"use client";

import { useEffect, useCallback } from "react";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (notification?: (notification: PromptMomentNotification) => void) => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
          cancel: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  itp_support?: boolean;
  prompt_parent_id?: string;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  client_id: string;
}

interface PromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
}

interface GoogleButtonConfig {
  type: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
}

export function GoogleOneTap() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    try {
      // Create credential from Google's ID token
      const credential = GoogleAuthProvider.credential(response.credential);
      
      // Sign in with Firebase
      const result = await signInWithCredential(auth, credential);
      const firebaseUser = result.user;
      
      // Check if user exists in Firestore
      const userPlanRef = doc(db, 'userPlans', firebaseUser.uid);
      const planDoc = await getDoc(userPlanRef);
      
      if (!planDoc.exists()) {
        // New user - create user document
        await setDoc(userPlanRef, {
          status: 'inactive',
          planType: 'free',
          claimedAt: null,
          originalPrice: 300,
          paidPrice: 0,
          isNewGoogleUser: true,
        });
        toast({ 
          title: "Welcome to UniPeasy! 🎉", 
          description: "Your account has been created. Claim your free plan!" 
        });
      } else {
        toast({ 
          title: "Welcome back!", 
          description: `Good to see you, ${firebaseUser.displayName || 'Student'}!` 
        });
      }
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Google One Tap sign-in error:", error);
      toast({ 
        variant: "destructive", 
        title: "Sign-in Failed", 
        description: "There was an error signing in. Please try again." 
      });
    }
  }, [router, toast]);

  useEffect(() => {
    // Don't show One Tap if user is already logged in
    if (user) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("Google Client ID not configured for One Tap");
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: true,
          cancel_on_tap_outside: true,
          context: 'signin',
          itp_support: true,
        });
        
        // Show the One Tap prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log("One Tap not displayed:", notification.getNotDisplayedReason());
          }
          if (notification.isSkippedMoment()) {
            console.log("One Tap skipped:", notification.getSkippedReason());
          }
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [user, handleCredentialResponse]);

  // This component doesn't render anything visible
  // Google One Tap renders its own UI in the top-right corner
  return null;
}
