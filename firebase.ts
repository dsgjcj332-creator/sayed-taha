import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Use Vite environment variables (prefixed with VITE_) so the build on Vercel
// doesn't rely on a local JSON file that may be gitignored.
// Example env vars to set in Vercel (Settings → Environment Variables):
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
// VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID,
// VITE_FIREBASE_APP_ID, VITE_FIREBASE_MEASUREMENT_ID, VITE_FIREBASE_FIRESTORE_DATABASE_ID

export const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
	appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
	firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || ''
};

export const isFirebaseConfigured = Boolean(
	firebaseConfig.apiKey &&
	firebaseConfig.authDomain &&
	firebaseConfig.projectId &&
	firebaseConfig.appId
);

const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId
	? getFirestore(app, firebaseConfig.firestoreDatabaseId)
	: getFirestore(app);
export const storage = isFirebaseConfigured && firebaseConfig.storageBucket ? getStorage(app) : null;
