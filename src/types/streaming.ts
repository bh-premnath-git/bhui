// ISO 8601 timestamp string
export type ISODateTimeString = string;

/* ===========================
   Meta sections
   =========================== */

export interface MetaStarted {
  version: string;
  timestamp: ISODateTimeString;
  request_id: string;
  status: "started";
  title: string;
}

export interface MetaCompleted {
  version: string;
  timestamp: ISODateTimeString;
  request_id: string;
  status: "completed";
  title?: string;
}

export interface StartedData {
  message: string;            // "Processing has started"
  input_question: string;
}

export interface ResultsSummary {
  response_type: "final";
  steps_completed: number;
  tables_generated: number;
}

export interface CompletedData {
  message: string;            // "Processing has completed"
  duration_ms: number;
  results_summary: ResultsSummary;
}

export interface MetaStartedEvent {
  meta: MetaStarted;
  data: StartedData;
}

export interface MetaCompletedEvent {
  meta: MetaCompleted;
  data: CompletedData;
}

/* ===========================
   Response chunks
   =========================== */

export type ResponseType = "IDENTIFY" | "SQL" | "TABLE" | "EXPLANATION";

// TABLE payload
export type TableCell = string | number | null;

export interface TableContent {
  column_names: string[];
  column_values: TableCell[][];
  metadata: {
    total_rows: number;
    columns_count: number;
  };
}

export interface IdentifyEvent {
  response_type: "IDENTIFY";
  content: string;                // e.g., "public.products"
  timestamp: ISODateTimeString;
}

export interface SqlEvent {
  response_type: "SQL";
  content: string | null;         // can be null
  timestamp: ISODateTimeString;
}

export interface TableEvent {
  response_type: "TABLE";
  content: TableContent;
  timestamp: ISODateTimeString;
}

export interface ExplanationEvent {
  response_type: "EXPLANATION";
  content: string;                // e.g., "NO_RELEVANT_TABLES:" or narrative
  timestamp: ISODateTimeString;
}

/* ===========================
   Stream union
   =========================== */

export type StreamingChunk =
  | MetaStartedEvent
  | IdentifyEvent
  | SqlEvent
  | TableEvent
  | ExplanationEvent
  | MetaCompletedEvent;

/* ===========================
   Type guards
   =========================== */

export const isMetaStarted = (x: unknown): x is MetaStartedEvent =>
  !!x && typeof x === "object" && "meta" in x && (x as any).meta?.status === "started";

export const isMetaCompleted = (x: unknown): x is MetaCompletedEvent =>
  !!x && typeof x === "object" && "meta" in x && (x as any).meta?.status === "completed";

export const isIdentify = (x: unknown): x is IdentifyEvent =>
  !!x && (x as any).response_type === "IDENTIFY";

export const isSql = (x: unknown): x is SqlEvent =>
  !!x && (x as any).response_type === "SQL";

export const isTable = (x: unknown): x is TableEvent =>
  !!x && (x as any).response_type === "TABLE";

export const isExplanation = (x: unknown): x is ExplanationEvent =>
  !!x && (x as any).response_type === "EXPLANATION";
