"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-context';

interface PlanContextType {
  hasActivePlan: boolean;
  planDetails: PlanDetails | null;
  isLoading: boolean;
  claimPlan: () => Promise<void>;
  showClaimModal: boolean;
  setShowClaimModal: (show: boolean) => void;
  openClaimModal: () => void;
}

interface PlanDetails {
  status: 'inactive' | 'active';
  planType: 'free' | 'launch_special';
  claimedAt: string | null;
  originalPrice: number;
  paidPrice: number;
  isNewGoogleUser?: boolean;
}

const defaultPlanDetails: PlanDetails = {
  status: 'inactive',
  planType: 'free',
  claimedAt: null,
  originalPrice: 300,
  paidPrice: 0,
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Fetch plan status from Firestore
  useEffect(() => {
    async function fetchPlanStatus() {
      if (!user) {
        setHasActivePlan(false);
        setPlanDetails(null);
        setIsLoading(false);
        return;
      }

      try {
        const userPlanRef = doc(db, 'userPlans', user.uid);
        const planDoc = await getDoc(userPlanRef);

        if (planDoc.exists()) {
          const data = planDoc.data() as PlanDetails;
          setPlanDetails(data);
          setHasActivePlan(data.status === 'active');
          
          // Auto-show claim modal for new Google users who haven't claimed
          if (data.isNewGoogleUser && data.status === 'inactive') {
            setShowClaimModal(true);
            // Clear the flag after showing modal
            await setDoc(userPlanRef, { ...data, isNewGoogleUser: false }, { merge: true });
          }
        } else {
          // Initialize plan document for new users
          await setDoc(userPlanRef, defaultPlanDetails);
          setPlanDetails(defaultPlanDetails);
          setHasActivePlan(false);
        }
      } catch (error) {
        console.error('Error fetching plan status:', error);
        setPlanDetails(defaultPlanDetails);
        setHasActivePlan(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlanStatus();
  }, [user]);

  // Claim the launch special plan
  const claimPlan = useCallback(async () => {
    if (!user) return;

    try {
      const userPlanRef = doc(db, 'userPlans', user.uid);
      const newPlanDetails: PlanDetails = {
        status: 'active',
        planType: 'launch_special',
        claimedAt: new Date().toISOString(),
        originalPrice: 300,
        paidPrice: 0,
      };

      await setDoc(userPlanRef, newPlanDetails);
      setPlanDetails(newPlanDetails);
      setHasActivePlan(true);
      setShowClaimModal(false);
    } catch (error) {
      console.error('Error claiming plan:', error);
      throw error;
    }
  }, [user]);

  // Helper function to open the claim modal
  const openClaimModal = useCallback(() => {
    setShowClaimModal(true);
  }, []);

  return (
    <PlanContext.Provider
      value={{
        hasActivePlan,
        planDetails,
        isLoading,
        claimPlan,
        showClaimModal,
        setShowClaimModal,
        openClaimModal,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}
