export interface PredefinedRecognizer {
  id: string;
  name: string;
  description: string;
  entityType: string;
  patterns: string[];
  enabled: boolean;
  builtIn: true;
  category: 'personal' | 'financial' | 'medical' | 'government' | 'other';
}

export interface CustomRecognizer {
  id: string;
  name: string;
  description?: string;
  entityType: string;
  patterns: RegexPattern[];
  contextWords: string[];
  confidenceScore: number;
  enabled: boolean;
  builtIn: false;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegexPattern {
  id: string;
  name: string;
  pattern: string;
  flags?: string;
  description?: string;
}

export interface RecognizerTemplate {
  id: string;
  name: string;
  description: string;
  entityType: string;
  patterns: RegexPattern[];
  contextWords: string[];
  confidenceScore: number;
  category: string;
}

export interface PIIMatch {
  entity: string;
  matchedText: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  recognizerId: string;
  recognizerName: string;
}

export interface TestResult {
  matches: PIIMatch[];
  anonymizedText: string;
  originalText: string;
  processingTime: number;
}

export interface PIITestState {
  inputText: string;
  results: TestResult | null;
  isProcessing: boolean;
  showAnonymized: boolean;
}

export type Recognizer = PredefinedRecognizer | CustomRecognizer;

export interface PIIState {
  predefinedRecognizers: PredefinedRecognizer[];
  customRecognizers: CustomRecognizer[];
  templates: RecognizerTemplate[];
  testState: PIITestState;
  isLoading: boolean;
  error: string | null;
}