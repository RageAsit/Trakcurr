import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/* ==================================================================== */
/* 1. TRANSACTIONS FIRESTORE SERVICE (users/{uid}/transactions)         */
/* ==================================================================== */

/**
 * Real-time listener for user transactions
 */
export function subscribeTransactions(uid, onNext, onError) {
  if (!db || !uid) return () => {};

  const colRef = collection(db, 'users', uid, 'transactions');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const transactions = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onNext(transactions);
    },
    (err) => {
      console.error(`[Firestore] Transactions listener error for ${uid}:`, err);
      if (onError) onError(err);
    }
  );
}

/**
 * Add or overwrite a transaction document
 */
export async function addTransactionDoc(uid, transactionData) {
  if (!db || !uid || !transactionData?.id) return;
  const docRef = doc(db, 'users', uid, 'transactions', transactionData.id);
  await setDoc(docRef, transactionData);
}

/**
 * Update specific fields of a transaction document
 */
export async function updateTransactionDoc(uid, transactionId, partialData) {
  if (!db || !uid || !transactionId) return;
  const docRef = doc(db, 'users', uid, 'transactions', transactionId);
  await updateDoc(docRef, partialData);
}

/**
 * Delete a transaction document
 */
export async function deleteTransactionDoc(uid, transactionId) {
  if (!db || !uid || !transactionId) return;
  const docRef = doc(db, 'users', uid, 'transactions', transactionId);
  await deleteDoc(docRef);
}

/**
 * Clear all transaction documents in batch
 */
export async function clearAllTransactionsDocs(uid, transactionList = []) {
  if (!db || !uid) return;
  if (transactionList.length === 0) return;

  const batch = writeBatch(db);
  transactionList.forEach((tx) => {
    const docRef = doc(db, 'users', uid, 'transactions', tx.id);
    batch.delete(docRef);
  });
  await batch.commit();
}

/* ==================================================================== */
/* 2. SAVINGS FIRESTORE SERVICE (users/{uid}/savings)                   */
/* ==================================================================== */

/**
 * Real-time listener for user savings entries
 */
export function subscribeSavings(uid, onNext, onError) {
  if (!db || !uid) return () => {};

  const colRef = collection(db, 'users', uid, 'savings');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const savings = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onNext(savings);
    },
    (err) => {
      console.error(`[Firestore] Savings listener error for ${uid}:`, err);
      if (onError) onError(err);
    }
  );
}

/**
 * Add or overwrite a savings entry document
 */
export async function addSavingsDoc(uid, savingsData) {
  if (!db || !uid || !savingsData?.id) return;
  const docRef = doc(db, 'users', uid, 'savings', savingsData.id);
  await setDoc(docRef, savingsData);
}

/**
 * Delete a savings entry document
 */
export async function deleteSavingsDoc(uid, savingsId) {
  if (!db || !uid || !savingsId) return;
  const docRef = doc(db, 'users', uid, 'savings', savingsId);
  await deleteDoc(docRef);
}

/**
 * Clear all savings entry documents in batch
 */
export async function clearAllSavingsDocs(uid, savingsList = []) {
  if (!db || !uid) return;
  if (savingsList.length === 0) return;

  const batch = writeBatch(db);
  savingsList.forEach((item) => {
    const docRef = doc(db, 'users', uid, 'savings', item.id);
    batch.delete(docRef);
  });
  await batch.commit();
}

/* ==================================================================== */
/* 3. SETTINGS FIRESTORE SERVICE (users/{uid}/settings)                 */
/* ==================================================================== */

const SETTINGS_DOC_ID = 'preferences';

/**
 * Real-time listener for user preferences
 */
export function subscribeSettings(uid, onNext, onError) {
  if (!db || !uid) return () => {};

  const docRef = doc(db, 'users', uid, 'settings', SETTINGS_DOC_ID);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onNext(docSnap.data());
      } else {
        // Initialize default settings document for new user
        onNext(null);
      }
    },
    (err) => {
      console.error(`[Firestore] Settings listener error for ${uid}:`, err);
      if (onError) onError(err);
    }
  );
}

/**
 * Update or merge user settings document
 */
export async function updateSettingsDoc(uid, partialSettings) {
  if (!db || !uid) return;
  const docRef = doc(db, 'users', uid, 'settings', SETTINGS_DOC_ID);
  await setDoc(docRef, partialSettings, { merge: true });
}

/**
 * Reset user settings document to defaults
 */
export async function resetSettingsDoc(uid, defaultSettings) {
  if (!db || !uid) return;
  const docRef = doc(db, 'users', uid, 'settings', SETTINGS_DOC_ID);
  await setDoc(docRef, defaultSettings);
}
