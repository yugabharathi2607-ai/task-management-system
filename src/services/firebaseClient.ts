import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { Firestore, doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import { AuthUser } from '../types/task';

interface FirebaseAppletConfig {
  projectId?: string;
  appId?: string;
  apiKey?: string;
  authDomain?: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

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

const configModules = import.meta.glob<{ default: FirebaseAppletConfig }>(
  '/firebase-applet-config.json',
  { eager: true }
);

const rawConfig: FirebaseAppletConfig | undefined =
  configModules['/firebase-applet-config.json']?.default;

const hasValidConfig = Boolean(
  rawConfig &&
    rawConfig.apiKey &&
    rawConfig.projectId &&
    rawConfig.projectId !== 'remixed-project-id' &&
    rawConfig.appId
);

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;

if (hasValidConfig && rawConfig) {
  firebaseApp = initializeApp(rawConfig);
  firestoreDb = rawConfig.firestoreDatabaseId
    ? getFirestore(firebaseApp, rawConfig.firestoreDatabaseId)
    : getFirestore(firebaseApp);
  firebaseAuth = getAuth(firebaseApp);
}

export const isFirebaseConfigured = (): boolean => Boolean(firebaseApp && firebaseAuth && firestoreDb);

export function getFirebaseAuth(): Auth | null {
  return firebaseAuth;
}

export function getFirestoreDb(): Firestore | null {
  return firestoreDb;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = firebaseAuth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) ?? [],
    },
    operationType,
    path,
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  if (!firestoreDb) return;
  try {
    await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

if (isFirebaseConfigured()) {
  void testConnection();
}

function mapFirebaseUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

export function subscribeToAuthChanges(callback: (user: AuthUser | null) => void): () => void {
  if (!firebaseAuth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(firebaseAuth, (user) => {
    callback(mapFirebaseUser(user));
  });
}

export async function signInWithGoogle(): Promise<AuthUser | null> {
  if (!firebaseAuth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(firebaseAuth, provider);
  return mapFirebaseUser(result.user);
}

export async function signOutUser(): Promise<void> {
  if (!firebaseAuth) return;
  await signOut(firebaseAuth);
}
