import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { EEngineerRequest, StaffMember, EngineerInquiry, EngineerDailyAttendance } from '../types';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Auth Functions
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/popup-blocked'
    ) {
      console.warn('Google Sign-In popup was closed or blocked by browser:', error?.message);
      return null;
    }
    console.error('Google Sign-In Error:', error);
    return null;
  }
};

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

// Firestore Collections Names
export const COLLECTIONS = {
  REQUESTS: 'requests',
  STAFF: 'staff',
  INQUIRIES: 'inquiries',
  ATTENDANCE: 'daily_attendance',
};

// Sync functions
export const syncRequestToFirestore = async (request: EEngineerRequest) => {
  try {
    const docRef = doc(db, COLLECTIONS.REQUESTS, request.id);
    await setDoc(docRef, request, { merge: true });
  } catch (err) {
    console.error('Error writing request to Firestore:', err);
  }
};

export const syncAllRequestsToFirestore = async (requests: EEngineerRequest[]) => {
  try {
    const batch = writeBatch(db);
    requests.forEach(req => {
      const docRef = doc(db, COLLECTIONS.REQUESTS, req.id);
      batch.set(docRef, req, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error batch syncing requests to Firestore:', err);
  }
};

export const syncStaffToFirestore = async (staffList: StaffMember[]) => {
  try {
    const batch = writeBatch(db);
    staffList.forEach(s => {
      const docRef = doc(db, COLLECTIONS.STAFF, s.id);
      batch.set(docRef, s, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error syncing staff to Firestore:', err);
  }
};

export const syncInquiryToFirestore = async (inquiry: EngineerInquiry) => {
  try {
    const docRef = doc(db, COLLECTIONS.INQUIRIES, inquiry.id);
    await setDoc(docRef, inquiry, { merge: true });
  } catch (err) {
    console.error('Error writing inquiry to Firestore:', err);
  }
};

export const syncAttendanceToFirestore = async (record: EngineerDailyAttendance) => {
  try {
    const docRef = doc(db, COLLECTIONS.ATTENDANCE, record.id);
    await setDoc(docRef, record, { merge: true });
  } catch (err) {
    console.error('Error writing attendance to Firestore:', err);
  }
};

export const syncAllAttendanceToFirestore = async (records: EngineerDailyAttendance[]) => {
  try {
    const batch = writeBatch(db);
    records.forEach(rec => {
      const docRef = doc(db, COLLECTIONS.ATTENDANCE, rec.id);
      batch.set(docRef, rec, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error batch syncing attendance to Firestore:', err);
  }
};

export const syncAllInquiriesToFirestore = async (inquiries: EngineerInquiry[]) => {
  try {
    const batch = writeBatch(db);
    inquiries.forEach(inq => {
      const docRef = doc(db, COLLECTIONS.INQUIRIES, inq.id);
      batch.set(docRef, inq, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error batch syncing inquiries to Firestore:', err);
  }
};

export const deleteStaffFromFirestore = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTIONS.STAFF, id);
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting staff from Firestore:', err);
  }
};

