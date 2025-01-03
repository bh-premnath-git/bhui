import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleUserRound, X, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/store/store';
import { debounce } from 'lodash';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConversationEntry {
  id: number;
  question: string;
  response: string | null;
  isExpanded?: boolean;
}

interface ApiResponse {
  answer?: string;
  message?: string;
  error?: string;
  status?: string;
  data?: {
    response?: string;
    message?: string;
  };
  flow_definition?: string;
  operators?: string[];
  pipelines?: string[];
}

interface ParsedFlowDefinition {
  dag_id: string;
  operators: Array<{
    type: string;
    task_id: string;
    [key: string]: any;
  }>;
}

interface ProcessedResponse {
  flowDefinition: ParsedFlowDefinition;
  operators: string[];
  pipelines: string[];
}


const MAX_PREVIEW_LENGTH = 500;

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const selectedFlow = useAppSelector((state: RootState) => state.flowApi.selectedFlowFromList);

  const adjustTextareaHeight = useCallback(
    debounce(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }, 100),
    []
  );

  useEffect(() => {
    adjustTextareaHeight();
    return () => {
      adjustTextareaHeight.cancel();
    };
  }, [inputValue, adjustTextareaHeight]);

  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [conversation, autoScroll]);

  const handleScroll = useCallback(
    debounce((e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setAutoScroll(isNearBottom);
    }, 100),
    []
  );

  const toggleResponseExpansion = (id: number) => {
    setConversation(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, isExpanded: !entry.isExpanded }
          : entry
      )
    );
  };

  const handleCopy = (id: number, response: string) => {
    navigator.clipboard.writeText(response);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const extractResponseMessage = (data: ApiResponse): string => {
    try {
      // If the response is a string, clean it up
      const responseString = typeof data === 'string' ? data : JSON.stringify(data);
  
      // Replace invalid JSON elements
      const sanitizedResponse = responseString
        .replace(/'([a-zA-Z0-9_]+)':/g, '"$1":') // Replace single-quoted keys
        .replace(/: True/g, ': true')            // Replace Python-style booleans
        .replace(/: False/g, ': false')
        .replace(/: None/g, ': null');           // Replace Python-style nulls
  
      // Parse the cleaned response
      const responseObj = JSON.parse(sanitizedResponse);
  
      // Extract the relevant information
      if (responseObj.flow_definition) {
        const cleanFlowDef = responseObj.flow_definition
          .replace(/```json\n?/g, '')
          .replace(/```/g, '');
  
        const flowDefinition: ParsedFlowDefinition = JSON.parse(cleanFlowDef);
        return JSON.stringify(flowDefinition, null, 2);
      }
  
      // Fallbacks
      if (responseObj.answer) return responseObj.answer;
      if (responseObj.message) return responseObj.message;
      if (responseObj.data?.response) return responseObj.data.response;
      if (responseObj.data?.message) return responseObj.data.message;
  
      return 'Response received but in an unexpected format';
    } catch (error) {
      console.error('Error parsing response:', error);
      return `Error parsing response: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };
  

  const ResponseContent: React.FC<{
    response: string;
    isExpanded?: boolean;
    onClick: () => void;
    id: number
  }> = ({
    response,
    isExpanded = false,
    onClick,
    id
  }) => {
      let formattedResponse = response;
      try {
        // If the response is already formatted JSON, parse and re-stringify it
        const parsedResponse = JSON.parse(response);
        formattedResponse = JSON.stringify(parsedResponse, null, 2);
      } catch (e) {
        // If parsing fails, use the original response
        formattedResponse = response;
      }

      const displayContent = isExpanded
        ? formattedResponse
        : `${formattedResponse.slice(0, MAX_PREVIEW_LENGTH)}...`;

      return (
        <div className="relative">
          <pre className="text-gray-700 whitespace-pre-wrap overflow-x-auto">
            {displayContent}
          </pre>
          {formattedResponse.length > MAX_PREVIEW_LENGTH && (
            <button
              onClick={onClick}
              className="mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
          <button
            onClick={() => handleCopy(id, formattedResponse)}
            className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
          >
            {copiedId === id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      );
    };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    try {
      const flowId = String(selectedFlow?.flow_id || selectedFlow?.id);
      const newEntry: ConversationEntry = {
        question: inputValue,
        response: null,
        id: Date.now(),
        isExpanded: false
      };

      setConversation(prev => [...prev, newEntry]);
      setInputValue('');
      setIsLoading(true);
      setAutoScroll(true);

      const res = await fetch('http://localhost:9090/create_flow', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flow_id: flowId,
          request: newEntry.question,
          thread_id: `flow_${newEntry.id}`,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const responseData: ApiResponse = await res.json();
      const responseMessage = extractResponseMessage(responseData);
      setConversation(prev =>
        prev.map(entry =>
          entry.id === newEntry.id
            ? { ...entry, response: responseMessage }
            : entry
        )
      );

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

      setConversation(prev =>
        prev.map(entry =>
          entry.id === prev[prev.length - 1].id
            ? { ...entry, response: `Error: ${errorMessage}` }
            : entry
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute right-0 top-full mt-4 z-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="rounded-2xl shadow-2xl w-[450px] h-[650px] relative border border-gold-500 bg-white overflow-hidden">
            <button
              onClick={onClose}
              className="absolute text-gray-400 right-2 top-1 p-1 rounded-full transition-all z-10"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-gray-800 transition-colors" />
            </button>

            <div className="h-full flex flex-col">
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-grow overflow-auto px-6 pt-8 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
              >
                {!selectedFlow ? (
                  <p className="text-gray-500 text-center mt-4">
                    Please select a flow to start the conversation.
                  </p>
                ) : conversation.length === 0 ? (
                  <p className="text-gray-500 text-center mt-4">
                    Start a conversation by asking a question.
                  </p>
                ) : (
                  conversation.map((entry) => (
                    <div key={entry.id} className="space-y-2">
                      <div className="flex items-start gap-4">
                        <CircleUserRound className="text-gray-700 flex-shrink-0" />
                        <div className="flex-1 bg-gray-50 p-4 rounded-lg shadow-sm">
                          {entry.question}
                        </div>
                      </div>
                      {entry.response === null ? (
                        <div className="flex items-center gap-2 pl-3 text-gray-400">
                          <div className="animate-pulse">Loading...</div>
                        </div>
                      ) : (
                        <div className="ml-10 bg-purple-50 p-4 rounded-lg shadow-sm">
                          {entry.response.startsWith('Error:') ? (
                            <span className="text-red-500">{entry.response}</span>
                          ) : (
                            <ResponseContent
                              response={entry.response}
                              isExpanded={entry.isExpanded}
                              onClick={() => toggleResponseExpansion(entry.id)}
                              id={entry.id}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex-shrink-0 py-6 px-6 bg-white border-t">
                <div className="flex items-end space-x-3">
                  <Textarea
                    ref={textareaRef}
                    placeholder={selectedFlow ? "Ask BigHammer AI" : "Select a flow to start..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!selectedFlow || isLoading}
                    className="flex-grow px-3 text-base rounded-2xl bg-gray-50 border resize-none placeholder:text-gray-400"
                    style={{
                      minHeight: '52px',
                      maxHeight: '200px'
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!selectedFlow || !inputValue.trim() || isLoading}
                    className={`p-2 rounded-full transition-colors flex-shrink-0 ${!selectedFlow || !inputValue.trim() || isLoading
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-purple-800 cursor-pointer'
                      }`}
                  >
                    <SendRoundedIcon className="h-7 w-7 text-gold-300 hover:text-gold-400 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Dialog;