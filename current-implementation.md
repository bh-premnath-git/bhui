**Home view** – `HomeLayout` shows a welcome screen with feature cards and a
   chat input. Once the user starts interacting it renders `LayoutRenderer` to
   display the chat area and any active renderer panels.
**Chat control** – `ChatControllerContext` exposes methods for selecting
   modes, sending messages and switching layouts. It integrates with the
   `chatService`, updates Redux slices and persists renderer state for each
   message.
**Mode managers** – `chatService` orchestrates mode‑specific managers
   (e.g. `PipelineManager`, `DataExplorerManager`). Each manager dispatches
   Redux actions and returns a tailored response that defines the renderer to
   display. Additional managers handle onboarding, administration and other WIP
   features.
**Layout system** – Layout definitions (`layout-model.ts`) describe 1‑, 2‑ and
   3‑column as well as 2‑row arrangements. `SplitterLayoutRenderer` traverses the
   layout tree and renders leaf panels inside an `AppSplitter` that remembers
   panel sizes in local storage.
**Renderers** – `RendererHost` mounts the current renderer based on the
   `render` slice. Implemented renderers include a pipeline editor, a data
   explorer with toolbar/inspector panels, and a placeholder for unfinished
   modes.
**Chat UI** – `MessagesList` virtualises messages and displays assistant
   stages (thinking, tool, rendering, complete). `ChatInput` offers text entry,
   optional mode suggestions and browser speech recognition.

## State Management
The app avoids component-level state; all meaningful data lives in a central
Redux store accessed through typed hooks. Redux Toolkit holds application
state in dedicated slices:
- **homeSlice** – controls whether the app is in the welcome or chat view and
  tracks the selected widget.
- **layoutSlice** – stores the active layout type and whether a transition is
  occurring. Helpers switch between one, two or three column layouts and close
  panels.
- **chatSlice** – manages the current mode, message history, streaming state and
  suggestions. Messages are also kept in a `virtualizedItems` array used by the
  message list.
- **renderSlice** – tracks which renderer is active, its data and status. It
  saves renderer state per message so selecting a past assistant message restores
  the corresponding visualization.
- **inspectorSlice** – handles auxiliary panels for the data explorer such as
  Filters or Fields, including loading/error states.
- **assetsSlice** – provides an in‑memory LRU cache for large objects like query
  results.
- **userSlice** – stores the user’s display name, timezone, roles and a dynamic
  greeting.

## Services and Managers
`src/services` contains the chat service and a directory of managers. The
`chatService` acts as an orchestrator and uses a factory to retrieve the
appropriate manager for the active mode. Managers like `PipelineManager` and
`DataExplorerManager` dispatch Redux actions (e.g. `setRenderer`) and return
tailored responses while keeping chatService lightweight. Each manager
implements a shared interface and describes how a chat mode behaves:
- What renderer to activate
- How to generate a mock response
- Whether the UI should switch to a multi‑column layout
This pattern makes it easy to add new modes or replace the mock logic with real
API calls later.

### Available Chat Modes

`chatSlice` defines a range of chat modes that are paired with managers under
`src/services/managers`:

- `create-pipeline` – handled by **PipelineManager** for building data pipelines
- `explore-data` – **DataExplorerManager** for interactive analysis
- `analyze-code` – **CodeAnalysisManager** *(placeholder)*
- `generate-report` – **ReportGeneratorManager** *(placeholder)*
- `optimize-query` – **QueryOptimizerManager** *(placeholder)*
- `check-jobs` – **CheckJobsManager** *(placeholder)*
- `add-user` – **AddUserManager** *(placeholder)*
- `add-connection` – **AddConnectionManager** *(placeholder)*
- `onboard-dataset` – **OnboardDatasetManager** *(placeholder)*
- `add-project` – **AddProjectManager** *(placeholder)*
- `add-environment` – **AddEnvironmentManager** *(placeholder)*
- `default` – **DefaultManager** fallback for unrecognised queries

## Components
- **Chat components** (`src/components/chat`) – `MessagesList` and `ChatInput`.
  The input includes mode shortcut buttons and optional voice recording. The
  message list uses `@tanstack/react-virtual` for performance.
- **Layout components** (`src/components/layout`) – orchestration for the split
  layout, welcome screens, feature cards and inspector panel.
- **Renderers** (`src/components/renderers`) – visual areas such as the pipeline
  view or data explorer. The data explorer includes a connection selector and
  toolbar that can open inspector panels.
- **Splitter** – `AppSplitter` provides a draggable, persistable splitter used by
  the layout renderer.
- **UI library** – reusable primitives from `src/components/ui` wrap shadcn‑ui
  components to maintain a consistent design system.

## Pipeline and Data Explorer Implementation

### Pipeline Mode (`create-pipeline`)
The pipeline mode enables users to create and visualize data processing workflows through an interactive chat interface.

#### Architecture Flow:
1. **Mode Detection**: When users type pipeline-related queries, `ManagerFactory.detectModeFromQuery()` identifies the intent and switches to `create-pipeline` mode
2. **Manager Selection**: `PipelineManager` handles all pipeline-related operations:
   - Activates the `pipeline-renderer` via `setRenderer()` 
   - Generates contextual responses about pipeline stages
   - Switches to 2-column layout for visual pipeline editing
3. **State Management**: Pipeline data is stored in Redux `renderSlice`:
   - Each message creates a state snapshot with `updateData()`
   - `messageStates` object maintains pipeline configurations per conversation
   - `setActiveMessage()` restores previous pipeline states when clicking message history
4. **Rendering**: `PipelineRenderer` component displays the interactive pipeline editor in the right panel
5. **Layout Integration**: `SplitterLayoutRenderer` manages the chat/pipeline split view with resizable panels

#### Key Features:
- **State Persistence**: Each pipeline query creates a unique state snapshot
- **Message History**: Clicking previous pipeline messages restores their specific configurations
- **Dynamic Layout**: Automatically switches between 1-column (chat only) and 2-column (chat + pipeline) layouts
- **Interactive Editor**: Right panel provides visual pipeline configuration tools

### Data Explorer Mode (`explore-data`)
The data explorer mode provides interactive data analysis and visualization capabilities.

#### Architecture Flow:
1. **Mode Detection**: Data exploration queries trigger `explore-data` mode through query pattern matching
2. **Manager Selection**: `DataExplorerManager` orchestrates data exploration:
   - Activates `data-explorer-renderer` for interactive data views
   - Generates mock analytics responses with metrics and insights
   - Conditionally switches to 2-column layout based on connection status
3. **State Management**: Exploration state managed through Redux:
   - Query results and visualizations stored in `renderSlice.data`
   - Connection configurations persisted across sessions
   - Message-specific data states for exploration history
4. **Rendering**: `DataExplorerRenderer` provides:
   - Connection selector for data sources
   - Interactive charts and data grids
   - Toolbar for filtering and data manipulation
5. **Inspector Integration**: Additional panels (Filters, Fields) managed through `inspectorSlice`

#### Key Features:
- **Connection Management**: `DataExplorerConnectionSelector` handles data source connections
- **Interactive Visualizations**: Real-time chart updates and data filtering
- **State Restoration**: Previous exploration sessions restored via message history
- **Multi-Panel Layout**: Chat, data view, and inspector panels work together

### Technical Implementation Details

#### Manager Pattern:
```typescript
interface BaseManager {
  mode: ChatMode;
  canHandle(mode: ChatMode): boolean;
  selectMode(dispatch: AppDispatch): void;
  generateResponse(userMessage: string): string;
  shouldSwitchToTwoColumn(messages: any[], data: any): boolean;
  getRenderer(): RendererId;
}
```

#### State Flow:
1. User sends message → `ChatControllerContext` processes input
2. Mode detected → Appropriate manager selected via `ManagerFactory`
3. Manager dispatches `setRenderer()` → UI switches to correct renderer
4. Response generated → Message added to chat history
5. State persisted → `updateData()` stores current configuration
6. Layout adjusted → `layoutSlice` manages panel visibility

#### Message History Restoration:
- Each assistant message stores renderer state in `messageStates`
- Clicking previous messages triggers `setActiveMessage(messageId)`
- Renderer state restored from `messageStates[messageId]`
- UI automatically updates to show previous configuration

Both modes demonstrate the extensible architecture where new analysis capabilities can be added by implementing the `BaseManager` interface and creating corresponding renderer components.