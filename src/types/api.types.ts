export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'archived';
}

export interface Environment {
  id: number;
  name: string;
  type: 'development' | 'staging' | 'production';
  status: 'active' | 'inactive';
}