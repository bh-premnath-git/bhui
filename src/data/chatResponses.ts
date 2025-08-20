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
      message: "Here are some sample projects you can use:",
      options: [
        { label: "Sample Project Alpha", next: "projectSelected" },
        { label: "Sample Project Beta", next: "projectSelected" }
      ],
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
      message: "Here are some sample environments you can use:",
      options: [
        { label: "Development Environment", next: "environmentSelected" },
        { label: "Production Environment", next: "environmentSelected" }
      ],
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
      message: "Here are some sample data sources you can use:",
      options: [
        { label: "Customer Orders Table", next: "dataSourceSelected" },
        { label: "Sales Report CSV File", next: "dataSourceSelected" }
      ],
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
      message: "Let's create a new pipeline! This will require setting up a project, environment, connection, and data source. Do you want to continue?",
      options: [
        { label: "Yes, let's start", next: "projectSetup" },
        { label: "No, show sample pipelines", next: "showSamplePipelines" }
      ]
    },
    
    // Project Setup Phase
    {
      id: "projectSetup",
      actor: "ai",
      message: "Step 1/4: First, let's set up a project. Do you want to create a new project?",
      options: [
        { label: "Yes", next: "showProjectCard" },
        { label: "No, use existing", next: "showSampleProjects" }
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
      message: "Here are some existing projects you can use:",
      options: [
        { label: "Sample Project Alpha", next: "projectSelected" },
        { label: "Sample Project Beta", next: "projectSelected" }
      ],
      nextOnSelect: "projectSelected"
    },
    {
      id: "projectSelected",
      actor: "ai",
      message: "✅ Project selected! Do you want to continue to environment setup?",
      options: [
        { label: "Yes, continue", next: "environmentSetup" },
        { label: "No, finish here", next: "pipelineIncomplete" }
      ]
    },
    
    // Environment Setup Phase
    {
      id: "environmentSetup",
      actor: "ai",
      message: "Step 2/4: Now let's set up an environment. Do you want to create a new environment?",
      options: [
        { label: "Yes", next: "showEnvironmentCard" },
        { label: "No, use existing", next: "showSampleEnvironments" }
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
      message: "Here are some existing environments you can use:",
      options: [
        { label: "Development Environment", next: "environmentSelected" },
        { label: "Production Environment", next: "environmentSelected" }
      ],
      nextOnSelect: "environmentSelected"
    },
    {
      id: "environmentSelected",
      actor: "ai",
      message: "✅ Environment selected! Do you want to continue to connection setup?",
      options: [
        { label: "Yes, continue", next: "connectionSetup" },
        { label: "No, finish here", next: "pipelineIncomplete" }
      ]
    },
    
    // Connection Setup Phase
    {
      id: "connectionSetup",
      actor: "ai",
      message: "Step 3/4: Now let's set up a connection. Do you want to create a new connection?",
      options: [
        { label: "Yes", next: "showConnectionCard" },
        { label: "No, use existing", next: "showSampleConnections" }
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
      message: "Here are some existing connections you can use:",
      options: [
        { label: "Sample DB - Localhost", next: "connectionSelected" },
        { label: "Sample API - Dev Server", next: "connectionSelected" }
      ],
      nextOnSelect: "connectionSelected"
    },
    {
      id: "connectionSelected",
      actor: "ai",
      message: "✅ Connection selected! Do you want to continue to data source setup?",
      options: [
        { label: "Yes, continue", next: "dataSourceSetup" },
        { label: "No, finish here", next: "pipelineIncomplete" }
      ]
    },
    
    // Data Source Setup Phase
    {
      id: "dataSourceSetup",
      actor: "ai",
      message: "Step 4/4: Finally, let's add a data source. Do you want to add a new data source?",
      options: [
        { label: "Yes", next: "chooseDataSourceType" },
        { label: "No, use existing", next: "showSampleDataSources" }
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
      id: "showSampleDataSources",
      actor: "ai",
      message: "Here are some existing data sources you can use:",
      options: [
        { label: "Customer Orders Table", next: "dataSourceSelected" },
        { label: "Sales Report CSV File", next: "dataSourceSelected" }
      ],
      nextOnSelect: "dataSourceSelected"
    },
    {
      id: "dataSourceSelected",
      actor: "ai",
      message: "✅ Data source selected! Now let's create the pipeline. Do you want to continue?",
      options: [
        { label: "Yes, create pipeline", next: "showPipelineCard" },
        { label: "No, finish setup", next: "pipelineIncomplete" }
      ]
    },
    
    // Final Pipeline Creation
    {
      id: "showPipelineCard",
      actor: "ai",
      uiComponent: {
        type: "Card",
        props: {
          title: "New Pipeline",
          description: "Click to start creating a new pipeline with all components"
        }
      },
      nextOnClick: "openPipelineForm"
    },
    {
      id: "openPipelineForm",
      actor: "system",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Add Pipeline",
          component: "AddPipeline"
        }
      }
    },
    {
      id: "pipelineCreated",
      actor: "ai",
      message: "🎉 Pipeline created successfully! Your pipeline is now ready with all components configured.",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Pipeline Canvas",
          component: "DataPipelineCanvas"
        }
      }
    },
    
    // Sample Pipelines
    {
      id: "showSamplePipelines",
      actor: "ai",
      message: "Here are some sample pipelines you can use:",
      options: [
        { label: "ETL - Customer Data", next: "pipelineSelected", pipelineJson: {
    "$schema": "https://json-schema.org/draft-07/schema#",
    "name": "pipline 7",
    "description": " ",
    "version": "1.0.0",
    "parameters": [],
    "connections": {
        "lookup1_csv": {
            "name": "aus 14 s3",
            "connection_type": "S3",
            "connection_config_id": 1,
            "file_path_prefix": "example",
            "bucket": "bh-dag-poc-1",
            "secret_name": "bh-s3-aus14s3"
        },
        "lookup2.csv": {
            "name": "aus 14 s3",
            "connection_type": "S3",
            "connection_config_id": 1,
            "file_path_prefix": "example",
            "bucket": "bh-dag-poc-1",
            "secret_name": "bh-s3-aus14s3"
        },
        "output": {
            "name": "aus14postgres",
            "connection_type": "PostgreSQL",
            "connection_config_id": 2,
            "database": "sample_db",
            "schema": "public",
            "secret_name": "bh-postgres-aus14postgres"
        }
    },
    "sources": {
        "lookup1_csv": {
            "name": "lookup1_csv",
            "source_type": "File",
            "data_src_id": 34,
            "file_name": "lookup1.csv",
            "connection": {
                "$ref": "#/connections/lookup1_csv"
            }
        },
        "lookup2.csv": {
            "name": "lookup2.csv",
            "source_type": "File",
            "data_src_id": 33,
            "file_name": "lookup2.csv",
            "connection": {
                "$ref": "#/connections/lookup2.csv"
            }
        }
    },
    "targets": {
        "output": {
            "name": "output",
            "target_type": "Relational",
            "table_name": "output",
            "load_mode": "overwrite",
            "file_name": "output.csv",
            "connection": {
                "$ref": "#/connections/output"
            }
        }
    },
    "transformations": [
        {
            "name": "lookup1_csv",
            "dependent_on": [],
            "transformation": "Reader",
            "source": {
                "$ref": "#/sources/lookup1_csv"
            },
            "read_options": {
                "header": true
            },
            "select_columns": [],
            "drop_columns": [],
            "rename_columns": {}
        },
        {
            "name": "Lookup",
            "transformation": "Lookup",
            "dependent_on": [
                "lookup1_csv"
            ],
            "lookup_type": "Column Based",
            "lookup_config": {
                "name": "lookup_config",
                "source": {
                    "$ref": "#/sources/lookup2.csv"
                },
                "read_options": {
                    "header": true
                }
            },
            "lookup_columns": [
                {
                    "column": "id",
                    "out_column_name": "id"
                },
                {
                    "column": "department",
                    "out_column_name": "department"
                },
                {
                    "column": "name",
                    "out_column_name": "name"
                }
            ],
            "lookup_conditions": [
                {
                    "column_name": "id",
                    "lookup_with": "id"
                }
            ],
            "keep": "First"
        },
        {
            "name": "output",
            "transformation": "Writer",
            "dependent_on": [
                "Lookup"
            ],
            "target": {
                "$ref": "#/targets/output"
            },
            "file_name": "output.csv",
            "write_options": {
                "header": true,
                "sep": ","
            }
        }
    ]
} },
        { 
          label: "Data Quality Check Pipeline", 
          next: "pipelineSelected",
          pipelineJson: {
            "$schema": "https://json-schema.org/draft-07/schema#",
            "name": "Data Quality Check Pipeline",
            "description": "Pipeline for data quality validation and cleansing",
            "version": "1.0.0",
            "parameters": [],
            "connections": {
              "input_data": {
                "name": "Data Source",
                "connection_type": "S3",
                "connection_config_id": 1,
                "file_path_prefix": "data-quality",
                "bucket": "bh-dag-poc-1",
                "secret_name": "bh-s3-data-quality"
              }
            },
            "sources": {
              "input_data": {
                "name": "input_data",
                "source_type": "File",
                "data_src_id": 35,
                "file_name": "raw_data.csv",
                "connection": {
                  "$ref": "#/connections/input_data"
                }
              }
            },
            "transformations": [
              {
                "name": "data_reader",
                "dependent_on": [],
                "transformation": "Reader",
                "source": {
                  "$ref": "#/sources/input_data"
                },
                "read_options": {
                  "header": true
                }
              },
              {
                "name": "data_validation",
                "transformation": "DataQuality",
                "dependent_on": ["data_reader"],
                "validation_rules": [
                  {
                    "column": "email",
                    "rule": "email_format"
                  },
                  {
                    "column": "age",
                    "rule": "numeric_range",
                    "min": 0,
                    "max": 120
                  }
                ]
              }
            ]
          }
        },
        { 
          label: "Sales Dashboard Refresh", 
          next: "pipelineSelected",
          pipelineJson: {
            "$schema": "https://json-schema.org/draft-07/schema#",
            "name": "Sales Dashboard Refresh",
            "description": "Pipeline to refresh sales dashboard data",
            "version": "1.0.0",
            "parameters": [],
            "connections": {
              "sales_db": {
                "name": "Sales Database",
                "connection_type": "PostgreSQL",
                "connection_config_id": 3,
                "database": "sales_db",
                "schema": "public",
                "secret_name": "bh-postgres-sales"
              }
            },
            "sources": {
              "sales_data": {
                "name": "sales_data",
                "source_type": "Table",
                "data_src_id": 36,
                "table_name": "sales_transactions",
                "connection": {
                  "$ref": "#/connections/sales_db"
                }
              }
            },
            "transformations": [
              {
                "name": "sales_reader",
                "dependent_on": [],
                "transformation": "Reader",
                "source": {
                  "$ref": "#/sources/sales_data"
                }
              },
              {
                "name": "sales_aggregation",
                "transformation": "Aggregation",
                "dependent_on": ["sales_reader"],
                "group_by": ["region", "product_category"],
                "aggregations": [
                  {
                    "column": "amount",
                    "function": "sum",
                    "alias": "total_sales"
                  },
                  {
                    "column": "transaction_id",
                    "function": "count",
                    "alias": "transaction_count"
                  }
                ]
              }
            ]
          }
        }
      ],
      nextOnSelect: "pipelineSelected"
    },
    {
      id: "pipelineSelected",
      actor: "ai",
      message: "✅ Pipeline selected successfully! Here's your pipeline canvas:",
      uiComponent: {
        type: "RightAsideComponent",
        props: {
          title: "Sample Pipeline Canvas",
          component: "DataPipelineCanvas"
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