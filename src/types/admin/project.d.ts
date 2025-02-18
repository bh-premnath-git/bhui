
export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'archived';
    type: 'development' | 'production';
    gitProvider: string;
    gitUsername: string;
    gitEmail: string;
    defaultBranch: string;
    gitHubUrl: string;
    gitHubToken: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  export type ProjectMutationData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
  