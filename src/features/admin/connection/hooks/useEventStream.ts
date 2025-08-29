import { USE_SECURE } from "@/config/platformenv";
import { useRef, useCallback } from "react";

type UseEventStreamProps = {
  url: string;
  token: string;
  onMessage: (msg: string) => void;
};

export function useEventStream({ url, token, onMessage }: UseEventStreamProps) {
  const controllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const start = useCallback(async () => {
    if (controllerRef.current) {
      console.warn("Stream already running");
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
    const params: Record<string, string> = {
  use_secure: USE_SECURE,
};

const queryString = new URLSearchParams(params).toString();
const fullUrl = `${url}?${queryString}`; // 👈 Append query string here

const res = await fetch(fullUrl, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "text/event-stream",
  },
  signal: controller.signal,
});


      if (!res.ok || !res.body) {
        throw new Error(`Failed to connect: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            onMessage(data);
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Stream error:", err);
      }
    } finally {
      controllerRef.current = null;
      readerRef.current = null;
    }
  }, [url, token, onMessage]);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    readerRef.current = null;
  }, []);

  return { start, stop };
}
