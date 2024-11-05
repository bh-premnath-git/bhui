import { ApiService } from "@/services/apiServices";

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

    private getDeploymentIdFromKey(key: string): number | null {
        try {
            return parseInt(key);
        } catch (error) {
            console.error('Failed to parse deployment ID from key:', key);
            return null;
        }
    }

    private async syncWithDatabase() {
        if (this.pendingSyncs.size === 0) return;

        // Get the first pending sync
        const [key, sync] = Array.from(this.pendingSyncs.entries())[0];
        const deploymentId = this.getDeploymentIdFromKey(sync.key);

        if (!deploymentId) return;

        try {

            // /api/v1/flow/flow-deployement/{flow_deployment_id}
            const resp = await ApiService(
                '8011',
                'get',
                `/flow/flow-deployement/${deploymentId}`,
            )
            const syncData = ({ ...resp, ...sync.value });
            if(syncData){
            const response = await ApiService(
                '8011',
                'put',
                `/flow/flow-deployement/${deploymentId}`,
                syncData
            );

            if (response.success) {
                this.pendingSyncs.delete(key);
                console.log(`Synced item with deployment ${deploymentId}`);
            }
        }else{
            this.pendingSyncs.delete(key);
        }
        } catch (error) {
            console.error('Database sync failed:', error);
        }
    }

    async forceSyncNow(deploymentId: number): Promise<void> {
        // Find the sync for this deployment ID
        const sync = Array.from(this.pendingSyncs.values())
            .find(sync => this.getDeploymentIdFromKey(sync.key) === deploymentId);

        if (!sync) return;

        try {
            const syncData = {
                [sync.key]: sync.value
            };

            const response = await ApiService(
                '8011',
                'put',
                `/api/v1/flow/flow-deployement/${deploymentId}`,
                syncData
            );

            if (response.success) {
                this.pendingSyncs.delete(sync.key);
                console.log(`Force synced item with deployment ${deploymentId}`);
            }
        } catch (error) {
            console.error('Force sync failed:', error);
            throw error;
        }
    }

    isPendingSync(key: string): boolean {
        return this.pendingSyncs.has(key);
    }

    getPendingSyncCount(): number {
        return this.pendingSyncs.size;
    }

    queueForSync(key: string, value: any) {
        const deploymentId = this.getDeploymentIdFromKey(key);
        if (value !== null && deploymentId) {
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