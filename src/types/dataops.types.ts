export interface Alert {
  id: number;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved';
  timestamp: string;
}

export interface Release {
  id: number;
  name: string;
  environment: string;
  status: 'pending' | 'deployed' | 'failed';
  created_by: string;
  last_updated: string;
  deployed_on?: string;
}

export interface Operation {
  id: number;
  name: string;
  type: 'pipeline' | 'workflow' | 'task';
  status: 'running' | 'completed' | 'failed';
  lastRun?: string;
}