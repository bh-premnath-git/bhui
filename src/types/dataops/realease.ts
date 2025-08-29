export interface Release {
    id: number;
    name: string;
    environment: string;
    status: 'pending' | 'deployed' | 'failed';
    created_by: string;
    last_updated: string;
    deployed_on?: string;
  }