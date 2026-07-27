import { useEffect, useState } from 'react';
import {
  subscribeTransactions,
  subscribeSavings,
  subscribeSettings,
} from '../services/firestoreService';
import { useTransactionStore } from '../store/useTransactionStore';
import { useSavingsStore } from '../store/useSavingsStore';
import { useSettingsStore } from '../store/useSettingsStore';

export function useFirestoreSync(uid) {
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    if (!uid) {
      // Clear store states when user is not authenticated
      useTransactionStore.getState().resetStore();
      useSavingsStore.getState().resetStore();
      useSettingsStore.getState().resetStore();
      setIsDataReady(false);
      return;
    }

    setIsDataReady(false);

    let transactionsLoaded = false;
    let savingsLoaded = false;
    let settingsLoaded = false;

    const checkAllLoaded = () => {
      if (transactionsLoaded && savingsLoaded && settingsLoaded) {
        setIsDataReady(true);
      }
    };

    // 1. Real-time Transactions Listener
    const unsubTransactions = subscribeTransactions(
      uid,
      (transactions) => {
        useTransactionStore.getState().setTransactions(transactions);
        transactionsLoaded = true;
        checkAllLoaded();
      },
      () => {
        transactionsLoaded = true;
        checkAllLoaded();
      }
    );

    // 2. Real-time Savings Listener
    const unsubSavings = subscribeSavings(
      uid,
      (savings) => {
        useSavingsStore.getState().setSavings(savings);
        savingsLoaded = true;
        checkAllLoaded();
      },
      () => {
        savingsLoaded = true;
        checkAllLoaded();
      }
    );

    // 3. Real-time Settings Listener
    const unsubSettings = subscribeSettings(
      uid,
      (settings) => {
        useSettingsStore.getState().setSettings(settings);
        settingsLoaded = true;
        checkAllLoaded();
      },
      () => {
        settingsLoaded = true;
        checkAllLoaded();
      }
    );

    // Cleanup listeners when component unmounts or UID changes
    return () => {
      unsubTransactions();
      unsubSavings();
      unsubSettings();
    };
  }, [uid]);

  return { isDataReady };
}
