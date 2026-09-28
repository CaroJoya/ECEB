import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let db: Database | null = null;
let storage: FirebaseStorage | null = null;

if (hasConfig) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getDatabase(app);
    storage = getStorage(app);
  } catch (err) {
    console.error('[Firebase] Initialization failed, falling back to demo mode', err);
    app = null;
    db = null;
    storage = null;
  }
} else {
  if (typeof window === 'undefined') {
    console.warn(
      '[Firebase] Missing env vars. Set NEXT_PUBLIC_FIREBASE_* in .env.local. Running in local demo mode.'
    );
  }
}

export const isFirebaseReady = Boolean(db);

export { app, db, storage };