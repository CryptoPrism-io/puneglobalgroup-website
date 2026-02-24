import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize Firebase in the browser
let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function getApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getApp());
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(getApp());
  return _db;
}

// Convenient named exports — safe to import anywhere, lazy on first use
export const auth = new Proxy({} as Auth, {
  get: (_, prop) => {
    const a = getFirebaseAuth();
    const val = (a as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? val.bind(a) : val;
  },
});

export const db = new Proxy({} as Firestore, {
  get: (_, prop) => {
    const d = getFirebaseDb();
    const val = (d as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? val.bind(d) : val;
  },
});

export default getApp;
