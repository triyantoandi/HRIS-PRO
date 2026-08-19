import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDocFromServer,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  User,
  AttendanceRecord,
  LeaveRequest,
  OvertimeRequest,
  Branch,
  Shift,
  SystemSettings,
  PayrollRecord,
  AttendanceCorrection,
  NotificationItem,
  AuditLogItem,
} from '../types';

// Initialize Firebase App & Database
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is in offline mode or connecting...');
    }
    return false;
  }
}

// Collections Definitions
export const COLLECTIONS = {
  USERS: 'users',
  ATTENDANCE: 'attendance',
  LEAVES: 'leaves',
  OVERTIME: 'overtime',
  BRANCHES: 'branches',
  SHIFTS: 'shifts',
  SETTINGS: 'settings',
  PAYROLL: 'payroll',
  CORRECTIONS: 'corrections',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'auditLogs',
};

/**
 * Real-time Snapshot Listeners
 */
export function subscribeToCollection<T>(
  collectionName: string,
  onData: (items: T[]) => void
) {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as T[];
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
    }
  );
}

/**
 * Generic Upsert Document
 */
export async function saveDocument(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
    throw error;
  }
}

/**
 * Generic Delete Document
 */
export async function deleteDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
    throw error;
  }
}

/**
 * Seed initial mock data if collections are empty
 */
export async function seedInitialFirestoreData(initialData: {
  users: User[];
  branches: Branch[];
  shifts: Shift[];
  settings: SystemSettings;
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  overtimes: OvertimeRequest[];
  payroll: PayrollRecord[];
  corrections: AttendanceCorrection[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
}) {
  try {
    const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    if (usersSnap.empty) {
      console.log('Seeding initial HRIS dataset to Firestore...');
      
      for (const user of initialData.users) {
        await setDoc(doc(db, COLLECTIONS.USERS, user.id), user);
      }
      for (const branch of initialData.branches) {
        await setDoc(doc(db, COLLECTIONS.BRANCHES, branch.id), branch);
      }
      for (const shift of initialData.shifts) {
        await setDoc(doc(db, COLLECTIONS.SHIFTS, shift.id), shift);
      }
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'company_config'), initialData.settings);
      
      for (const att of initialData.attendance) {
        await setDoc(doc(db, COLLECTIONS.ATTENDANCE, att.id), att);
      }
      for (const leave of initialData.leaves) {
        await setDoc(doc(db, COLLECTIONS.LEAVES, leave.id), leave);
      }
      for (const ot of initialData.overtimes) {
        await setDoc(doc(db, COLLECTIONS.OVERTIME, ot.id), ot);
      }
      for (const pay of initialData.payroll) {
        await setDoc(doc(db, COLLECTIONS.PAYROLL, pay.id), pay);
      }
      for (const notif of initialData.notifications) {
        await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notif.id), notif);
      }
      for (const log of initialData.auditLogs) {
        await setDoc(doc(db, COLLECTIONS.AUDIT_LOGS, log.id), log);
      }
      console.log('Firestore seed completed successfully.');
    }
  } catch (error) {
    console.warn('Initial seeding encountered an error or was skipped:', error);
  }
}
