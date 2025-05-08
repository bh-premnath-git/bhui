# Data Platform

## Overview

This application provides a comprehensive platform for managing data workflows, including:

* **Data Catalog:** Discover, organize, and manage your data assets.
* **Data Pipeline Designer:** Visually create and orchestrate data pipelines.
* **DataOps Hub:** Monitor and manage data processing jobs.
* **Admin Console:** Tools for user, project, and environment administration.

## Technologies Used

* React
* TypeScript
* Redux Toolkit
* Tailwind CSS
* dnd-kit (for drag-and-drop)
* reactflow (for the flow designer)
* And more...

Project Architecture Tree Diagram

Packages:

  -   @bh-ai/flow-schema (Implicit - inferred from import)

Project Structure:

  -   src/
      -   api/
          -   release-api.ts (Data fetching for releases)
      -   components/
          -   bh-charts/ (Charting components)
              -   index.ts (Exports chart components and utilities)
          -   bh-reactflow-comps/ (React Flow components for pipeline design)
              -   builddata/
                  -   json/ (JSON schemas for node configuration)
                      -   Reader.json
                      -   Writer.json
                      -   Target.json
                      -   Source.json
                      -   Connection.json
                      -   CSVOptions.json
                      -   bigquery.json
                      -   gcs.json
                      -   mysql.json
                      -   oracle.json
                      -   postgres.json
                      -   s3.json
                      -   snowflake.json
                  -   validation.ts (Form validation logic)
              -   flow/
                  -   flow/
                      -   subcomponents/
                          -   NodeForm/ (Component for editing node properties)
                              -   hooks/
                                  -   useFormValidation.ts (Form validation hook)
                              -   utils/
                                  -   formUtils.ts (Form utility functions)
                                  -   updateFlowDefinitionOnServer.ts (Updates flow definition)
                              -   types.ts (Types for NodeForm)
                              -   index.ts (Exports NodeForm)
          -   headers/
              -   flow-playground-header/
                  -   components/
                      -   missing-fields-form/ (Form for missing fields)
                          -   utils.ts
                          -   types.ts
                          -   index.ts
          -   ui/
              -   use-toast.ts (Hook for displaying toast notifications)
      -   config/
          -   routes.ts (Application routes)
          -   platformenv.ts (Platform environment variables)
          -   navigation.ts (Navigation configuration)
      -   features/
          -   admin/ (Admin console features)
              -   connection/ (Connection management)
                  -   components/
                      -   connectionFormSchema.ts (Connection form schema)
                  -   hooks/
                      -   useConnection.ts (Connection-related hooks)
                  -   schemas/
                      -   connectionSchemas.ts (Connection schemas)
                  -   services/
                      -   connMgtSrv.ts (Connection management service)
              -   environment/ (Environment management)
                  -   components/
                      -   environmentFormSchema.ts (Environment form schema)
                  -   hooks/
                      -   useEnvironments.ts (Environment-related hooks)
                  -   services/
                      -   envMgtSrv.ts (Environment management service)
              -   projects/ (Project management)
                  -   components/
                      -   projectFormSchema.ts (Project form schema)
                  -   hooks/
                      -   useProjects.ts (Project-related hooks)
                  -   services/
                      -   projMgtSrv.ts (Project management service)
              -   prompt/ (Prompt management)
                  -   components/
                      -   promptFromSchema.ts (Prompt form schema)
                  -   hooks/
                      -   usePrompt.ts (Prompt-related hooks)
              -   users/ (User management)
                  -   components/
                      -   userFormSchema.ts (User form schema)
                  -   hooks/
                      -   useUserSearch.ts (User search hook)
                      -   useUsers.ts (User-related hooks)
                  -   services/
                      -   userMgtSrv.ts (User management service)
          -   data-catalog/ (Data Catalog features)
              -   components/
                  -   hooks/
                      -   useAboutData.ts (Hook for "About Data" functionality)
                  -   services/
                      -   dataService.ts (Data service)
                      -   apiService.ts (API service)
                  -   Xplore/
                      -   utils.ts (Utilities for Data Explorer)
                  -   schema.ts (Schemas for data catalog)
              -   hooks/
                  -   useXplore.ts (Hook for Data Explorer)
                  -   uselayoutFileds.ts (Hook for layout fields)
                  -   usedataCatalog.ts (Hook for data catalog)
                  -   useDatabase.ts (Hook for database interaction)
              -   services/
                  -   layoutFiledMgtSrv.ts (Layout field management service)
                  -   datacatalogMgtSrv.ts (Data catalog management service)
              -   types/
                  -   index.ts (Types for Data Catalog)
          -   dataops/ (DataOps Hub features)
              -   alertsHubs/ (Alerts Hub features)
                  -   hooks/
                      -   usealertHub.ts (Hook for Alerts Hub)
                  -   services/
                      -   alertsHubMgtSrv.ts (Alerts Hub management service)
              -   components/
                  -   hooks/
                      -   useAboutData.ts (Hook for "About Data" functionality)
                  -   services/
                      -   dataService.ts (Data service)
                      -   apiService.ts (API service)
                  -   Xplore/
                      -   utils.ts (Utilities for Data Explorer)
                  -   schema.ts (Schemas for dataops)
              -   dataOpsHubs/ (DataOps Hub features)
                  -   hooks/
                      -   useTaskDetails.ts (Hook for task details)
                      -   usedataOpsHub.ts (Hook for DataOps Hub)
                  -   services/
                      -   dataOpsHubMgtSrv.ts (DataOps Hub management service)
          -   designers/ (Designer features)
              -   flow/ (Flow designer)
                  -   components/
                      -   schema.ts (Schemas for flow designer)
                  -   hooks/
                      -   useFlow.ts (Flow-related hooks)
                  -   services/
                      -   flowMgtSrv.ts (Flow management service)
              -   pipeline/ (Pipeline designer)
                  -   components/
                      -   schema.ts (Pipeline form schema)
                  -   hooks/
                      -   usePipeline.ts (Pipeline-related hooks)
                  -   services/
                      -   pipelineMgtSrv.ts (Pipeline management service)
                  -   types/
                      -   formTypes.ts (Types for pipeline form)
              -   data-pipeline/ (Specific data pipeline implementation - potentially deprecated)
                  -   data/
                      -   sample_validation.json (Sample pipeline validation data)
                      -   node_display.json (Node display configuration)
                      -   mdata.json (Metadata schema)
                      -   json_schema_validators.json (JSON schema validators)
                      -   build_pipe_line_flow.json (Pipeline flow configuration)
          -   hooks/
              -   api/
                  -   useResource.ts (Hook for using API resources)
              -   useSuggestedQuestions.ts (Hook for suggested questions)
              -   useStreamingResponse.ts (Hook for handling streaming responses)
              -   useSQLQuery.ts (Hook for SQL query input)
              -   useReports.ts (Hook for report generation)
              -   useOtherTypes.ts (Hook for getting related operator types)
              -   useNodeOperations.ts (Hook for node operations in flow designer)
              -   useNodeFormInput.ts (Hook for node form input handling)
              -   useNavigation.ts (Hook for navigation)
              -   useModules.ts (Hook for modules)
              -   useMandatoryFieldOptions.ts (Hook for mandatory field options)
              -   useGroupedProperties.ts (Hook for grouping node properties)
              -   useGithubProviders.ts (Hook for fetching GitHub providers)
              -   useFormOperations.ts (Hook for form operations)
              -   useFlowOperations.ts (Hook for flow operations)
              -   useDropdownOptions.ts (Hook for dropdown options)
              -   useDebounce.ts (Hook for debouncing function calls)
              -   useConnections.ts (Hook for connections)
              -   useColorScheme.ts (Hook for color scheme)
              -   useChatMessages.ts (Hook for chat messages)
              -   use-toast.ts (Hook for toast notifications)
              -   useDebounce.ts
          -   lib/
              -   api/
                  -   api-service.ts (API service)
                  -   api-config.ts (API configuration)
              -   hooks/
                  -   useTransformationOutput.ts (Hook for transformation output)
                  -   useConnectionConfig.ts (Hook for connection configuration)
              -   validatePipelineConnections.ts (Pipeline connection validation)
              -   utils.ts (General utility functions)
              -   transformationUtils.ts (Transformation-related utilities)
              -   pipelineJsonConverter.ts (Pipeline JSON conversion utilities)
              -   pipelineJoinPayload.ts (Pipeline join payload utilities)
              -   pipelineAutoSuggestion.ts (Pipeline auto-suggestion utilities)
              -   object.ts (Object manipulation utilities)
              -   localStorageServices.ts (Local storage service)
              -   keycloak.ts (Keycloak integration)
              -   graphUtils.ts (Graph-related utilities)
              -   flowNodeValidator.ts (Flow node validation)
              -   fileParser.ts (File parsing utilities)
              -   encryption.ts (Encryption utilities)
              -   debounce.ts (Debouncing utility)
              -   date-format.ts (Date formatting utility)
              -   convertUIToPipelineJson.ts (UI to Pipeline JSON conversion)
              -   constants.ts (Constants)
              -   colors.ts (Color utilities)
          -   store/
              -   slices/
                  -   admin/
                      -   usersSlice.ts (Redux slice for users)
                      -   promptsSlice.ts (Redux slice for prompts)
                      -   projectsSlice.ts (Redux slice for projects)
                      -   environmentsSlice.ts (Redux slice for environments)
                      -   connection.ts (Redux slice for connections)
                  -   dataCatalog/
                      -   layoutFieldSlice.ts (Redux slice for layout fields)
                      -   datasourceSlice.ts (Redux slice for data sources)
                  -   dataops/
                      -   taskDetailSlice.ts (Redux slice for task details)
                      -   dataOpsHubSlice.ts (Redux slice for DataOps Hub)
                      -   alertHubSlice.ts (Redux slice for Alerts Hub)
                  -   designer/
                      -   buildPipeLine/
                          -   clusterSlice.ts (Redux slice for clusters)
                          -   BuildPipeLineSlice.ts (Redux slice for pipeline building)
                      -   features/
                          -   autoSaveSlice.ts (Redux slice for auto-saving)
                      -   pipelineSlice.ts (Redux slice for pipelines)
                      -   flowSlice.ts (Redux slice for flows)
                  -   globalGitSlice.ts (Redux slice for global Git data)
              -   index.ts (Redux store configuration)
          -   types/
              -   admin/
                  -   user.d.ts (Types for user data)
                  -   prompt.ts (Types for prompt data)
                  -   project.ts (Types for project data)
                  -   environment.ts (Types for environment data)
                  -   connectionConfig.ts (Types for connection configuration)
                  -   connection.ts (Types for connection data)
              -   data-catalog/
                  -   notebook/
                      -   note.ts (Types for notebook functionality)
                  -   xplore/
                      -   type.ts (Types for Data Explorer)
                  -   dataCatalog.ts (Types for data catalog)
              -   dataops/
                  -   realease.ts
                  -   dataOpsHub.ts (Types for DataOps Hub)
                  -   data-ops-hub.d.ts (Types for DataOps Hub data)
                  -   alertsHub.ts (Types for Alerts Hub)
              -   designer/
                  -   features/
                      -   formTypes.ts (Types for form-related functionality)
                  -   pipeline.ts (Types for pipeline data)
                  -   flow.ts (Types for flow data)
              -   table.ts (Types for table component)
              -   navigation.ts (Types for navigation)
              -   global.d.ts (Global type declarations)
          -   vite-env.d.ts (Vite environment types)
          -   index.css (Global CSS)
          -   App.css (App-specific CSS)
Explanation of the Tree Diagram

Top-Level: The src/ directory is the root of your application's source code.
Grouping by Concern: The tree is organized to group files by their primary function:
api/: Code for data fetching.
components/: Reusable UI elements.
config/: Application configuration.
features/: Self-contained modules of functionality.
hooks/: Custom React hooks.
lib/: Utility code and helper libraries.
store/: Redux state management.
types/: TypeScript type definitions.
pages/: Code for individual pages.
styles/: CSS files.
Hierarchy: The indentation indicates the nesting of directories and the relationships between files. For example, src/components/ui/ means that the use-toast.ts file is part of the ui components, which are themselves part of the broader components directory.
File Names: The file names give a strong indication of their purpose. For instance, useFormValidation.ts is likely a hook related to form validation.
Feature Grouping: The features/ directory is further broken down into subdirectories that represent major features of the application (e.g., admin/, data-catalog/, dataops/, designers/). This helps in understanding the high-level functional areas of the application.
Component Organization: The components/ directory is organized to separate general UI components (ui/) from feature-specific components (e.g., bh-charts/, bh-reactflow-comps/).
Types and Schemas: The types/ and components/bh-reactflow-comps/builddata/json/ directories are crucial for data structures and data validation.
Hooks and Services: The hooks/ and services/ directories highlight the separation of logic:
hooks/: React hooks for UI-related logic (e.g., managing state, handling side effects).
services/: Classes or modules that encapsulate business logic (e.g., data manipulation, interactions with external systems).

## Setup

1.  **Clone the repository:** `git clone <repository_url>`
2.  **Install dependencies:** `npm install` or `yarn install`
3.  **Configure environment variables:** (See `.env.example` for required variables)
4.  **Run the application:** `npm run dev` or `yarn dev`

## Key Features
Project Tree Map:

src
├── api
│   └── release-api.ts
├── components
│   ├── bh-charts
│   │   └── index.ts
│   ├── bh-reactflow-comps
│   │   ├── builddata
│   │   │   ├── json
│   │   │   │   ├── bigquery.json
│   │   │   │   ├── Connection.json
│   │   │   │   ├── CSVOptions.json
│   │   │   │   ├── gcs.json
│   │   │   │   ├── mysql.json
│   │   │   │   ├── oracle.json
│   │   │   │   ├── postgres.json
│   │   │   │   ├── Reader.json
│   │   │   │   ├── s3.json
│   │   │   │   ├── snowflake.json
│   │   │   │   ├── Source.json
│   │   │   │   ├── Target.json
│   │   │   │   └── Writer.json
│   │   │   └── validation.ts
│   │   └── flow
│   │       └── flow
│   │           └── subcomponents
│   │               └── NodeForm
│   │                   ├── hooks
│   │                   │   └── useFormValidation.ts
│   │                   ├── index.ts
│   │                   ├── types.ts
│   │                   └── utils
│   │                       ├── formUtils.ts
│   │                       └── updateFlowDefinitionOnServer.ts
│   ├── headers
│   │   └── flow-playground-header
│   │       └── components
│   │           └── missing-fields-form
│   │               ├── index.ts
│   │               ├── types.ts
│   │               └── utils.ts
│   └── ui
│       └── use-toast.ts
├── config
│   ├── navigation.ts
│   ├── platformenv.ts
│   └── routes.ts
├── features
│   ├── admin
│   │   ├── connection
│   │   │   ├── components
│   │   │   │   └── connectionFormSchema.ts
│   │   │   ├── hooks
│   │   │   │   └── useConnection.ts
│   │   │   ├── schemas
│   │   │   │   └── connectionSchemas.ts
│   │   │   └── services
│   │   │       └── connMgtSrv.ts
│   │   ├── environment
│   │   │   ├── components
│   │   │   │   └── environmentFormSchema.ts
│   │   │   ├── hooks
│   │   │   │   └── useEnvironments.ts
│   │   │   └── services
│   │   │       └── envMgtSrv.ts
│   │   ├── projects
│   │   │   ├── components
│   │   │   │   └── projectFormSchema.ts
│   │   │   ├── hooks
│   │   │   │   └── useProjects.ts
│   │   │   └── services
│   │   │       └── projMgtSrv.ts
│   │   ├── prompt
│   │   │   ├── components
│   │   │   │   └── promptFromSchema.ts
│   │   │   └── hooks
│   │   │       └── usePrompt.ts
│   │   └── users
│   │       ├── components
│   │       │   └── userFormSchema.ts
│   │       ├── hooks
│   │       │   ├── useUserSearch.ts
│   │       │   └── useUsers.ts
│   │       └── services
│   │           └── userMgtSrv.ts
│   ├── data-catalog
│   │   ├── components
│   │   │   ├── hooks
│   │   │   │   └── useAboutData.ts
│   │   │   ├── schema.ts
│   │   │   ├── services
│   │   │   │   ├── apiService.ts
│   │   │   │   └── dataService.ts
│   │   │   └── Xplore
│   │   │       └── utils.ts
│   │   ├── hooks
│   │   │   ├── useDatabase.ts
│   │   │   ├── usedataCatalog.ts
│   │   │   ├── uselayoutFileds.ts
│   │   │   └── useXplore.ts
│   │   ├── services
│   │   │   ├── datacatalogMgtSrv.ts
│   │   │   └── layoutFiledMgtSrv.ts
│   │   └── types
│   │       └── index.ts
│   ├── dataops
│   │   ├── alertsHubs
│   │   │   ├── hooks
│   │   │   │   └── usealertHub.ts
│   │   │   └── services
│   │   │       └── alertsHubMgtSrv.ts
│   │   ├── components
│   │   │   ├── hooks
│   │   │   │   └── useAboutData.ts
│   │   │   ├── schema.ts
│   │   │   ├── services
│   │   │   │   ├── apiService.ts
│   │   │   │   └── dataService.ts
│   │   │   └── Xplore
│   │   │       └── utils.ts
│   │   └── dataOpsHubs
│   │       ├── hooks
│   │       │   ├── useTaskDetails.ts
│   │       │   └── usedataOpsHub.ts
│   │       └── services
│   │           └── dataOpsHubMgtSrv.ts
│   └── designers
│       ├── flow
│       │   ├── components
│       │   │   └── schema.ts
│       │   ├── hooks
│       │   │   └── useFlow.ts
│       │   └── services
│       │       └── flowMgtSrv.ts
│       └── pipeline
│           ├── components
│           │   └── schema.ts
│           ├── hooks
│           │   └── usePipeline.ts
│           ├── services
│           │   └── pipelineMgtSrv.ts
│           └── types
│               └── formTypes.ts
├── hooks
│   ├── api
│   │   └── useResource.ts
│   ├── use-toast.ts
│   ├── useChatMessages.ts
│   ├── useColorScheme.ts
│   ├── useConnections.ts
│   ├── useDebounce.ts
│   ├── useDropdownOptions.ts
│   ├── useFlowOperations.ts
│   ├── useFormOperations.ts
│   ├── useGithubProviders.ts
│   ├── useGroupedProperties.ts
│   ├── useMandatoryFieldOptions.ts
│   ├── useModules.ts
│   ├── useNavigation.ts
│   ├── useNodeFormInput.ts
│   ├── useNodeOperations.ts
│   ├── useOtherTypes.ts
│   ├── useReports.ts
│   ├── useSQLQuery.ts
│   ├── useStreamingResponse.ts
│   └── useSuggestedQuestions.ts
├── lib
│   ├── api
│   │   ├── api-config.ts
│   │   └── api-service.ts
│   ├── colors.ts
│   ├── constants.ts
│   ├── convertUIToPipelineJson.ts
│   ├── date-format.ts
│   ├── debounce.ts
│   ├── encryption.ts
│   ├── fileParser.ts
│   ├── flowNodeValidator.ts
│   ├── graphUtils.ts
│   ├── hooks
│   │   ├── useConnectionConfig.ts
│   │   └── useTransformationOutput.ts
│   ├── keycloak.ts
│   ├── localStorageServices.ts
│   ├── object.ts
│   ├── pipelineAutoSuggestion.ts
│   ├── pipelineJoinPayload.ts
│   ├── pipelineJsonConverter.ts
│   ├── transformationUtils.ts
│   ├── utils.ts
│   └── validatePipelineConnections.ts
├── pages
│   └── designers
│       └── data-pipeline
│           └── data
│               ├── build_pipe_line_flow.json
│               ├── json_schema_validators.json
│               ├── mdata.json
│               ├── node_display.json
│               └── sample_validation.json
├── routes
│   └── routes.d.ts
├── store
│   ├── index.ts
│   └── slices
│       ├── admin
│       │   ├── connection.ts
│       │   ├── environmentsSlice.ts
│       │   ├── projectsSlice.ts
│       │   ├── promptsSlice.ts
│       │   └── usersSlice.ts
│       ├── data-catalog
│       │   ├── datasourceSlice.ts
│       │   └── layoutFieldSlice.ts
│       ├── dataops
│       │   ├── alertHubSlice.ts
│       │   ├── dataOpsHubSlice.ts
│       │   └── taskDetailSlice.ts
│       ├── designer
│       │   ├── buildPipeLine
│       │   │   ├── BuildPipeLineSlice.ts
│       │   │   └── clusterSlice.ts
│       │   ├── features
│       │   │   └── autoSaveSlice.ts
│       │   ├── flowSlice.ts
│       │   └── pipelineSlice.ts
│       └── globalGitSlice.ts
├── styles
│   └── globals.css
├── types
│   ├── admin
│   │   ├── connection.ts
│   │   ├── connectionConfig.ts
│   │   ├── environment.ts
│   │   ├── project.ts
│   │   ├── prompt.ts
│   │   └── user.d.ts
│   ├── data-catalog
│   │   ├── dataCatalog.ts
│   │   ├── notebook
│   │   │   └── note.ts
│   │   └── xplore
│   │       └── type.ts
│   ├── dataops
│   │   ├── alertsHub.ts
│   │   ├── data-ops-hub.d.ts
│   │   ├── dataOpsHub.ts
│   │   └── realease.ts
│   ├── designer
│   │   ├── features
│   │   │   └── formTypes.ts
│   │   ├── flow.ts
│   │   └── pipeline.ts
│   ├── global.d.ts
│   ├── navigation.ts
│   └── table.ts
├── App.css
├── index.css
└── vite-env.d.ts
Overview of Pages and Components:

The project appears to be a complex data platform application built with React (likely using Vite based on vite-env.d.ts), TypeScript, and Tailwind CSS (index.css uses Tailwind directives). It leverages Redux Toolkit for state management (store/index.ts) and React Flow for building visual interfaces (components/bh-reactflow-comps). Authentication seems to be handled via Keycloak (lib/keycloak.ts).

The application is structured into several core feature areas:

Data Catalog (src/features/data-catalog, src/types/data-catalog):

Allows users to browse and manage data sources (usedataCatalog.ts, datasourceSlice.ts).
Includes functionality for viewing layout fields (uselayoutFileds.ts, layoutFieldSlice.ts).
Features an "Xplore" section (useXplore.ts, src/types/data-catalog/xplore/type.ts), likely for querying and visualizing data using natural language, with various chart components (src/components/bh-charts). It uses streaming responses (useStreamingResponse.ts) and suggests questions (useSuggestedQuestions.ts).
Includes a "Notebook" feature (src/types/data-catalog/notebook/note.ts).
Provides functionality to import data sources from databases (useDatabase.ts).
Components for managing metadata like descriptions, owners, links, and tags (useAboutData.ts).
Designer (src/features/designers, src/types/designer):

Data Pipeline Builder (src/features/designers/pipeline, src/pages/designers/data-pipeline):
Visual interface for building data pipelines (BuildPipeLineSlice.ts, convertUIToPipelineJson.ts).
Uses React Flow nodes for different transformations (Reader, Target, Filter, Joiner, Sorter, Aggregator, etc.) defined in JSON (node_display.json, build_pipe_line_flow.json).
Includes schemas and validation for transformations (mdata.json, validation.ts).
Supports various data source/target connections defined in JSON (Connection.json, Source.json, Target.json, etc.).
Provides column suggestions (pipelineAutoSuggestion.ts) and payload generation for joins (pipelineJoinPayload.ts).
Manages pipeline state via Redux (pipelineSlice.ts).
Includes EMR cluster management (clusterSlice.ts).
Flow Manager (src/features/designers/flow):
Manages and designs data flows (useFlow.ts, flowSlice.ts).
Visual flow editor using React Flow (useFlowOperations.ts, useNodeOperations.ts).
Includes a form component (NodeForm/index.ts) for configuring nodes, likely based on @bh-ai/flow-schema (useModules.ts).
Features like auto-saving (autoSaveSlice.ts) and handling missing fields (missing-fields-form/index.ts).
Flow node validation (flowNodeValidator.ts).
Notebook (src/features/designers/notebook): Likely a code or markdown editor for data exploration or documentation, integrated within the Designer section (src/types/data-catalog/notebook/note.ts).
DataOps Hub (src/features/dataops, src/types/dataops):

Ops Hub (src/features/dataops/dataOpsHubs): Monitors data operations and jobs (usedataOpsHub.ts, dataOpsHubSlice.ts). Provides details on individual tasks (useTaskDetails.ts, taskDetailSlice.ts).
Alerts Hub (src/features/dataops/alertsHubs): Manages and displays alerts related to data operations (usealertHub.ts, alertHubSlice.ts).
Release Management (src/api/release-api.ts, src/types/dataops/realease.ts): Functionality for managing release bundles.
Admin Console (src/features/admin, src/types/admin):

User Management: Create, update, delete users, manage roles and project access (useUsers.ts, userFormSchema.ts, usersSlice.ts).
Project Management: Manage projects, including GitHub integration details (useProjects.ts, projectFormSchema.ts, projectsSlice.ts).
Environment Management: Configure development, staging, and production environments, potentially integrating with cloud providers like AWS (useEnvironments.ts, environmentFormSchema.ts, environmentsSlice.ts).
Connection Management: Set up and manage connections to various data sources (Snowflake, BigQuery, Postgres, etc.) (useConnection.ts, connectionFormSchema.ts, connectionSchemas.ts, connection.ts).
Prompt Management: Manage prompts used potentially by AI features (usePrompt.ts, promptFromSchema.ts, promptsSlice.ts).
Key Libraries & Utilities:

Styling: Tailwind CSS (index.css), clsx, tailwind-merge (utils.ts).
State Management: Redux Toolkit (store/index.ts).
API: Custom apiService built on Axios (api-service.ts), React Query (useResource.ts).
Forms: Likely uses a library like React Hook Form or Formik, integrated with Zod for schema validation (seen in various schema.ts files, e.g., features/admin/users/components/userFormSchema.ts).
Routing: React Router (inferred from useNavigate in useNavigation.ts and ROUTES config).
Visualizations/Diagrams: React Flow (components/bh-reactflow-comps), Recharts (inferred from components/bh-charts).
Utilities: Lodash (object.ts), date-fns (date-format.ts), CryptoJS (encryption.ts), PapaParse (fileParser.ts), XLSX (fileParser.ts).
UI Components: Custom UI components, likely built using Shadcn/ui principles (inferred from use-toast.ts and utils.ts).

main.tsx:

Entry Point: This is the main entry point of your React application.
Rendering: It uses createRoot from react-dom/client to render the main App component into the HTML element with the ID root.
CSS Import: It imports the global index.css stylesheet.
Crypto Polyfill: It includes a check and potential polyfill for window.crypto using window.nfCrypto if the standard crypto object is unavailable. This is sometimes needed for libraries that rely on the Web Crypto API in specific environments.
Analysis of App.tsx:

Root Component: This component sets up the core structure and providers for the entire application.
Providers Galore: The application is wrapped in numerous context providers, indicating a complex setup:
BrowserRouter: Enables client-side routing using React Router.
ThemeProvider: Manages application themes (light/dark).
ErrorBoundary: Catches rendering errors and displays a fallback UI (ErrorFallback).
KeycloakProvider: Handles authentication state using Keycloak (./hooks/useKeycloak).
Provider store={store}: Connects the application to the Redux store.
QueryClientProvider: Manages server state (fetching, caching) using TanStack Query (React Query).
TooltipProvider: Enables tooltips, likely from Shadcn/ui.
ReactFlowProvider: Provides context for React Flow diagrams (used in Designers).
FlowProvider & PipelineProvider: Custom contexts likely specific to the Flow and Pipeline designer features.
Notifications: It includes <Toaster /> and <Sonner />, suggesting two systems for displaying toast notifications are configured.
AppContent Component: This nested component ensures that Redux and Keycloak hooks (useAppDispatch, useKeycloak) can be used, as they require their respective providers to be higher up in the tree.
Initial Data Fetching: AppContent uses useEffect to dispatch Redux actions (fetchGithubProviders, fetchDataSourceTypes) to load initial global data only after the user is authenticated via Keycloak.
Routing: AppContent renders <AppRoutes />, which presumably defines the application's different pages and layouts based on the URL.