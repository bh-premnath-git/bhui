import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";

interface AIChatInputProps {
  input: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceInput?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AIChatInput({
  input,
  onChange,
  onSend,
  onVoiceInput,
  placeholder = "Ask about your data…",
  disabled,
}: AIChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Apply styles directly to the textarea element to override any browser defaults
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      
      // Override any browser-specific styling
      textarea.style.outline = "none";
      textarea.style.border = "none";
      textarea.style.boxShadow = "none";
      textarea.style.webkitAppearance = "none";
      textarea.style.appearance = "none";
    }
  }, []);

  // Auto-resize function
  const autoResize = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  return (
    <div
      className={`
        flex items-center w-full bg-white rounded-full
        px-3 py-1.5 space-x-2 shadow-sm
        border transition-all duration-200 ease-in-out
        ${isFocused 
          ? "border-green-400 ring-1 ring-green-400/30" 
          : "border-gray-200 hover:border-gray-300"}
      `}
    >
      {/* Mic on the left */}
      <Button
        onClick={onVoiceInput}
        variant="ghost"
        size="icon"
        className="h-10 w-10 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Voice input"
      >
        <Mic className="h-5 w-5" />
      </Button>
  
      {/* Auto-resizing textarea with enhanced styling to prevent black outline */}
      <div className="flex-grow relative">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={1}
          maxLength={500}
          className="
            w-full bg-transparent border-0 pt-2 mx-2 resize-none overflow-y-auto
            focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0
            focus-visible:outline-none placeholder:text-gray-400
            !shadow-none !outline-none !border-0"
          style={{ 
            height: "auto", 
            maxHeight: "10rem", 
            minHeight: "2.5rem",
            caretColor: "#10b981", // Green cursor for better UX
            outline: "none",
            boxShadow: "none",
            border: "none",
            // Additional styles to prevent browser defaults
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearance: "none"
          }}
          onInput={e => {
            autoResize(e.target as HTMLTextAreaElement);
          }}
          disabled={disabled}
        />
      </div>

      {/* Send on the right */}
      <Button
        onClick={onSend}
        variant="ghost"
        size="icon"
        disabled={disabled || !input.trim()}
        className={`
          h-8 w-8 transition-all duration-150 ease-in-out
          ${disabled || !input.trim()
            ? "text-gray-300 hover:text-gray-300 cursor-not-allowed opacity-70"
            : "text-green-500 hover:text-green-600 hover:bg-green-50"}
        `}
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}