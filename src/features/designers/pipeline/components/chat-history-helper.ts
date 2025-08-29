// Helper functions for chat history management
export const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const createChatMessage = (
  role: 'user' | 'assistant',
  content: string,
  options?: {
    suggestions?: any[];
    formData?: {
      schema?: any;
      sourceColumns?: any[];
      currentNodeId?: string;
      initialValues?: any;
      isTarget?: boolean;
    };
  }
) => ({
  id: generateMessageId(),
  role,
  content,
  suggestions: options?.suggestions || [],
  formData: options?.formData
});

export const createFormDataContext = (
  schema: any,
  sourceColumns: any[] = [],
  currentNodeId: string,
  initialValues: any = {},
  isTarget: boolean = false
) => ({
  schema,
  sourceColumns,
  currentNodeId,
  initialValues,
  isTarget
});