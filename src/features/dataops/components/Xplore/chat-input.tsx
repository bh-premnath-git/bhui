import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";

interface ChatInputProps {
  onSubmit: (message: string, module?: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const {
    input,
    setInput,
  } = useAnalytics();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input, "dataops");
      setInput("");
      setIsTextareaFocused(false);
      textareaRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t bg-background/80 px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center gap-2 bg-background relative transition-all duration-200">
        <div className="relative flex-1 rounded-lg border border-input bg-background overflow-hidden">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsTextareaFocused(true)}
            onBlur={() => setIsTextareaFocused(false)}
            placeholder="Ask a question about your dataops metrics..."
            className={`min-h-[36px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 py-2 px-3 text-sm leading-tight shadow-none placeholder:text-muted-foreground/50 transition-all duration-200 ${
              isTextareaFocused ? 'min-h-[100px]' : ''
            }`}
            disabled={isLoading}
            rows={isTextareaFocused ? 4 : 1}
          />
        </div>

        <Button
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full bg-primary hover:bg-primary/90 transition-colors"
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
        >
          <SendHorizontal className="h-4 w-4 text-primary-foreground" />
        </Button>
      </div>
    </div>
  );
}