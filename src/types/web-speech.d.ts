// src/types/web-speech.d.ts
export {};

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }

  // Minimal event shape used in onresult
  interface SpeechRecognitionEvent extends Event {
    stop(): unknown;
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }
}
