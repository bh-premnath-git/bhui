import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExplanationBlockProps {
  content: string;
  isEmbedded?: boolean;
}

export function ExplanationBlock({ content, isEmbedded = false }: ExplanationBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyExplanation = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Explanation copied to clipboard");
    
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
            <div className="w-2 h-2 rounded-full bg-blue-400/70 mr-2"></div>
            Explanation
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={handleCopyExplanation}
                >
                  {copied ? 
                    <Check className="h-3.5 w-3.5 text-primary" /> : 
                    <Copy className="h-3.5 w-3.5" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{copied ? 'Copied!' : 'Copy explanation'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap px-1 break-words">
          {content}
        </div>
      </div>
    </motion.div>
  );
}
