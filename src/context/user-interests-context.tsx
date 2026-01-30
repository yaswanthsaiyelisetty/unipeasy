"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserInterests {
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  explanationStyle: 'storytelling' | 'technical' | 'analogies' | 'examples';
  preferredLength: 'short' | 'medium' | 'detailed';
  interests: string[];
  fieldOfStudy: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

export const defaultInterests: UserInterests = {
  learningStyle: 'visual',
  explanationStyle: 'storytelling',
  preferredLength: 'medium',
  interests: [],
  fieldOfStudy: '',
  difficultyLevel: 'intermediate',
};

interface UserInterestsContextType {
  interests: UserInterests;
  updateInterests: (interests: Partial<UserInterests>) => Promise<void>;
  isLoading: boolean;
  hasSetPreferences: boolean;
}

const UserInterestsContext = createContext<UserInterestsContextType | undefined>(undefined);

const INTERESTS_STORAGE_KEY = 'user-learning-interests';

export function UserInterestsProvider({ children }: { children: ReactNode }) {
  const [interests, setInterests] = useState<UserInterests>(defaultInterests);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSetPreferences, setHasSetPreferences] = useState(false);
  const { user } = useAuth();

  // Load interests from Firebase or localStorage
  useEffect(() => {
    const loadInterests = async () => {
      setIsLoading(true);
      try {
        if (user?.uid) {
          // Try to load from Firebase
          const docRef = doc(db, 'userInterests', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserInterests;
            setInterests(data);
            setHasSetPreferences(true);
          } else {
            // Fallback to localStorage
            const saved = localStorage.getItem(INTERESTS_STORAGE_KEY);
            if (saved) {
              setInterests(JSON.parse(saved));
              setHasSetPreferences(true);
            }
          }
        } else {
          // Not logged in, use localStorage
          const saved = localStorage.getItem(INTERESTS_STORAGE_KEY);
          if (saved) {
            setInterests(JSON.parse(saved));
            setHasSetPreferences(true);
          }
        }
      } catch (error) {
        console.error('Error loading user interests:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem(INTERESTS_STORAGE_KEY);
        if (saved) {
          setInterests(JSON.parse(saved));
          setHasSetPreferences(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInterests();
  }, [user]);

  const updateInterests = async (newInterests: Partial<UserInterests>) => {
    const updated = { ...interests, ...newInterests };
    setInterests(updated);
    setHasSetPreferences(true);

    // Save to localStorage as backup
    localStorage.setItem(INTERESTS_STORAGE_KEY, JSON.stringify(updated));

    // Save to Firebase if logged in
    if (user?.uid) {
      try {
        const docRef = doc(db, 'userInterests', user.uid);
        await setDoc(docRef, updated, { merge: true });
      } catch (error) {
        console.error('Error saving user interests to Firebase:', error);
      }
    }
  };

  return (
    <UserInterestsContext.Provider value={{ interests, updateInterests, isLoading, hasSetPreferences }}>
      {children}
    </UserInterestsContext.Provider>
  );
}

export function useUserInterests() {
  const context = useContext(UserInterestsContext);
  if (context === undefined) {
    throw new Error('useUserInterests must be used within a UserInterestsProvider');
  }
  return context;
}
