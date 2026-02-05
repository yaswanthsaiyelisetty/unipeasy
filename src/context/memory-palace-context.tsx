"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { collection, doc, setDoc, deleteDoc, getDocs, query, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';

export interface MemoryItem {
  id: string;
  title: string;
  content: string;
  type: 'Explanation' | 'Analogy' | 'Mind Map' | 'Other';
  topic: string;
  createdAt?: number;
}

interface MemoryPalaceContextType {
  memoryItems: MemoryItem[];
  addMemoryItem: (item: MemoryItem) => Promise<void>;
  removeMemoryItem: (id: string) => Promise<void>;
  clearMemoryPalace: () => Promise<void>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

const MemoryPalaceContext = createContext<MemoryPalaceContextType | undefined>(undefined);

export function MemoryPalaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch memory items from Firestore when user is authenticated
  useEffect(() => {
    async function fetchMemoryItems() {
      if (!user?.uid) {
        // User is not logged in, clear items and mark as loaded
        setMemoryItems([]);
        setIsLoaded(true);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const memoryPalaceRef = collection(db, 'users', user.uid, 'memoryPalace');
        const q = query(memoryPalaceRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const items: MemoryItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data(),
          } as MemoryItem);
        });

        setMemoryItems(items);
      } catch (err) {
        console.error('Error fetching memory palace items:', err);
        setError('Failed to load your saved items. Please try again.');
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    }

    fetchMemoryItems();
  }, [user?.uid]);

  // Add a memory item to Firestore
  const addMemoryItem = useCallback(async (item: MemoryItem) => {
    if (!user?.uid) {
      console.error('Cannot save to Memory Palace: User not authenticated');
      throw new Error('You must be logged in to save items');
    }

    try {
      const itemWithTimestamp: MemoryItem = {
        ...item,
        createdAt: Date.now(),
      };

      // Save to Firestore
      const docRef = doc(db, 'users', user.uid, 'memoryPalace', item.id);
      await setDoc(docRef, itemWithTimestamp);

      // Update local state
      setMemoryItems((prevItems) => [itemWithTimestamp, ...prevItems]);
    } catch (err) {
      console.error('Error saving to Memory Palace:', err);
      throw new Error('Failed to save item. Please try again.');
    }
  }, [user?.uid]);

  // Remove a memory item from Firestore
  const removeMemoryItem = useCallback(async (id: string) => {
    if (!user?.uid) {
      console.error('Cannot remove from Memory Palace: User not authenticated');
      return;
    }

    try {
      // Remove from Firestore
      const docRef = doc(db, 'users', user.uid, 'memoryPalace', id);
      await deleteDoc(docRef);

      // Update local state
      setMemoryItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error removing from Memory Palace:', err);
      throw new Error('Failed to remove item. Please try again.');
    }
  }, [user?.uid]);

  // Clear all items from Memory Palace
  const clearMemoryPalace = useCallback(async () => {
    if (!user?.uid) {
      console.error('Cannot clear Memory Palace: User not authenticated');
      return;
    }

    try {
      // Get all documents in the collection
      const memoryPalaceRef = collection(db, 'users', user.uid, 'memoryPalace');
      const querySnapshot = await getDocs(memoryPalaceRef);

      // Use batch delete for efficiency
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Update local state
      setMemoryItems([]);
    } catch (err) {
      console.error('Error clearing Memory Palace:', err);
      throw new Error('Failed to clear items. Please try again.');
    }
  }, [user?.uid]);

  return (
    <MemoryPalaceContext.Provider
      value={{
        memoryItems,
        addMemoryItem,
        removeMemoryItem,
        clearMemoryPalace,
        isLoaded,
        isLoading,
        error
      }}
    >
      {children}
    </MemoryPalaceContext.Provider>
  );
}

export function useMemoryPalace() {
  const context = useContext(MemoryPalaceContext);
  if (context === undefined) {
    throw new Error('useMemoryPalace must be used within a MemoryPalaceProvider');
  }
  return context;
}
