import { useAppSelector } from '@/hooks/useRedux';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useCallback } from 'react';
import { 
  User, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Wrench,
  BarChart3,
  Cpu
} from 'lucide-react';

// Branded AI icon (rotation + invert similar to ChatMessages component)
const AiIcon = ({ className = '' }: { className?: string }) => (
  <img
    src="/assets/ai/ai.svg"
    alt="AI"
    className={`filter brightness-0 invert -rotate-[40deg] ${className}`}
  />
);

import { DataExplorerConnectionSelector } from '@/components/renderers/DataExplorerConnectionSelector';

const getStageIcon = (stage: string) => {
  switch (stage) {
    case 'thinking':
      return <Loader2 className="w-4 h-4 animate-spin" />;
    case 'tool':
      return <Wrench className="w-4 h-4" />;
    case 'rendering':
      return <BarChart3 className="w-4 h-4" />;
    case 'complete':
      return <CheckCircle className="w-4 h-4" />;
    case 'error':
      return <XCircle className="w-4 h-4" />;
    default:
      return <Cpu className="w-4 h-4" />;
  }
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'thinking':
      return 'bg-muted text-muted-foreground';
    case 'tool':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'rendering':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'complete':
      return 'bg-success/10 text-success border-success/20';
    case 'error':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const MessagesList = ({ onAssistantMessageClick }: { onAssistantMessageClick?: (messageId: string) => void }) => {
  const { messages, messageStages, isStreaming, currentMode, virtualizedItems } = useAppSelector(state => state.chat);
  const { activeMessageId } = useAppSelector(state => state.render);
  const { type: layoutType } = useAppSelector(state => state.layout);
  
  // Setup virtualization hooks with Redux state
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Dynamic size estimation based on content
  const estimateSize = useCallback((index: number) => {
    const item = virtualizedItems[index];
    if ('isStreamingIndicator' in item) {
      return 100; // Smaller for loading indicator
    }
    
    const message = item;
    const isUser = message.role === 'user';
    const contentLength = message.content.length;
    
    // Base size with padding and margins
    let baseSize = 120;
    
    // Add height based on content length
    const lineHeight = 24;
    const charsPerLine = isUser ? 50 : 60; // User messages tend to be narrower
    const estimatedLines = Math.max(1, Math.ceil(contentLength / charsPerLine));
    const contentHeight = estimatedLines * lineHeight;
    
    // Add extra space for markdown elements (headers, lists, code blocks)
    const hasMarkdown = !isUser && (
      message.content.includes('#') || 
      message.content.includes('```') || 
      message.content.includes('- ') ||
      message.content.includes('1. ')
    );
    
    if (hasMarkdown) {
      baseSize += contentHeight * 1.3; // 30% extra for markdown spacing
    } else {
      baseSize += contentHeight;
    }
    
    // Minimum size for readability
    return Math.max(140, Math.min(800, baseSize));
  }, [virtualizedItems]);
  
  const virtualizer = useVirtualizer({
    count: virtualizedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 2,
    measureElement: (element) => element?.getBoundingClientRect().height || 150,
  });

  if (messages.length === 0) {
    // Show connection selector for data explorer mode in one-column layout
    if (currentMode === 'explore-data' && layoutType === '1C') {
      return <DataExplorerConnectionSelector />;
    }

    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AiIcon className="w-10 h-10 mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
          <p className="text-muted-foreground">
            Choose a mode or ask me anything about your data analysis needs.
          </p>
        </div>
      </div>
    );
  }

  // Render a single message or streaming indicator
  const renderItem = (index: number) => {
    const item = virtualizedItems[index];
    
    // Handle streaming indicator
    if ('isStreamingIndicator' in item) {
      return (
        <div className="flex gap-3 justify-start p-6">
          <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <AiIcon className="w-3 h-3" />
          </div>
          <Card className="p-4 bg-surface border-border">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </Card>
        </div>
      );
    }

    // Handle regular message
    const message = item;
    const stage = messageStages[message.id];
    const isUser = message.role === 'user';
    const isActive = !isUser && activeMessageId === message.id;
    
    return (
      <div 
        className={`flex gap-4 px-6 py-4 ${isUser ? 'justify-end' : 'justify-start'} ${
          !isUser ? 'cursor-pointer hover:bg-muted/30 transition-colors' : ''
        } ${isActive ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
        onClick={!isUser && onAssistantMessageClick ? () => {
          console.log('Message clicked:', message.id);
          onAssistantMessageClick(message.id);
        } : undefined}
      >
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <AiIcon className="w-4 h-4" />
          </div>
        )}
        
        <div className={`max-w-[75%] min-w-0 ${isUser ? 'order-first' : ''}`}>
          <Card className={`p-5 shadow-sm ${
            isUser 
              ? 'bg-primary text-primary-foreground ml-auto border-primary/20' 
              : 'bg-surface border-border/60'
          }`}>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {isUser ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-lg font-semibold mb-3 text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 text-foreground">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 text-foreground leading-relaxed text-sm">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1.5 ml-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1.5 ml-2">{children}</ol>,
                    li: ({ children }) => <li className="text-foreground text-sm leading-relaxed">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                    em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                    code: ({ children }) => <code className="bg-muted px-1.5 py-1 rounded text-xs font-mono text-foreground">{children}</code>,
                    pre: ({ children }) => <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto mb-3 text-foreground">{children}</pre>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 py-2 italic text-muted-foreground mb-3">{children}</blockquote>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
            
            {!isUser && stage && stage !== 'idle' && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <Badge 
                  variant="outline" 
                  className={`${getStageColor(stage)} text-xs`}
                >
                  {getStageIcon(stage)}
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </Badge>
              </div>
            )}
          </Card>
          
          <div className={`text-xs text-muted-foreground mt-2 px-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {isUser && (
          <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border/60 flex items-center justify-center flex-shrink-0 shadow-sm">
            <User className="w-4 h-4 text-foreground" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div className="py-4">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(virtualItem.index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};