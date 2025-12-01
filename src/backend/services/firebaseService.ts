import type { App } from 'firebase-admin/app';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

interface ModuleLog {
  timestamp: string;
  moduleName: string;
  stateDescription: string;
  summarization: string;
  [key: string]: unknown;
}

interface FirebaseConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

class FirebaseService {
  private app: App | null = null;
  private db: ReturnType<typeof getFirestore> | null = null;
  private logCollectionName: string;

  constructor() {
    this.logCollectionName = process.env.REACT_APP_LOG_COLLECTION || process.env.LOG_COLLECTION || 'modules_ai_reports';
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    if (getApps().length > 0) {
      this.app = getApps()[0];

      return;
    }

    const config: FirebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    };

    if (!config.projectId || !config.privateKey || !config.clientEmail) {
      console.warn('Firebase credentials not fully configured. Some features may not work.');

      return;
    }

    try {
      this.app = initializeApp({
        credential: cert({
          projectId: config.projectId,
          privateKey: config.privateKey,
          clientEmail: config.clientEmail,
        }),
      });
      this.db = getFirestore(this.app);
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
      let querySnapshot;

      // Avoid composite index requirements by fetching and filtering in memory
      // Only use simple queries that don't require composite indexes
      if (moduleName && !startDate && !endDate) {
        // Simple filter by moduleName only (no ordering to avoid index requirement)
        querySnapshot = await this.db.collection(this.logCollectionName).where('moduleName', '==', moduleName).get();
      } else if (!moduleName && (startDate || endDate)) {
        // Date filtering only - can use orderBy
        let logsQuery = this.db.collection(this.logCollectionName).orderBy('timestamp', 'desc');
        if (startDate) {
          logsQuery = logsQuery.where('timestamp', '>=', Timestamp.fromDate(startDate));
        }
        if (endDate) {
          logsQuery = logsQuery.where('timestamp', '<=', Timestamp.fromDate(endDate));
        }
        querySnapshot = await logsQuery.get();
      } else {
        // Complex case: fetch all and filter/sort in memory to avoid index requirements
        querySnapshot = await this.db.collection(this.logCollectionName).get();
      }

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

      // Filter and sort in memory to avoid Firestore index requirements
      let filteredLogs = logs;

      // Filter by moduleName if specified
      if (moduleName) {
        filteredLogs = filteredLogs.filter(log => log.moduleName === moduleName);
      }

      // Filter by date range
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        if (startDate && logDate < startDate) return false;
        if (endDate && logDate > endDate) return false;

        return true;
      });

      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
      const querySnapshot = await this.db.collection(this.logCollectionName).get();
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
export type { ModuleLog };
