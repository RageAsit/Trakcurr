import { create } from 'zustand';
import {
  addTransactionDoc,
  updateTransactionDoc,
  deleteTransactionDoc,
  clearAllTransactionsDocs,
} from '../services/firestoreService';
import { auth } from '../config/firebase';

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  isLoaded: false,
  error: null,

  // Action called by Firestore real-time listener (onSnapshot)
  setTransactions: (transactions) => {
    set({ transactions, isLoaded: true });
  },

  // Add a new transaction directly to Cloud Firestore
  addTransaction: async (newTx) => {
    const uid = auth?.currentUser?.uid;
    const id = 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const transactionObj = {
      id,
      createdAt: new Date().toISOString(),
      description: newTx.description || '',
      amount: Number(newTx.amount) || 0,
      type: newTx.type || 'debit',
      category: newTx.category || 'Need',
      mode: newTx.mode || 'online',
      date: newTx.date || new Date().toISOString().split('T')[0],
    };

    if (uid) {
      try {
        await addTransactionDoc(uid, transactionObj);
      } catch (err) {
        console.error('[TransactionStore] Error adding transaction to Firestore:', err);
      }
    } else {
      // Optimistic local update fallback
      set((state) => ({
        transactions: [transactionObj, ...state.transactions],
      }));
    }

    return transactionObj;
  },

  // Update a transaction by ID in Cloud Firestore
  updateTransaction: async (id, partialTx) => {
    const uid = auth?.currentUser?.uid;
    if (uid) {
      try {
        await updateTransactionDoc(uid, id, partialTx);
      } catch (err) {
        console.error('[TransactionStore] Error updating transaction in Firestore:', err);
      }
    } else {
      set((state) => ({
        transactions: state.transactions.map((tx) =>
          tx.id === id ? { ...tx, ...partialTx } : tx
        ),
      }));
    }
  },

  // Delete a transaction by ID in Cloud Firestore
  deleteTransaction: async (id) => {
    const uid = auth?.currentUser?.uid;
    if (uid) {
      try {
        await deleteTransactionDoc(uid, id);
      } catch (err) {
        console.error('[TransactionStore] Error deleting transaction from Firestore:', err);
      }
    } else {
      set((state) => ({
        transactions: state.transactions.filter((tx) => tx.id !== id),
      }));
    }
  },

  // Clear all transactions for user in Cloud Firestore
  clearTransactions: async () => {
    const uid = auth?.currentUser?.uid;
    const currentList = get().transactions;
    if (uid) {
      try {
        await clearAllTransactionsDocs(uid, currentList);
      } catch (err) {
        console.error('[TransactionStore] Error clearing transactions in Firestore:', err);
      }
    }
    set({ transactions: [] });
  },

  // Reset store state on logout
  resetStore: () => set({ transactions: [], isLoaded: false, error: null }),
}));
