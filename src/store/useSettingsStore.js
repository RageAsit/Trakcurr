import { create } from 'zustand';
import { updateSettingsDoc, resetSettingsDoc } from '../services/firestoreService';
import { auth } from '../config/firebase';

const DEFAULT_SETTINGS = {
  currency: 'INR',
  monthlyBudgetTarget: 3000,
  categories: [
    'Housing',
    'Food & Dining',
    'Transportation',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Personal',
    'Income',
    'Savings',
  ],
  theme: 'light',
};

export const useSettingsStore = create((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoaded: false,
  error: null,

  // Action called by Firestore real-time listener (onSnapshot)
  setSettings: (settingsData) => {
    if (settingsData) {
      set({ ...DEFAULT_SETTINGS, ...settingsData, isLoaded: true });
    } else {
      set({ ...DEFAULT_SETTINGS, isLoaded: true });
    }
  },

  // Update settings in Cloud Firestore
  updateSettings: async (partialSettings) => {
    const uid = auth?.currentUser?.uid;
    set((state) => ({
      ...state,
      ...partialSettings,
    }));

    if (uid) {
      try {
        await updateSettingsDoc(uid, partialSettings);
      } catch (err) {
        console.error('[SettingsStore] Error updating settings in Firestore:', err);
      }
    }
  },

  // Add a custom category in Cloud Firestore
  addCategory: async (categoryName) => {
    if (!categoryName) return;
    const currentCategories = get().categories;
    if (currentCategories.includes(categoryName)) return;

    const newCategories = [...currentCategories, categoryName];
    await get().updateSettings({ categories: newCategories });
  },

  // Remove a category in Cloud Firestore
  removeCategory: async (categoryName) => {
    const currentCategories = get().categories;
    const newCategories = currentCategories.filter((cat) => cat !== categoryName);
    await get().updateSettings({ categories: newCategories });
  },

  // Reset settings to default values in Cloud Firestore
  resetSettings: async () => {
    const uid = auth?.currentUser?.uid;
    set({ ...DEFAULT_SETTINGS, isLoaded: true });

    if (uid) {
      try {
        await resetSettingsDoc(uid, DEFAULT_SETTINGS);
      } catch (err) {
        console.error('[SettingsStore] Error resetting settings in Firestore:', err);
      }
    }
  },

  // Reset store state on logout
  resetStore: () => set({ ...DEFAULT_SETTINGS, isLoaded: false, error: null }),
}));
