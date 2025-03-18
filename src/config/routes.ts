
export const ROUTES = {
  INDEX: '/',
  LOGIN: '/login',
  DASHBOARD: '/dataops-hub',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DATA_CATALOG: '/data-catalog',
  DESIGNERS: {
    INDEX: '/designers',
    BUILD_PIPELINE: '/designers/build-datapipeline',
    BUILD_PLAYGROUND: (id:string) => `/designers/build-playground/${id}`,
    MANAGE_FLOW: '/designers/manage-flow',
    FLOW_PLAYGROUND: (id:string) => `/designers/flow-playground/${id}`,
  },
  DATAOPS: {
    INDEX: '/dataops-hub',
    OPS_HUB: '/dataops-hub/ops-hub',
    ALERTS: '/dataops-hub/alerts',
    RELEASE: '/dataops-hub/release-bundle'
  },
  ADMIN: {
    INDEX: '/admin-console',
    USERS: {
      INDEX: '/admin-console/users',
      ADD: '/admin-console/users/add',
      EDIT: (id: string) => `/admin-console/users/edit/${id}`
    },
    PROJECTS: {
      INDEX: '/admin-console/projects',
      ADD: '/admin-console/projects/add',
      EDIT: (id: string) => `/admin-console/projects/edit/${id}`
    },
    ENVIRONMENT: {
      INDEX: '/admin-console/environment',
      ADD: '/admin-console/environment/add',
      EDIT: (id: string) => `/admin-console/environment/edit/${id}`
    },
    CONNECTION:{
      INDEX: '/admin-console/connection',
      ADD: '/admin-console/connection/add',
      EDIT: (id: string) => `/admin-console/connection/edit/${id}`
    }
  }
} as const;
