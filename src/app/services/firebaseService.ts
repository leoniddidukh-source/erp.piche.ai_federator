import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';

export interface ModuleLog {
  timestamp: string;
  moduleName: string;
  stateDescription: string;
  summarization: string;
  [key: string]: unknown;
}

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId?: string;
  appId?: string;
}

class FirebaseService {
  private db = null as ReturnType<typeof getFirestore> | null;
  private logCollectionName: string;

  constructor() {
    this.logCollectionName =
      import.meta.env.REACT_APP_LOG_COLLECTION || 'modules_ai_reports';
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      // Get Firebase config from environment variables
      const config: FirebaseConfig = {
        apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY || '',
        authDomain: import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
        projectId: import.meta.env.REACT_APP_FIREBASE_PROJECT_ID || '',
        storageBucket: import.meta.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: import.meta.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.REACT_APP_FIREBASE_APP_ID,
      };

      if (!config.apiKey || !config.projectId) {
        console.warn('Firebase configuration incomplete. Some features may not work.');

        return;
      }

      // Initialize Firebase app if not already initialized
      let app;
      if (getApps().length === 0) {
        app = initializeApp(config);
      } else {
        app = getApp();
      }

      this.db = getFirestore(app);
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }

  /**
   * Read module logs from Firestore collection
   * @param moduleName - Optional module name filter
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   */
  async getModuleLogs(moduleName?: string, startDate?: Date, endDate?: Date): Promise<ModuleLog[]> {
    if (!this.db) {
      throw new Error('Firebase not initialized');
    }

    try {
      const logsCollection = collection(this.db, this.logCollectionName);
      const queryConstraints: Array<ReturnType<typeof where> | ReturnType<typeof orderBy>> = [
        orderBy('timestamp', 'desc'),
      ];

      // Apply filters
      if (moduleName) {
        queryConstraints.push(where('moduleName', '==', moduleName));
      }

      if (startDate) {
        queryConstraints.push(where('timestamp', '>=', Timestamp.fromDate(startDate)));
      }

      if (endDate) {
        queryConstraints.push(where('timestamp', '<=', Timestamp.fromDate(endDate)));
      }

      const logsQuery = query(logsCollection, ...queryConstraints);
      const querySnapshot = await getDocs(logsQuery);
      const logs: ModuleLog[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to ISO string if needed
        const timestamp =
          data.timestamp instanceof Timestamp
            ? data.timestamp.toDate().toISOString()
            : data.timestamp || new Date().toISOString();

        const log: ModuleLog = {
          ...data,
          timestamp,
          moduleName: data.moduleName || '',
          stateDescription: data.stateDescription || '',
          summarization: data.summarization || '',
        };

        logs.push(log);
      });

      // Additional date filtering in case Firestore query doesn't handle it properly
      const filteredLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        if (startDate && logDate < startDate) return false;
        if (endDate && logDate > endDate) return false;

        return true;
      });

      return filteredLogs;
    } catch (error) {
      console.error('Error fetching module logs:', error);
      throw error;
    }
  }

  /**
   * Get logs for a specific module
   */
  async getModuleState(moduleName: string): Promise<ModuleLog | null> {
    const logs = await this.getModuleLogs(moduleName);

    return logs.length > 0 ? logs[0] : null; // Return most recent log
  }

  /**
   * Get all available module names
   */
  async getAvailableModules(): Promise<string[]> {
    if (!this.db) {
      throw new Error('Firebase not initialized');
    }

    try {
      const logsCollection = collection(this.db, this.logCollectionName);
      const querySnapshot = await getDocs(logsCollection);

      const moduleNames = new Set<string>();

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.moduleName) {
          moduleNames.add(data.moduleName);
        }
      });

      return Array.from(moduleNames).sort();
    } catch (error) {
      console.error('Error fetching available modules:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
