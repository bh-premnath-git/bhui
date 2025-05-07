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

  useEffect(() => {
    if (textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.outline = "none";
      ta.style.border = "none";
      ta.style.boxShadow = "none";
      ta.style.webkitAppearance = "none";
      ta.style.appearance = "none";
    }
  }, []);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div
      className={`
        flex items-center w-full bg-white rounded-md
        px-3 py-1.5 space-x-2 shadow-sm
        border transition-all duration-200 ease-in-out
        ${isFocused 
          ? "border-green-400 ring-1 ring-green-400/30" 
          : "border-gray-200 hover:border-gray-300"}
      `}
    >
      {/* Voice input */}
      <Button
        onClick={onVoiceInput}
        variant="ghost"
        size="icon"
        className="h-10 w-10 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Voice input"
      >
        <Mic className="h-5 w-5" />
      </Button>

      {/* Auto-resizing textarea */}
      <div className="flex-grow">
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
            focus:outline-none placeholder:text-gray-400
            !shadow-none
          "
          style={{ 
            height: "auto", 
            maxHeight: "10rem", 
            minHeight: "2.5rem",
            caretColor: "#10b981",
          }}
          onInput={e => autoResize(e.currentTarget)}
          disabled={disabled}
        />
      </div>

      {/* Send button */}
      <Button
        onClick={onSend}
        variant="ghost"
        size="icon"
        disabled={disabled || !input.trim()}
        className={`
          h-8 w-8 transition-all duration-150 ease-in-out
          ${disabled || !input.trim()
            ? "text-green-500 cursor-not-allowed opacity-50"
            : "text-green-700 hover:text-green-600 hover:bg-green-50"}
        `}
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
