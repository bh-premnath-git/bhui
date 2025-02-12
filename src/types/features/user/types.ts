export interface User {
    id: string;
    initials: string;
    username: string;
    description: string;
    email: string;
    projects: any[];
    realm_roles: string[];
    emailVerified: boolean;
    created: string;
    lastActive: string;
  }
  
  export interface UserTableProps {
    users: User[];
  }