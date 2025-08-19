import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, Shuffle, Mic, MicOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setCurrentInput, addMessage } from "@/store/slices/chat/chatSlice";

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly confidence: number;
  readonly transcript: string;
}

interface SpeechGrammarList {
  readonly length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

export const ChatInput: React.FC = () => {
  const { currentInput, isLoading } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // --- Auto-grow the textarea, keep it compact when empty
  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 160) + "px"; // cap ~8 lines
  };

  useEffect(() => {
    autoGrow();
  }, [currentInput]);

  // --- Mic (Web Speech API)
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startRecording = () => {
    const SR: typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition | undefined =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SR) {
      // You could toast here if you use a toaster
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-IN"; // tweak if needed
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      dispatch(setCurrentInput((currentInput ? currentInput + " " : "") + transcript.trim()));
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognitionRef.current = recognition as unknown as SpeechRecognition;
    setIsRecording(true);
    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = () => {
    if (!currentInput.trim() || isLoading) return;

    // Add user message
    dispatch(
      addMessage({
        content: currentInput,
        isUser: true,
      })
    );

    // Simulated AI response (replace with your real call)
    setTimeout(() => {
      dispatch(
        addMessage({
          content:
            "I'd be happy to help you build that! Let me break down your request and create something amazing.",
          isUser: false,
        })
      );
    }, 600);

    dispatch(setCurrentInput(""));
    setIsExpanded(false);
    autoGrow();
  };

  const handleInputChange = (value: string) => {
    dispatch(setCurrentInput(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className="
          rounded-full border border-chat-border/50 bg-background/60
          backdrop-blur supports-[backdrop-filter]:bg-background/40
          transition-all hover:border-primary/30 focus-within:border-primary/40
          focus-within:ring-1 focus-within:ring-primary/40 shadow-sm
        "
      >
        <div className="flex items-center gap-1 px-1.5">
          {/* Left actions */}
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-primary/10"
              aria-label="Add"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-primary/10"
              aria-label="Surprise me"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>

          {/* Textarea (centered, compact, aligned with buttons) */}
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={currentInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsExpanded(true)}
              placeholder="Ask BigHammer.ai to build…"
              rows={isExpanded ? 3 : 1}
              className="
                w-full resize-none border-0 bg-transparent
                px-2 py-2 text-sm leading-5
                placeholder:text-muted-foreground
                focus-visible:ring-0 focus-visible:ring-offset-0
                min-h-[36px] max-h-40
              "
              aria-label="Chat message"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-0.5 pl-0.5">
            {/* Mic */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-full hover:bg-primary/10 ${
                isRecording ? "bg-primary/10" : ""
              }`}
              aria-label={isRecording ? "Stop voice input" : "Start voice input"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            {/* Send */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!currentInput.trim() || isLoading}
              className="
                bg-gradient-to-r from-primary to-primary/80 text-primary-foreground
                rounded-full px-3 h-9 text-sm hover:opacity-90 disabled:opacity-50
              "
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse [animation-delay:120ms]" />
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse [animation-delay:240ms]" />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Send</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Tiny helper text (optional) */}
      <div className="mt-1.5 text-[11px] text-muted-foreground text-center">
        Press <kbd className="px-1 py-0.5 rounded border">Enter</kbd> to send •{" "}
        <kbd className="px-1 py-0.5 rounded border">Shift</kbd>+<kbd className="px-1 py-0.5 rounded border">Enter</kbd> for a new line
      </div>
    </div>
  );
};