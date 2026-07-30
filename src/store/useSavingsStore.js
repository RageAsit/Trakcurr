import { create } from 'zustand';
import {
  addSavingsDoc,
  updateSavingsDoc,
  deleteSavingsDoc,
  clearAllSavingsDocs,
} from '../services/firestoreService';
import { auth } from '../config/firebase';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'sav_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
};

export const useSavingsStore = create((set, get) => ({
  savingsTransactions: [],
  targetGoal: 10000,
  isLoaded: false,
  error: null,

  // Action called by Firestore real-time listener (onSnapshot)
  setSavings: (savingsTransactions) => {
    set({ savingsTransactions, isLoaded: true });
  },

  // Add a new savings transaction (deposit or withdrawal) directly to Cloud Firestore
  addSavingsTransaction: async (savingsData) => {
    const uid = auth?.currentUser?.uid;
    const newSavingsTx = {
      id: savingsData.id || generateId(),
      description: savingsData.description || 'Savings Contribution',
      amount: Number(savingsData.amount) || 0,
      type: savingsData.type || 'deposit',
      goalName: savingsData.goalName || 'General Savings',
      date: savingsData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      ...savingsData,
    };

    if (uid) {
      try {
        await addSavingsDoc(uid, newSavingsTx);
      } catch (err) {
        console.error('[SavingsStore] Error adding savings entry to Firestore:', err);
      }
    } else {
      set((state) => ({
        savingsTransactions: [newSavingsTx, ...state.savingsTransactions],
      }));
    }

    return newSavingsTx;
  },

  // Update a savings transaction by ID in Cloud Firestore
  updateSavingsTransaction: async (id, partialSavings) => {
    const uid = auth?.currentUser?.uid;
    if (uid) {
      try {
        await updateSavingsDoc(uid, id, partialSavings);
      } catch (err) {
        console.error('[SavingsStore] Error updating savings entry in Firestore:', err);
      }
    } else {
      set((state) => ({
        savingsTransactions: state.savingsTransactions.map((item) =>
          item.id === id ? { ...item, ...partialSavings } : item
        ),
      }));
    }
  },

  // Delete a savings transaction by ID in Cloud Firestore
  deleteSavingsTransaction: async (id) => {
    const uid = auth?.currentUser?.uid;
    if (uid) {
      try {
        await deleteSavingsDoc(uid, id);
      } catch (err) {
        console.error('[SavingsStore] Error deleting savings entry from Firestore:', err);
      }
    } else {
      set((state) => ({
        savingsTransactions: state.savingsTransactions.filter((item) => item.id !== id),
      }));
    }
  },

  // Update target savings goal
  updateTargetGoal: (newGoal) => {
    set({ targetGoal: Number(newGoal) || 0 });
  },

  // Clear all savings transactions for user in Cloud Firestore
  clearSavingsTransactions: async () => {
    const uid = auth?.currentUser?.uid;
    const currentList = get().savingsTransactions;
    if (uid) {
      try {
        await clearAllSavingsDocs(uid, currentList);
      } catch (err) {
        console.error('[SavingsStore] Error clearing savings in Firestore:', err);
      }
    }
    set({ savingsTransactions: [] });
  },

  // Reset store state on logout
  resetStore: () => set({ savingsTransactions: [], isLoaded: false, error: null }),
}));
