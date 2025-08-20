import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setCurrentInput, addMessage, addMessageWithId, updateMessageContent, setTyping } from "@/store/slices/chat/chatSlice";
import { ActionsList } from "./ActionsList";

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

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow the textarea
  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 120) + "px"; // up to ~5 lines
  };

  useEffect(() => {
    autoGrow();
  }, [currentInput]);

  // Cleanup recording on unmount
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
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-IN";
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

    // User message
    dispatch(
      addMessage({
        content: currentInput,
        isUser: true,
      })
    );

    // Streaming AI response (simulated)
    const id = crypto.randomUUID();
    dispatch(
      addMessageWithId({
        id,
        message: {
          content: "",
          isUser: false,
          isStreaming: true,
        },
      })
    );

    // Show thinking dots before streaming starts
    dispatch(setTyping(true));

    const chunks = [
      "I'd be happy to help you build that! ",
      "Let me break down your request ",
      "and create something amazing.",
    ];
    let buffer = "";
    let i = 0;

    const interval = setInterval(() => {
      if (i < chunks.length) {
        buffer += chunks[i++];
        dispatch(updateMessageContent({ id, content: buffer, isStreaming: true }));
      } else {
        clearInterval(interval);
        dispatch(updateMessageContent({ id, content: buffer, isStreaming: false }));
        dispatch(setTyping(false));
      }
    }, 350);

    dispatch(setCurrentInput(""));
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
     <div className="w-full max-w-3xl mx-auto px-2">
      {/* Inline suggestion chips (when a category is selected) */}
      <div className="pb-1">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore - dynamic import prevents circular complaints */}
        <ActionsList variant="compact" />
      </div>
      
      <div
        className="
          rounded-xl border border-chat-border/50 bg-background/80
          backdrop-blur supports-[backdrop-filter]:bg-background/60
          transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/30
          shadow-sm px-2 py-1
        "
      >
        <div className="flex items-end gap-1">
          <Textarea
            ref={textareaRef}
            value={currentInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask BigHammer…"
            rows={1}
            className="
              flex-1 resize-none border-0 bg-transparent
              px-2 py-1 text-sm leading-5
              placeholder:text-muted-foreground/70
              focus-visible:ring-0 focus-visible:ring-offset-0
              min-h-[40px] max-h-32
            "
            aria-label="Chat message"
          />
          
          <div className="flex items-center gap-0.5 pb-1">
            {/* Mic */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-full hover:bg-primary/10 ${isRecording ? "bg-primary/10" : ""}`}
              aria-label={isRecording ? "Stop voice input" : "Start voice input"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
            >
              {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            </Button>

            {/* Send */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!currentInput.trim() || isLoading}
              className="
                bg-gradient-to-r from-primary to-primary/80 text-primary-foreground
                rounded-full px-3 h-7 text-xs hover:opacity-90 disabled:opacity-50
              "
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-1 text-[10px] text-muted-foreground text-center">
        Press <kbd className="px-1 py-0.5 rounded border text-[0.7rem]">Enter</kbd> to send •{" "}
        <kbd className="px-1 py-0.5 rounded border text-[0.7rem]">Shift</kbd>+
        <kbd className="px-1 py-0.5 rounded border text-[0.7rem]">Enter</kbd> for new line
      </div>
    </div>
  );
};
