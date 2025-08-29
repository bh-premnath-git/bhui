import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { SqlSyntaxHighlighter } from "./sql-syntax-highlighter";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SqlCodeBlockProps {
  sql: string;
  isEmbedded?: boolean;
}

export function SqlCodeBlock({ sql, isEmbedded = false }: SqlCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyQuery = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    toast.success("Query copied to clipboard");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className={isEmbedded ? "bg-transparent" : "bg-card/50 border border-border/80 shadow-sm rounded-lg overflow-hidden"}>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-xs font-medium text-muted-foreground flex items-center">
            <div className="w-2 h-2 rounded-full bg-primary/70 mr-2"></div>
            SQL Query
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={handleCopyQuery}
                >
                  {copied ? 
                    <Check className="h-3.5 w-3.5 text-primary" /> : 
                    <Copy className="h-3.5 w-3.5" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{copied ? 'Copied!' : 'Copy query'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="max-w-full overflow-x-auto horizontal-scrollbar">
          <SqlSyntaxHighlighter code={sql} className="text-sm break-all word-break" />
        </div>
      </div>
    </motion.div>
  );
}
