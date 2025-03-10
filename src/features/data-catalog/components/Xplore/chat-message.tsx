import { Message } from "@/types/data-catalog/xplore/type";
import { cn } from "@/lib/utils";
import { Bot, CopyCheck, CornerUpRight, User } from "lucide-react";
import { DataView } from "./data-view";
import { SqlCodeBlock } from "./sql-code-block";
import { ExplanationBlock } from "./explanation-block";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  
  // Skip rendering empty messages that aren't loading
  if (!message.content && (!message.data || message.data.length === 0) && !message.isLoading) {
    return null;
  }

  // Extract SQL queries and explanations from content
  const parts = message.content?.split('\n').reduce<{ type: 'text' | 'sql' | 'explanation', content: string }[]>((acc, line) => {
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

  const processedParts = parts.map(part => {
    if (part.type === 'text' && 
        (part.content.toLowerCase().includes('query results') || 
         part.content.toLowerCase().includes('most expensive') || 
         part.content.toLowerCase().includes('price') ||
         part.content.toLowerCase().includes('product') ||
         part.content.toLowerCase().includes('table') ||
         part.content.toLowerCase().includes('chart'))) {
      return { ...part, type: 'explanation' as const };
    }
    return part;
  });
  
  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full items-start gap-4 py-6 px-4 relative",
        isUser ? "bg-muted/30" : "bg-background",
        !isUser && "after:absolute after:left-0 after:top-0 after:h-full after:w-1 after:bg-gradient-to-b after:from-primary/20 after:to-transparent"
      )}
    >
      <div className={cn(
        "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full",
        isUser ? "bg-primary text-primary-foreground shadow-sm" : "bg-primary/10 ring-1 ring-primary/20 text-primary"
      )}>
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-start">
          <div className="text-sm font-medium">
            {isUser ? 'You' : 'Xplorer AI'}
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
          "relative rounded-xl p-4 shadow-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-card border"
        )}>
          <div className={cn(
            "absolute w-4 h-4 rotate-45",
            isUser ? "bg-primary" : "bg-card border",
            isUser ? "left-[-8px]" : "left-[-9px]",
            "top-4 border-l border-t",
            isUser ? "border-transparent" : "",
          )} />

          <AnimatePresence>
            {/* Loading state */}
            {message.isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </motion.div>
            )}

            {/* Regular content */}
            {!message.isLoading && processedParts.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {processedParts.map((part, i) => {
                  if (part.type === 'sql') {
                    return <SqlCodeBlock key={i} sql={part.content} isEmbedded={true} />;
                  } else if (part.type === 'explanation') {
                    return <ExplanationBlock key={i} content={part.content} isEmbedded={true} />;
                  } else {
                    return (
                      <div key={i} className="prose prose-neutral dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap mb-2 text-sm leading-relaxed">{part.content}</p>
                      </div>
                    );
                  }
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!message.isLoading && message.data && message.data.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {message.data.map((result, index) => (
              <div key={index} className="rounded-lg border bg-card p-4 shadow-sm">
                <DataView result={result} />
              </div>
            ))}
          </motion.div>
        )}
        
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}