import { Message } from "@/types/data-catalog/xplore/type";
import { cn } from "@/lib/utils";
import { CopyCheck, CornerUpRight, User } from "lucide-react";
import { DataView } from "./data-view";
import { SqlCodeBlock } from "./sql-code-block";
import { ExplanationBlock } from "./explanation-block";
import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(message.isLoading);
  const [hasSqlContent, setHasSqlContent] = useState(false);
  
  // Extract SQL queries and explanations from content - moved to useMemo
  const parts = useMemo(() => {
    return message.content?.split('\n').reduce<{ type: 'text' | 'sql' | 'explanation', content: string }[]>((acc, line) => {
      // Skip empty lines
      if (!line.trim()) return acc;
  
      // Check for SQL queries
      const sqlContent = line.replace(/^Executing SQL:\s*/, '').trim();
      const isSql = /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|WITH|EXPLAIN|ANALYZE)\s+/i.test(sqlContent);
      
      if (isSql) {
        // Add a new SQL part
        acc.push({
          type: 'sql',
          content: sqlContent
        });
      } else {
        const lastPart = acc[acc.length - 1];
        if (lastPart && lastPart.type === 'text') {
          lastPart.content += (lastPart.content && line ? '\n' : '') + line;
        } else {
          acc.push({
            type: 'text',
            content: line
          });
        }
      }
      return acc;
    }, []) || [];
  }, [message.content]);

  // Check if we have SQL content
  useEffect(() => {
    if (parts.some(part => part.type === 'sql')) {
      setHasSqlContent(true);
      setIsInitialLoading(false);
    }
  }, [parts]);

  // Update loading state when the message loading state changes
  useEffect(() => {
    if (!message.isLoading) {
      setIsInitialLoading(false);
    }
  }, [message.isLoading]);

  // Process text parts to identify explanations - moved to useMemo
  const processedParts = useMemo(() => {
    return parts.map(part => {
      if (part.type === 'text') {
        
        const content = part.content.toLowerCase();
        
        const hasStructuredData = (content.includes(':') || content.includes('-')) && content.length > 50;
        const hasExplanatoryStructure = /^(here|this|the|these|those|below|above|following|analysis)/i.test(content.trim());
        const hasDataReferences = /\b(data|result|query|table|chart|information|value|record|row|column|field|metric|statistic|analysis|figure|comparison|trend|pattern|distribution)\b/i.test(content);
        
        // Only convert to explanation if it meets multiple criteria
        if ((hasStructuredData && hasDataReferences) || 
            (hasExplanatoryStructure && hasDataReferences) ||
            // Fallback for backward compatibility with existing data
            (content.includes('query results') || 
             content.includes('most expensive') || 
             content.includes('table') || 
             content.includes('chart'))) {
          return { ...part, type: 'explanation' as const };
        }
      }
      return part;
    });
  }, [parts]);
  
  // Calculate rendering state flags - moved to useMemo for consistency
  const { shouldRender, showLoadingAnimation, showContent } = useMemo(() => {
    const shouldRender = message.content || (message.data && message.data.length > 0) || message.isLoading;
    const showLoadingAnimation = isInitialLoading && !hasSqlContent;
    const showContent = !isInitialLoading || hasSqlContent || (!message.isLoading && processedParts.length > 0);
    
    return { shouldRender, showLoadingAnimation, showContent };
  }, [message.content, message.data, message.isLoading, isInitialLoading, hasSqlContent, processedParts]);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Skip rendering empty messages that aren't loading - moved after all hooks
  if (!shouldRender) {
    return null;
  }

  return (
    <div className="mb-6 flex items-start gap-4 px-4 max-w-full">
      <div className={cn(
        "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full",
        isUser ? "bg-primary text-primary-foreground shadow-sm" : "bg-primary/10 ring-1 ring-primary/20 text-primary"
      )}>
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <img src="/assets/ai/ai.svg" alt="Bighammer AI" className="h-5 w-5" />
        )}
      </div>
      
      <div className="flex-1 space-y-3 max-w-full">
        <div className="flex justify-between items-start">
          <div className="text-sm font-medium">
            {isUser ? 'You' : 'Bighammer AI'}
          </div>
          {!message.isLoading && message.content && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-full opacity-70 hover:opacity-100 transition-opacity"
                    onClick={handleCopy}
                  >
                    {copied ? 
                      <CopyCheck className="h-3.5 w-3.5" /> : 
                      <CornerUpRight className="h-3.5 w-3.5" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{copied ? 'Copied!' : 'Copy message'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className={cn(
          "relative rounded-xl p-4 shadow-sm w-full",
          isUser ? 
            "bg-blue-600/10 text-foreground border border-blue-600/20" : 
            "bg-gray-100 dark:bg-gray-800/60 border"
        )}>
          <div className={cn(
            "absolute w-4 h-4 rotate-45",
            isUser ? 
              "bg-blue-600/10 border-blue-600/20" : 
              "bg-gray-100 dark:bg-gray-800/60",
            isUser ? "left-[-8px]" : "left-[-9px]",
            "top-4 border-l border-t",
            isUser ? "border-blue-600/20" : "",
          )} />

          <AnimatePresence mode="wait">
            {/* Loading state - only show when in initial loading and no SQL content yet */}
            {showLoadingAnimation && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="flex space-x-1.5">
                  <motion.div 
                    className="h-2 w-2 rounded-full bg-primary/40"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
                  />
                  <motion.div 
                    className="h-2 w-2 rounded-full bg-primary/40"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3, delay: 0.1 }}
                  />
                  <motion.div 
                    className="h-2 w-2 rounded-full bg-primary/40"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.4, delay: 0.2 }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">Processing...</span>
              </motion.div>
            )}

            {/* Content - show once we have SQL or loading is complete */}
            {showContent && processedParts.length > 0 && (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 w-full break-words"
              >
                {processedParts.map((part, i) => {
                  if (part.type === 'sql') {
                    return <SqlCodeBlock key={i} sql={part.content} isEmbedded={true} />;
                  } else if (part.type === 'explanation') {
                    return <ExplanationBlock key={i} content={part.content} isEmbedded={true} />;
                  } else {
                    return (
                      <div key={i} className="prose prose-neutral dark:prose-invert max-w-full">
                        <p className="whitespace-pre-wrap mb-2 text-sm leading-relaxed break-words">{part.content}</p>
                      </div>
                    );
                  }
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Data results - show them when we have data, regardless of loading state */}
        {message.data && message.data.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 w-full"
          >
            {message.data.map((result, index) => (
              <div key={index} className="w-full max-w-full break-words">
                <DataView result={result} isEmbedded={true} />
              </div>
            ))}
          </motion.div>
        )}
        
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}