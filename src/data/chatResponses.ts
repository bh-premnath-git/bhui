// Interactive workflow system based on JSON configuration
export interface WorkflowStep {
  id: string;
  actor: 'ai' | 'system' | 'user';
  message?: string;
  options?: Array<{
    label: string;
    next: string;
  }>;
  uiComponent?: {
    type: 'Card' | 'RightAsideComponent';
    props: {
      title?: string;
      description?: string;
      component?: string;
    };
  };
  nextOnClick?: string;
  nextOnSelect?: string;
}

export interface WorkflowConfig {
  workflow: string;
  steps: WorkflowStep[];
}

// Connection setup workflow from ActionCategories.tsx
export const CONNECTION_WORKFLOW: WorkflowConfig = {
  workflow: "connection-setup",
  steps: [
    {
      id: "start",
      actor: "ai",
      message: "Do you want to create a new connection?",
      options: [
        { label: "Yes", next: "showConnectionCard" },
        { label: "No", next: "showSampleConnections" }
      ]
    },
    {
      id: "showConnectionCard",
      actor: "ai",
      uiComponent: {
        type: "Card",
        props: {
          title: "New Connection",
          description: "Click to start creating a new connection"
        }
      },
      nextOnClick: "openConnectionForm"
    },
    {
      id: "openConnectionForm",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Add Connection",
          component: "AddConnection"
        }
      }
    },
    {
      id: "showSampleConnections",
      actor: "ai",
      message: "Here are some sample connections you can use:",
      options: [
        { label: "Sample DB - Localhost", next: "connectionSelected" },
        { label: "Sample API - Dev Server", next: "connectionSelected" }
      ],
      nextOnSelect: "connectionSelected"
    },
    {
      id: "connectionSelected",
      actor: "ai",
      message: "✅ Connection selected successfully!"
    }
  ]
};