import { Message } from "@/types/data-catalog/xplore/type";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { DataView } from "./data-view";
import { SqlCodeBlock } from "./sql-code-block";
import { ExplanationBlock } from "./explanation-block";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  // Skip rendering empty messages
  if (!message.content && (!message.data || message.data.length === 0)) {
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
      
      // Group non-SQL content into text blocks
      if (lastPart && lastPart.type === 'text') {
        // Append to previous text part with proper spacing
        lastPart.content += (lastPart.content && line ? '\n' : '') + line;
      } else {
        // Start a new text part
        acc.push({
          type: 'text',
          content: line
        });
      }
    }
    return acc;
  }, []) || [];

  // Convert text parts that look like explanations
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
  
  return (
    <div className={cn(
      "flex w-full items-start gap-4 p-4",
      isUser ? "bg-muted/50" : "bg-background"
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md",
        isUser ? "bg-primary" : "bg-primary/10"
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="flex-1 space-y-4">
        {processedParts.length > 0 && (
          <div className="space-y-4">
            {processedParts.map((part, i) => {
              if (part.type === 'sql') {
                return <SqlCodeBlock key={i} sql={part.content} />;
              } else if (part.type === 'explanation') {
                return <ExplanationBlock key={i} content={part.content} />;
              } else {
                return (
                  <div key={i} className="prose prose-neutral dark:prose-invert">
                    <p className="whitespace-pre-wrap mb-2">{part.content}</p>
                  </div>
                );
              }
            })}
          </div>
        )}
        {message.data && message.data.length > 0 && (
          <div className="space-y-4">
            {message.data.map((result, index) => (
              <div key={index} className="rounded-lg border bg-card p-4">
                <DataView result={result} />
              </div>
            ))}
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}