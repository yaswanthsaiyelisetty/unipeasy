"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MemoryItem {
    id: string;
    title: string;
    content: string;
    type: 'Explanation' | 'Analogy' | 'Mind Map' | 'Other';
    topic: string;
}

interface MemoryPalaceContextType {
  memoryItems: MemoryItem[];
  addMemoryItem: (item: MemoryItem) => void;
  removeMemoryItem: (id: string) => void;
  clearMemoryPalace: () => void;
  isLoaded: boolean;
}

const MemoryPalaceContext = createContext<MemoryPalaceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'memoryPalaceItems';

export function MemoryPalaceProvider({ children }: { children: ReactNode }) {
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (items) {
        setMemoryItems(JSON.parse(items));
      }
    } catch (error) {
      console.error("Failed to parse memory palace items from localStorage", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
        try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(memoryItems));
        } catch (error) {
            console.error("Failed to save memory palace items to localStorage", error);
        }
    }
  }, [memoryItems, isLoaded]);

  const addMemoryItem = (item: MemoryItem) => {
    setMemoryItems((prevItems) => [item, ...prevItems]);
  };

  const removeMemoryItem = (id: string) => {
    setMemoryItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearMemoryPalace = () => {
    setMemoryItems([]);
  };

  return (
    <MemoryPalaceContext.Provider value={{ memoryItems, addMemoryItem, removeMemoryItem, clearMemoryPalace, isLoaded }}>
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
