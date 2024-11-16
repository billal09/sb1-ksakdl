import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { firebaseConfig } from '../config/firebase.config';

class FirebaseService {
  private static instance: FirebaseService | null = null;
  private app: FirebaseApp;
  private _db: Firestore;
  private _auth: Auth;
  private initialized = false;

  private constructor() {
    try {
      // Check if Firebase app is already initialized
      if (getApps().length > 0) {
        this.app = getApps()[0];
        this._db = getFirestore(this.app);
        this._auth = getAuth(this.app);
      } else {
        // Initialize new Firebase app
        this.app = initializeApp(firebaseConfig);

        // Initialize Firestore with optimized settings
        this._db = initializeFirestore(this.app, {
          localCache: persistentLocalCache({
            tabManager: persistentSingleTabManager(),
            cacheSizeBytes: CACHE_SIZE_UNLIMITED
          })
        });

        // Initialize Auth
        this._auth = getAuth(this.app);

        // Connect to emulators in development
        if (import.meta.env.DEV) {
          connectFirestoreEmulator(this._db, 'localhost', 8080);
          connectAuthEmulator(this._auth, 'http://localhost:9099');
        }

        // Enable offline persistence
        this.setupPersistence();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase');
    }
  }

  private async setupPersistence(): Promise<void> {
    if (!this.initialized) {
      try {
        await enableIndexedDbPersistence(this._db, {
          synchronizeTabs: true
        });
      } catch (err: any) {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence enabled in first tab only');
        } else if (err.code === 'unimplemented') {
          console.warn('Browser doesn\'t support persistence');
        } else {
          console.error('Persistence setup error:', err);
        }
      }
    }
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public static resetInstance(): void {
    FirebaseService.instance = null;
  }

  get db(): Firestore {
    return this._db;
  }

  get auth(): Auth {
    return this._auth;
  }

  get firebaseApp(): FirebaseApp {
    return this.app;
  }
}

// Create and export singleton instance
const firebaseService = FirebaseService.getInstance();
export const db = firebaseService.db;
export const auth = firebaseService.auth;
export const app = firebaseService.firebaseApp;