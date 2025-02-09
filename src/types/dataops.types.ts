export interface Alert {
  id: number;
  flow_name: string;
  project_name: string;
  alert_description: string;
  alter_status: 'open' | 'closed' | 'in_progress';
  monitor: {
    monitor_type: string;
  };
  created_on: string;
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

export interface FilterValues {
  project: string
  flow: string
  status: string
  startDate: Date | undefined
  endDate: Date | undefined
}

export interface FilterOption {
  value: string
  label: string
}
