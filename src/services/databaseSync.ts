import { ApiService } from "@/services/apiServices";
import { LocalStorageService } from '@/services/localStorageServices';

interface PendingSync {
  key: string;
  value: any;
  timestamp: number;
  operation: 'set' | 'remove';
}

class DatabaseSyncService {
  private static instance: DatabaseSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private pendingSyncs: Map<string, PendingSync> = new Map();
  private isInitialized: boolean = false;

  private constructor() {
  }

  static getInstance(): DatabaseSyncService {
    if (!DatabaseSyncService.instance) {
      DatabaseSyncService.instance = new DatabaseSyncService();
    }
    return DatabaseSyncService.instance;
  }

  initialize(intervalMs: number = 30000) {
    if (this.isInitialized) return;

    window.addEventListener('storage', this.handleStorageChange);

    this.syncInterval = setInterval(() => {
      this.syncWithDatabase();
    }, intervalMs);

    this.isInitialized = true;
  }

  private handleStorageChange = (event: StorageEvent) => {
    if (!event.key) return;

    const pendingSync: PendingSync = {
      key: event.key,
      value: event.newValue ? JSON.parse(event.newValue) : null,
      timestamp: Date.now(),
      operation: event.newValue ? 'set' : 'remove'
    };

    this.pendingSyncs.set(event.key, pendingSync);
  };

  private async syncWithDatabase() {
    if (this.pendingSyncs.size === 0) return;

    const syncsToProcess = Array.from(this.pendingSyncs.values());
    
    try {
      const response = await ApiService(
        '8011',
        'post',
        '/storage/batch-sync',
        syncsToProcess
      );

      if (response.success) {
        syncsToProcess.forEach(sync => {
          this.pendingSyncs.delete(sync.key);
        });
        console.log(`Synced ${syncsToProcess.length} items with database`);
      }
    } catch (error) {
      console.error('Database sync failed:', error);
    }
  }

  async forceSyncNow(): Promise<void> {
    await this.syncWithDatabase();
  }

  isPendingSync(key: string): boolean {
    return this.pendingSyncs.has(key);
  }

  getPendingSyncCount(): number {
    return this.pendingSyncs.size;
  }

  queueForSync(key: string) {
    const value = LocalStorageService.getItem(key);
    if (value !== null) {
      this.pendingSyncs.set(key, {
        key,
        value,
        timestamp: Date.now(),
        operation: 'set'
      });
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange);
    this.isInitialized = false;
  }
}

export const databaseSyncService = DatabaseSyncService.getInstance();