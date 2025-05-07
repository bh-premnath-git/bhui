
export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
  }
  
  export interface ProcessedNote {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    summary?: string;
    wordCount: number;
    readingTime: string;
    pipeline?: {
      steps: string[];
      description: string;
    };
    flow?: {
      nodes: Array<{id: string; label: string; type: string}>;
      edges: Array<{source: string; target: string; label?: string}>;
    };
  }
  
  export interface CommandOption {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    description: string;
    action: (note: Note) => ProcessedNote;
  }
  