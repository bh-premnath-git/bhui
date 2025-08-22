import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setCurrentInput, addMessage, addMessageWithId, updateMessageContent, setTyping } from "@/store/slices/chat/chatSlice";
import { ActionsList } from "./ActionsList";
import { ActionCategories } from "./ActionCategories";

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
  new(): SpeechRecognition;
};

export const ChatInput: React.FC = () => {
  const { currentInput, isLoading } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow the textarea with smooth height control
  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto"; // reset first to get the correct scrollHeight
    const max = 160; // up to ~6-7 lines
    el.style.height = Math.min(el.scrollHeight, max) + "px";
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

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3">
      {/* Inline suggestion chips (when a category is selected) */}
      <div className="pb-2">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore - dynamic import prevents circular complaints */}
        <ActionsList variant="compact" />
      </div>

      <form
        onSubmit={handleFormSubmit}
        className="rounded-2xl border border-chat-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all shadow-md"
        aria-label="Chat input form"
      >
        {/* Input row */}
        <div className="flex items-center gap-2 px-3 py-2">
          <Textarea
            ref={textareaRef}
            value={currentInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={autoGrow}
            placeholder="Ask BigHammer…"
            rows={1}
            className="flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm leading-5 placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px] max-h-40 overflow-y-auto"
            aria-label="Chat message"
          />

          <div className="flex items-center gap-1">
            {/* Mic */}
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full hover:bg-primary/10 ${isRecording ? "bg-primary/10" : ""}`}
                aria-label={isRecording ? "Stop voice input" : "Start voice input"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <span
                className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 transition-opacity ${
                  isRecording ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden
              />
            </div>

            {/* Send */}
            <Button
              type="submit"
              disabled={!currentInput.trim() || isLoading}
              className="bg-[#009f59] text-white rounded-full px-3 h-8 text-xs hover:bg-[#00864d] disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer: hint and categories */}
        

        <div className="px-2 py-2">
          <ActionCategories />
        </div>
      </form>
    </div>
  );
};