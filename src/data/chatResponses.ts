import { CATALOG_REMOTE_API_URL } from "@/config/platformenv";

// Interactive workflow system based on JSON configuration
export interface WorkflowStep {
  id: string;
  actor: 'ai' | 'system' | 'user';
  message?: string;
  options?: Array<{
    label: string;
    next: string;
    pipelineJson?: any; // Optional pipeline configuration JSON
  }>;
  // Dynamic options fetched from API. When present, chat should call the endpoint and
  // render the returned items as selectable options.
  dynamicOptions?: {
    endpoint: string; // e.g., 'connection_registry/connection_config/list/?limit=10&offset=0'
    isResponseFormat: boolean; // true => { data: [...] }, false => [...]
    displayName: string; // dot-path to primary label field
    subName?: string | null; // optional dot-path to subtitle field
  };
  uiComponent?: (
    {
      type: 'Card';
      props: {
        title?: string;
        description?: string;
      };
    } |
    {
      type: 'RightAsideComponent';
      props: {
        title?: string;
        component?: string;
        // Optional extra configuration for UI (e.g., toggle targets)
        extra?: any;
      };
    } |
    {
      type: 'Input';
      props: {
        placeholder?: string;
        buttonLabel?: string;
      };
    } |
    {
      type: 'TextArea';
      props: {
        placeholder?: string;
        buttonLabel?: string;
        rows?: number;
      };
    }
  );
  // Optional API call to perform on entering this step
  api?: {
    baseUrl?: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    usePrefix?: boolean;
  };
  nextOnClick?: string;
  nextOnSelect?: string;
  nextOnSubmit?: string;
  inputKey?: string; // key to store input value (e.g., 'pipelineName')
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
        { label: "No", next: "showExistingConnections" }
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
      id: "showExistingConnections",
      actor: "ai",
      message: "Select an existing connection:",
      dynamicOptions: {
        endpoint: "connection_registry/connection_config/list/?limit=10&offset=0",
        isResponseFormat: true,
        displayName: "connection_config_name",
        subName: "connection_name"
      },
      nextOnSelect: "connectionSelected"
    },
    {
      id: "connectionSelected",
      actor: "ai",
      message: "✅ Connection selected successfully!"
    }
  ]
};


// Project setup workflow
export const PROJECT_WORKFLOW: WorkflowConfig = {
  workflow: "project-setup",
  steps: [
    {
      id: "start",
      actor: "ai",
      message: "Do you want to create a new project?",
      options: [
        { label: "Yes", next: "showProjectCard" },
        { label: "No", next: "showSampleProjects" }
      ]
    },
    {
      id: "showProjectCard",
      actor: "ai",
      uiComponent: {
        type: "Card",
        props: {
          title: "New Project",
          description: "Click to start creating a new project"
        }
      },
      nextOnClick: "openProjectForm"
    },
    {
      id: "openProjectForm",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Add Project",
          component: "AddProject"
        }
      }
    },
    {
      id: "projectCreated",
      actor: "ai",
      message: "✅ Project created successfully!"
    },
    {
      id: "showSampleProjects",
      actor: "ai",
      message: "Select an existing project:",
      dynamicOptions: {
        endpoint: "bh_project/list/?limit=10&offset=0",
        isResponseFormat: true,
        displayName: "bh_project_name",
        subName: null
      },
      nextOnSelect: "projectSelected"
    },
    {
      id: "projectSelected",
      actor: "ai",
      message: "✅ Project selected successfully!"
    }
  ]
};

// Environment setup workflow
export const ENVIRONMENT_WORKFLOW: WorkflowConfig = {
  workflow: "environment-setup",
  steps: [
    {
      id: "start",
      actor: "ai",
      message: "Do you want to create a new environment?",
      options: [
        { label: "Yes", next: "showEnvironmentCard" },
        { label: "No", next: "showSampleEnvironments" }
      ]
    },
    {
      id: "showEnvironmentCard",
      actor: "ai",
      uiComponent: {
        type: "Card",
        props: {
          title: "New Environment",
          description: "Click to start creating a new environment"
        }
      },
      nextOnClick: "openEnvironmentForm"
    },
    {
      id: "openEnvironmentForm",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Add Environment",
          component: "AddEnvironment"
        }
      }
    },
    {
      id: "environmentCreated",
      actor: "ai",
      message: "✅ Environment created successfully!"
    },
    {
      id: "showSampleEnvironments",
      actor: "ai",
      message: "Select an existing environment:",
      dynamicOptions: {
        endpoint: "environment/environment/list/?limit=10&offset=0",
        isResponseFormat: true,
        displayName: "bh_env_name",
        subName: null
      },
      nextOnSelect: "environmentSelected"
    },
    {
      id: "environmentSelected",
      actor: "ai",
      message: "✅ Environment selected successfully!"
    }
  ]
};

// Data catalog setup workflow
export const DATA_CATALOG_WORKFLOW: WorkflowConfig = {
  workflow: "data-catalog-setup",
  steps: [
    {
      id: "start",
      actor: "ai",
      message: "Do you want to add a new data source?",
      options: [
        { label: "Yes", next: "chooseDataSourceType" },
        { label: "No", next: "showSampleDataSources" }
      ]
    },
    {
      id: "chooseDataSourceType",
      actor: "ai",
      message: "What kind of data source would you like to add?",
      options: [
        { label: "Table", next: "showTableCard" },
        { label: "File", next: "showFileCard" }
      ]
    },
    {
      id: "showTableCard",
      actor: "ai",
      uiComponent: {
        type: "Card",
        props: {
          title: "New Table Source",
          description: "Click to start adding a new table data source"
        }
      },
      nextOnClick: "openTableForm"
    },
    {
      id: "openTableForm",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Add Table Data Source",
          component: "AddTable"
        }
      }
    },
    {
      id: "tableAdded",
      actor: "ai",
      message: "✅ Table data source added successfully!"
    },
    {
      id: "showFileCard",
      actor: "ai",
      uiComponent: {
        type: "Card",
        props: {
          title: "New File Source",
          description: "Click to start adding a new file data source"
        }
      },
      nextOnClick: "openFileForm"
    },
    {
      id: "openFileForm",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Add File Data Source",
          component: "AddFile"
        }
      }
    },
    {
      id: "fileAdded",
      actor: "ai",
      message: "✅ File data source added successfully!"
    },
    {
      id: "showSampleDataSources",
      actor: "ai",
      message: "Select an existing data source:",
      dynamicOptions: {
        endpoint: "data_source/list/?limit=10&offset=0",
        isResponseFormat: true,
        displayName: "data_src_name",
        subName: "connection_config.custom_metadata.connection_type"
      },
      nextOnSelect: "dataSourceSelected"
    },
    {
      id: "dataSourceSelected",
      actor: "ai",
      message: "✅ Data source selected successfully!"
    }
  ]
};

// Pipeline setup workflow - combines all components
export const PIPELINE_WORKFLOW: WorkflowConfig = {
  workflow: "pipeline-setup",
  steps: [
    {
      id: "start",
      actor: "ai",
      message: "Select a project:",
      dynamicOptions: {
        endpoint: "bh_project/list/?limit=10&offset=0",
        isResponseFormat: true,
        displayName: "bh_project_name",
        subName: null
      },
      nextOnSelect: "showSampleEnvironments"
    },
    
    // Project Setup Phase
    {
      id: "projectSetup",
      actor: "ai",
      message: "First, set up a project. Create new or use existing.",
      options: [
        { label: "Create new project", next: "showProjectCard" },
        { label: "Use existing project", next: "showSampleProjects" }
      ]
    },
    {
      id: "showProjectCard",
      actor: "ai",
      uiComponent: {
        type: "Card",
        props: {
          title: "New Project",
          description: "Click to start creating a new project"
        }
      },
      nextOnClick: "openProjectForm"
    },
    {
      id: "openProjectForm",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Add Project",
          component: "AddProject"
        }
      }
    },
    {
      id: "showSampleProjects",
      actor: "ai",
      message: "Select an existing project:",
      dynamicOptions: {
        endpoint: "bh_project/list/?limit=10&offset=0",
        isResponseFormat: true,
        displayName: "bh_project_name",
        subName: null
      },
      nextOnSelect: "environmentSetup"
    },
    {
      id: "projectSelected",
      actor: "ai",
      message: "✅ Project selected!",
      options: [
        { label: "Next: Environment setup", next: "environmentSetup" }
      ]
    },
    
    // Environment Setup Phase
    {
      id: "environmentSetup",
      actor: "ai",
      message: "Next, set up an environment. Create new or use existing.",
      options: [
        { label: "Create new environment", next: "showEnvironmentCard" },
        { label: "Use existing environment", next: "showSampleEnvironments" }
      ]
    },
    {
      id: "showEnvironmentCard",
      actor: "ai",
      uiComponent: {
        type: "Card",
        props: {
          title: "New Environment",
          description: "Click to start creating a new environment"
        }
      },
      nextOnClick: "openEnvironmentForm"
    },
    {
      id: "openEnvironmentForm",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Add Environment",
          component: "AddEnvironment"
        }
      }
    },
    {
      id: "showSampleEnvironments",
      actor: "ai",
      message: "Select an existing environment:",
      dynamicOptions: {
        endpoint: "environment/environment/list/?limit=10&offset=0",
        isResponseFormat: true,
        displayName: "bh_env_name",
        subName: null
      },
      nextOnSelect: "askPipelineName"
    },
    {
      id: "environmentSelected",
      actor: "ai",
      message: "✅ Environment selected! You're ready to create the pipeline.",
      options: [
        { label: "Create Pipeline", next: "askPipelineName" }
      ]
    },

    // Final Pipeline Creation - Refactored flow using chat input
   
    {
      id: "askPipelineName",
      actor: "ai",
      message: "Can you give the pipeline name?",
      inputKey: "pipelineName",
      nextOnSubmit: "askPipelineMode"
    },
    {
      id: "askPipelineMode",
      actor: "ai",
      message: "What kind of pipeline do you want?",
      // Dynamically provide options using a hook implemented in the chat panel
      dynamicOptions: {
        endpoint: "hook:useEngineTypes",
        isResponseFormat: false,
        displayName: "label",
        subName: null
      },
      nextOnSelect: "askPipelineKind"
    },
    {
      id: "askPipelineKind",
      actor: "ai",
      message: "What kind of pipeline you need?",
      options: [
        { label: "Requirement", next: "createPipeline" },
        { label: "Natural Language", next: "createPipeline" }
      ],
      nextOnSelect: "createPipeline"
    },
    { 
      id: "createPipeline",
      actor: "system",
      message: "Creating your pipeline...",
      api: {
        baseUrl: CATALOG_REMOTE_API_URL,
        url: "/api/v1/pipeline/",
        method: "POST",
        usePrefix: false
      },
      nextOnClick: "promptPipelineDescription"
    },
    {
      id: "promptPipelineDescription",
      actor: "ai",
      message: "Describe your expected pipeline",
      inputKey: "pipelineExpectation",
      api: {
        baseUrl: CATALOG_REMOTE_API_URL,
        url: "/api/v1/agent/pipeline-description",
        method: "POST",
        usePrefix: false
      },
      nextOnSubmit: "openPipelineCanvas"
    },
    {
      id: "showDesignCard",
      actor: "ai",
      uiComponent: {
        type: "Card",
        props: {
          title: "Design your pipeline",
          description: "Click to proceed with design"
        }
      },
      nextOnClick: "createPipeline"
    },
    {
      id: "showRequirementCard",
      actor: "ai",
      uiComponent: {
        type: "Card",
        props: {
          title: "Define requirements",
          description: "Click to open the Requirement form"
        }
      },
      nextOnClick: "openRequirementForm"
    },
    {
      id: "openPipelineCanvas",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Pipeline Canvas",
          component: "DataPipelineCanvas",
          extra: {
            toggles: [
              {
                id: 'requirement-form',
                title: 'Requirement',
                componentId: 'requirement-form',
                targetComponent: 'RequirementForm'
              },
              {
                id: 'pipeline-canvas',
                title: 'Pipeline',
                componentId: 'pipeline-canvas',
                targetComponent: 'DataPipelineCanvas'
              },
              {
                id: 'data-table-view',
                title: 'Data Table',
                componentId: 'data-table-view',
                targetComponent: 'SampleDataTableView'
              }
            ]
          }
        }
      }
    },
    {
      id: "openRequirementForm",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Requirement",
          component: "RequirementForm",
          // Provide toggle meta so RightAside can render icons for switching
          extra: {
            toggles: [
              {
                id: 'requirement-form',
                title: 'Requirement',
                componentId: 'requirement-form',
                targetComponent: 'RequirementForm'
              },
              {
                id: 'pipeline-canvas',
                title: 'Pipeline',
                componentId: 'pipeline-canvas',
                targetComponent: 'DataPipelineCanvas'
              },
              {
                id: 'data-table-view',
                title: 'Data Table',
                componentId: 'data-table-view',
                targetComponent: 'SampleDataTableView'
              }
            ]
          }
        }
      }
    },
    
    // Sample Pipelines
    {
      id: "showSamplePipelines",
      actor: "ai",
      message: "Select an existing pipeline:",
      dynamicOptions: {
        endpoint: "pipeline/list/?limit=1000&order_desc=true",
        isResponseFormat: false,
        displayName: "pipeline_name",
        subName: "bh_project_name"
      },
      nextOnSelect: "pipelineSelected"
    },
    {
      id: "pipelineSelected",
      actor: "ai",
      message: "✅ Pipeline selected successfully! Here's your pipeline canvas:\nUse the icons above to switch between Requirement and Pipeline.",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Sample Pipeline Canvas",
          component: "DataPipelineCanvas",
          extra: {
            toggles: [
              {
                id: 'requirement-form',
                title: 'Requirement',
                componentId: 'requirement-form',
                targetComponent: 'RequirementForm'
              },
              {
                id: 'pipeline-canvas',
                title: 'Pipeline',
                componentId: 'pipeline-canvas',
                targetComponent: 'DataPipelineCanvas'
              },
              {
                id: 'data-table-view',
                title: 'Data Table',
                componentId: 'data-table-view',
                targetComponent: 'SampleDataTableView'
              }
            ]
          }
        }
      }
    },
    
    // Incomplete pipeline message
    {
      id: "pipelineIncomplete",
      actor: "ai",
      message: "Setup stopped. You can continue the pipeline creation process anytime by selecting 'Create Pipeline' again."
    }
  ]
};

// Job statistics and monitoring workflow
export const JOB_STATISTICS_WORKFLOW: WorkflowConfig = {
  workflow: "job-statistics",
  steps: [
    {
      id: "start",
      actor: "ai",
      message: "I'll help you check your job statistics and pipeline performance. What would you like to monitor?",
      options: [
        { label: "Recent Job Status", next: "showRecentJobs" },
        { label: "Failed Jobs", next: "showFailedJobs" },
        { label: "Performance Metrics", next: "showPerformanceMetrics" },
        { label: "All Job Statistics", next: "showAllStatistics" }
      ]
    },
    {
      id: "showRecentJobs",
      actor: "ai",
      message: "Here's your recent job activity:",
      uiComponent: {
        type: "Card",
        props: {
          title: "Recent Jobs Dashboard",
          description: "View recent job executions and their status"
        }
      },
      nextOnClick: "openJobsDashboard"
    },
    {
      id: "showFailedJobs",
      actor: "ai",
      message: "Let me show you jobs that need attention:",
      uiComponent: {
        type: "Card",
        props: {
          title: "Failed Jobs Analysis",
          description: "Review failed jobs and error details"
        }
      },
      nextOnClick: "openFailedJobsPanel"
    },
    {
      id: "showPerformanceMetrics",
      actor: "ai",
      message: "Here are your pipeline performance insights:",
      uiComponent: {
        type: "Card",
        props: {
          title: "Performance Dashboard",
          description: "View execution times, resource usage, and trends"
        }
      },
      nextOnClick: "openPerformancePanel"
    },
    {
      id: "showAllStatistics",
      actor: "ai",
      message: "Opening comprehensive job statistics dashboard:",
      uiComponent: {
        type: "Card",
        props: {
          title: "Complete Job Statistics",
          description: "Full overview of all job metrics and analytics"
        }
      },
      nextOnClick: "openFullStatistics"
    },
    {
      id: "openJobsDashboard",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Recent Jobs",
          component: "JobsDashboard"
        }
      }
    },
    {
      id: "openFailedJobsPanel",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Failed Jobs Analysis",
          component: "FailedJobsPanel"
        }
      }
    },
    {
      id: "openPerformancePanel",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Performance Metrics",
          component: "PerformancePanel"
        }
      }
    },
    {
      id: "openFullStatistics",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Job Statistics Dashboard",
          component: "JobStatisticsDashboard"
        }
      }
    }
  ]
};