# ExploreDataComponent (Streaming Data Exploration)

## Overview

- Location: `src/components/chat/ExploreDataComponent.tsx`
- Purpose: Real-time, multi-step AI-driven data exploration with progressive streaming UI and a completed, tabbed results view.

## Public API

- Props: `{ query?: string; connection?: { id: number | string; connection_config_name: string }; threadId?: string }`

## Internal Types

- `StreamResponse` (component state)
  - `status?: 'streaming' | 'complete' | 'error'`
  - `error?: string`
  - From `MetaStartedEvent`: `title?`, `input_question?`, `request_id?`
  - Step content: `identify?`, `sql?`, `table?`, `explanation?`
  - From `MetaCompletedEvent`: `duration_ms?`, `results_summary?`
  - Progressive state: `currentStep?: StreamingStep`, `completedSteps?: string[]`

## Key Dependencies

- `useConversation` (SSE): `src/hooks/useConversation.ts`
- Streaming event types/guards: `src/types/streaming.ts`
- UI: `StreamingStepIndicator`, `StreamingContent`, `CompletedAnalysis`, `AnalysisMetrics`
- Tabs: `OverviewTab`, `TableTab`, `SqlTab`
- Util: `toNumber` from `src/lib/utils.ts`

## Core Logic

1. Validation
   - Requires `connection?.id`, `query`, and `threadId` to initiate streaming.
   - Converts `connection.id` via `toNumber()`; if `null`, sets `status: 'error'` and stops.

2. Start Streaming (useEffect)
   - Sets state: `{ status: 'streaming', currentStep: undefined, completedSteps: [] }`.
   - Calls `streamConversation(connId, query, threadId, onChunk, onComplete, onError)`.
   - Stores abort function in `streamAbortRef`.
   - Cleanup on unmount/deps change: calls abort (try/catch no-op) and clears ref.

3. Event Handling (onChunk with type guards)
   - `isMetaStarted` → `handleMetaStarted(evt)`:
     - Sets `status: 'streaming'`, copies `title`, `input_question`, `request_id`.
     - Sets `currentStep: 'thinking'` and `completedSteps: []`.
   - `isIdentify` → `handleIdentify(evt)`:
     - Sets `identify` and `currentStep: 'identifying'`.
     - Ensures `'thinking'` is included in `completedSteps`.
   - `isSql` → `handleSql(evt)`:
     - Sets `sql` and `currentStep: 'generating_sql'`.
     - Ensures `'thinking'`, `'identifying'` are in `completedSteps`.
   - `isTable` → `handleTable(evt)`:
     - Sets `table` and `currentStep: 'fetching_data'`.
     - Ensures `'thinking'`, `'identifying'`, `'generating_sql'` are in `completedSteps`.
   - `isExplanation` → `handleExplanation(evt)`:
     - Sets `explanation` and `currentStep: 'explaining'`.
     - Ensures previous steps plus `'fetching_data'` are in `completedSteps`.
   - `isMetaCompleted` → `handleMetaCompleted(evt)`:
     - Sets `status: 'complete'`, `duration_ms`, `results_summary`.
     - Sets `currentStep: 'complete'` and `completedSteps` to all prior steps.

4. Completion and Errors
   - `onComplete`: sets `status: 'complete'`, `currentStep: 'complete'`, clears abort ref.
   - `onError`: stringifies error to a message and sets `status: 'error'`, `error`.

5. Copy Helper
   - `handleCopy(text?)`: writes to clipboard if `text` is present; best-effort, silent on failure.

## Rendering Flow

- Container: `Card` with `StreamingStepIndicator` in header; content body from `renderContent()`.
- `renderContent()` branches:
  - Missing inputs (no `connection` or no `query`): guidance message + dashed bordered placeholder.
  - Streaming (`status === 'streaming'`): `StreamingContent` with `currentStep`, and any of `identify/sql/table/explanation` so far. `onCopy` supplied.
  - Completed or error: `AnalysisMetrics` (identify + duration + summary), then `CompletedAnalysis` with `sql`, `table`, `explanation`, `error`.

## Visual Components

- `StreamingStepIndicator` (`src/components/chat/features/StreamingStepIndicator.tsx`)
  - Types: `StreamingStep = 'thinking' | 'identifying' | 'generating_sql' | 'fetching_data' | 'explaining' | 'complete'`
  - `StreamingStatus = 'streaming' | 'complete' | 'error'`
  - Maps status/step to lucide icon and label; shows spinner while unknown; error icon on failure.

- `StreamingContent` (`src/components/chat/features/StreamingContent.tsx`)
  - Props: `currentStep`, `identify?`, `sql?`, `table?`, `explanation?`, `onCopy?`.
  - Step UIs:
    - thinking: spinner + "AI is analyzing..."
    - identifying: shows identified source if available.
    - generating_sql: shows source and a `SqlBlock` titled "Generated SQL".
    - fetching_data: shows source, `SqlBlock` ("SQL Query"), and `DataTable`.
    - explaining: shows source, `SqlBlock`, `DataTable`, and narrative analysis.

- `CompletedAnalysis` (`src/components/chat/features/CompletedAnalysis.tsx`)
  - Tabs: Overview (`OverviewTab`), Table (`TableTab`), SQL (`SqlTab`). Default: `overview`.
  - Shows error banner if `error` prop is set.

- `AnalysisMetrics` (`src/components/chat/features/AnalysisMetrics.tsx`)
  - Displays identify source and duration badge (seconds with 1 decimal). Hides if nothing to show.

## Tabs

- `OverviewTab` (`src/components/chat/tabs/OverviewTab.tsx`)
  - Inputs: `{ table?: TableEvent['content']; explanation?: string | null }`.
  - Uses bh-plotly-charts pipeline: `FieldTypeDetector` → `DataNormalizer` → `DataAggregator` → `PlotlyChartRenderer`.
  - `ChartControls` to configure: chart type, X/Y fields, aggregation, color scheme, custom color.
  - Auto-selects first string field as `xField` and first numeric as `yField` when data is present.
  - Renders Plotly chart to `chartContainerRef` when config is valid; handles errors.
  - Shows explanation text block below the chart.

- `TableTab` (`src/components/chat/tabs/TableTab.tsx`)
  - Props: `{ table?: TableEvent['content'] | null }`.
  - If missing table, shows muted "No table results available." Else renders `DataTable` in a bordered, scrollable container.

- `SqlTab` (`src/components/chat/tabs/SqlTab.tsx`)
  - Props: `{ sql?: string | null }`.
  - If `sql === undefined`, shows muted "SQL not available." Else shows `SqlBlock` with title "SQL", content or "(no SQL generated)", and `canCopy={!!sql}`.

## SSE Hook: useConversation

- Location: `src/hooks/useConversation.ts`
- `createConversation()`: POST to `${AGENT_REMOTE_URL}${API_PREFIX_URL}/conversation/create-conversation` (returns `{ thread_id, messages }`).
- `streamConversation(connectionId, userRequest, threadId, onChunk, onComplete?, onError?, module?)`:
  - URL: `${AGENT_REMOTE_URL}${API_PREFIX_URL}/conversation/conversation/query/stream` (+ `?connection_config_id=` unless `module === 'dataops'`).
  - Headers: `Content-Type: application/json`, `Authorization: Bearer ${sessionStorage.getItem('kc_token')}`.
  - Body: `{ user_request, thread_id, module: module ?? 'explorer' }`.
  - Reads `ReadableStream` with `TextDecoder`, buffers by `\n\n`, parses `data:` lines as JSON.
  - Supports single object or array per event; calls `onChunk` for each.
  - On end: flushes buffer and calls `onComplete`. Returns `() => abortController.abort()`.
  - Errors: non-OK throws; parse errors logged with payload; catch emits toast unless `onError` supplied.

## Streaming Types and Guards

- Location: `src/types/streaming.ts`
- Types:
  - MetaStarted/Completed events with `meta.status: 'started' | 'completed'`.
  - Step events: `IdentifyEvent ('IDENTIFY')`, `SqlEvent ('SQL')`, `TableEvent ('TABLE')`, `ExplanationEvent ('EXPLANATION')`.
  - `TableContent` payload: `{ column_names: string[]; column_values: (string|number|null)[][]; metadata: { total_rows; columns_count } }`.
- Guards: `isMetaStarted`, `isMetaCompleted`, `isIdentify`, `isSql`, `isTable`, `isExplanation`.

## Utilities

- `toNumber(v: number | string): number | null` (from `src/lib/utils.ts`)
  - Returns finite number or `null` if invalid; used to validate `connection.id` before streaming.

## Error Handling & Cleanup

- Input validation errors set `status: 'error'` with a message.
- Streaming errors: handled by `onError` and `useConversation` catch/toast; UI shows error banner in `CompletedAnalysis`.
- Abort controller is always cleared on completion or unmount.

## Data Flow Summary

1. Inputs validated; `connection.id` converted via `toNumber`.
2. SSE stream opened with `useConversation.streamConversation`.
3. Incoming SSE chunks parsed; type guards dispatch to handlers.
4. UI updates progressively via `StreamingContent`.
5. When completed: `AnalysisMetrics` + `CompletedAnalysis` tabs (Overview/Table/SQL).
6. `OverviewTab` normalizes and charts the final table with Plotly; `TableTab` renders table; `SqlTab` shows SQL.

---

## bh-plotly-charts Overview (used by OverviewTab)

- Pipeline: `FieldTypeDetector` → `DataNormalizer` → `DataAggregator` → `ColorProvider` → `PlotlyChartRenderer`.
- Charts: bar, column, line, scatter, pie, histogram, box, heatmap, number.
- `ChartControls`: chart type, X/Y fields, aggregation, color scheme, custom color.
- Behavior in `OverviewTab`:
  - Auto-picks first string for X and first numeric for Y.
  - Renders responsively (min height ≈ 384px), with try/catch around render.
  - Explanation text rendered below the chart.

---

## CompletedAnalysis (Tabs)

- Location: `src/components/chat/features/CompletedAnalysis.tsx`
- Tabs: Overview (`OverviewTab`), Table (`TableTab`), SQL (`SqlTab`). Default to `overview`.
- Error-first rendering: red banner if `error` prop provided.

---

## Auxiliary UI Components

- `DataTable` (used in streaming and Table tab): renders `TableContent` (`column_names`, `column_values`, `metadata`).
- `SqlBlock` (used in streaming and SQL tab): shows syntax-highlighted SQL with copy option.

---

## Extensibility & Notes

- Stream parser supports arrays or single objects per SSE event.
- Easy to add new steps or metrics by extending streaming types and UI switch cases.
- Plotly layer is modular; can add chart types, aggregations, or color schemes without touching streaming.