import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDocFromServer,
  onSnapshot, 
  writeBatch,
  query,
  orderBy,
  deleteDoc
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

// Test Firestore Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore connection test: Client is currently offline.');
    }
    return false;
  }
}

// Error handling helper conforming to FirestoreErrorInfo standard
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

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
  USERS: 'users',
};

// Sync functions
export const syncRequestToFirestore = async (request: EEngineerRequest) => {
  const path = `${COLLECTIONS.REQUESTS}/${request.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.REQUESTS, request.id);
    await setDoc(docRef, request, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
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
    handleFirestoreError(err, OperationType.WRITE, COLLECTIONS.REQUESTS);
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
    handleFirestoreError(err, OperationType.WRITE, COLLECTIONS.STAFF);
  }
};

export const syncInquiryToFirestore = async (inquiry: EngineerInquiry) => {
  const path = `${COLLECTIONS.INQUIRIES}/${inquiry.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.INQUIRIES, inquiry.id);
    await setDoc(docRef, inquiry, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const syncAttendanceToFirestore = async (record: EngineerDailyAttendance) => {
  const path = `${COLLECTIONS.ATTENDANCE}/${record.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.ATTENDANCE, record.id);
    await setDoc(docRef, record, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
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
    handleFirestoreError(err, OperationType.WRITE, COLLECTIONS.ATTENDANCE);
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
    handleFirestoreError(err, OperationType.WRITE, COLLECTIONS.INQUIRIES);
  }
};

export const deleteStaffFromFirestore = async (id: string) => {
  const path = `${COLLECTIONS.STAFF}/${id}`;
  try {
    const docRef = doc(db, COLLECTIONS.STAFF, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

