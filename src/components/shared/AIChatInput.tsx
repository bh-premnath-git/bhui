import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
  return (
    <div
      className="
        flex items-center w-full bg-white border border-gray-300 rounded-full
        px-4 py-2 space-x-2 shadow-sm
        focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition
      "
    >
      {/* Mic on the left */}
      
        <Button
          onClick={onVoiceInput}
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-gray-500 hover:text-gray-700"
          aria-label="Voice input"
        >
          <Mic className="h-5 w-5" />
        </Button>
  
      {/* Auto-resizing textarea */}
      <Textarea
        value={input}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        rows={1}
        maxLength={500}
        className="
          flex-grow bg-transparent border-none p-0 mx-2 resize-none overflow-y-auto
          focus:outline-none"
        style={{ height: "auto", maxHeight: "10rem", minHeight: "2.5rem" }}
        onInput={e => {
          const t = e.target as HTMLTextAreaElement;
          t.style.height = "auto";
          t.style.height = `${t.scrollHeight}px`;
        }}
        disabled={disabled}
      />

      {/* Send on the right */}
      <Button
        onClick={onSend}
        size="icon"
        disabled={disabled || !input.trim()}
        className={`
          h-10 w-10 rounded-full transition
          ${disabled || !input.trim()
            ? "bg-green-300 text-white opacity-60 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700"}
        `}
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
