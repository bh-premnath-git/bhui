export const ROUTES = {
  INDEX: '/',
  LOGIN: '/login',
  HOME: '/home',
  DASHBOARD: '/dataops-hub',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DATA_CATALOG: '/data-catalog',
  DESIGNERS: {
    INDEX: '/designers',
    BUILD_PLAYGROUND: (id:string | null) => id ? `/designers/build-playground/${id}` : '/designers/build-playground',
    Data_FLOW_PLAYGROUND: (id:string | null) => id ? `/designers/data-flow-playground/${id}` : '/designers/data-flow-playground',
    NOTEBOOK: '/designers/notebook',
    REQUIREMENTS: {
      INDEX: '/designers/requirements',
      DETAILS: (id:string) => `/designers/requirements/${id}`,
      NEW:`/designers/requirements/new`,
    },
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
    },
    PROMPT:{
      INDEX: '/admin-console/prompt',
      ADD: '/admin-console/prompt/add',
      EDIT: (id: string) => `/admin-console/prompt/edit/${id}`
    },
    COMPUTE_CLUSTER: {
      INDEX: '/admin-console/compute-cluster',
      ADD: '/admin-console/compute-cluster/add',
      EDIT: (id: string) => `/admin-console/compute-cluster/edit/${id}`
    },
    PII: {
      INDEX: '/admin-console/pii',
      MANAGE: '/admin-console/pii/manage'
    },
    LLM: {
      INDEX: '/admin-console/llm',
       ADD: '/admin-console/llm/add',
      EDIT: (id: string) => `/admin-console/llm/edit/${id}`
    },
  }
} as const;
