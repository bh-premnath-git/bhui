import React from 'react';
import { Message } from './ResponseDisplay';
import { AIStreamingResponse } from './utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Clock, MessageSquare } from 'lucide-react';

// Interface for messages paired with their responses
interface MessageWithResponses {
  message: Message;
  responses: AIStreamingResponse[];
}

interface SessionHistoryProps {
  messages: Message[];
  messageHistory: MessageWithResponses[];
  onMessageSelect: (index: number) => void;
  selectedMessageIndex?: number | null;
}

export default function SessionHistory({
  messages,
  messageHistory,
  onMessageSelect,
  selectedMessageIndex = null
}: SessionHistoryProps) {
  if (messages.length < 2) {
    return null; // Don't show history unless we have at least one exchange
  }

  // Function to get a preview of the message content
  const getMessagePreview = (content: string, maxLength = 60) => {
    if (!content) return 'Empty message';
    if (content.length <= maxLength) return content;
    return `${content.substring(0, maxLength)}...`;
  };

  // Function to get timestamp for a message based on its index
  const getMessageTimestamp = (index: number) => {
    // For simplicity, just show relative time
    const minutesAgo = (messages.length - index) * 5;
    return minutesAgo > 60 
      ? `${Math.floor(minutesAgo / 60)}h ago`
      : `${minutesAgo}m ago`;
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Session History</h3>
      <ScrollArea className="h-48 rounded-md border p-2">
        <div className="space-y-1">
          {messages.map((message, index) => {
            // Only display user messages in history
            if (message.role !== 'user') return null;
            
            // Skip the most recent message as it's shown in main view
            if (index === messages.length - 1 && selectedMessageIndex === null) return null;
            
            // Get if this message has responses
            const hasResponses = messageHistory.some(
              item => item.message.content === messages[index + 1]?.content && 
                     messages[index + 1]?.role === 'assistant'
            );
            
            return (
              <Button
                key={`history-${index}`}
                variant={selectedMessageIndex === index ? "secondary" : "ghost"}
                className="w-full justify-start text-left h-auto py-2"
                onClick={() => onMessageSelect(index)}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{getMessagePreview(message.content)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {getMessageTimestamp(index)}
                      </span>
                      {hasResponses && (
                        <span className="text-xs bg-primary/10 text-primary rounded-full px-2">
                          Has visualization
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
