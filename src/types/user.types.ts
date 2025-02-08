export interface User {
  id: string;
  initials: string;
  name: string;
  description: string;
  email: string;
  projects: any[];
  roles: string[];
  status: string;
  created: string;
  lastActive: string;
}

export interface UserTableProps {
  users: User[];
}