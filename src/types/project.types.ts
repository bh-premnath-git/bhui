export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'archived';
}

export interface ProjectTableProps {
  projects: Project[];
}