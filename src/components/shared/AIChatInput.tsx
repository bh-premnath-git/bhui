import { Mic, Send, ClipboardCopy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AIChatInputProps {
  input: string
  onChange: (value: string) => void
  onSend: () => void
  onVoiceInput?: () => void
  onCopy?: () => void
  placeholder?: string
  disabled?: boolean
}

export function AIChatInput({
  input,
  onChange,
  onSend,
  onVoiceInput,
  onCopy,
  placeholder = "Ask about your data...",
  disabled,
}: AIChatInputProps) {
  return (
    <div className="relative flex items-center mt-auto w-full">
      {/* Microphone button (optional) */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute left-2 h-8 w-8 text-muted-foreground hover:text-foreground"
        aria-label="Voice input"
        onClick={onVoiceInput}
      >
        <Mic className="h-4 w-4" />
      </Button>

      {/* Text input */}
      <Input
        value={input}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        className="pl-12 pr-32 h-12 rounded-full border-muted bg-background"
        aria-label="Chat input"
      />

      {/* Action icons on the right side */}
      <div className="absolute right-2 flex items-center gap-1">
        {/* Copy button (optional) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Copy"
          onClick={onCopy}
        >
          <ClipboardCopy className="h-4 w-4" />
        </Button>

        {/* Send button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onSend}
          disabled={disabled || !input.trim()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
