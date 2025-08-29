import { apiService } from "@/lib/api/api-service";
import { API_PREFIX_URL, AGENT_REMOTE_URL } from "@/config/platformenv";
import { useCallback } from "react";
import { toast } from "sonner";
import type {
    StreamingChunk,
} from "@/types/streaming";

interface UseConversationOptions {
    shouldFetch?: boolean;
    connectionId?: string;
}

interface ApiErrorOptions {
    action: "create" | "update" | "delete" | "fetch";
    context?: string;
    silent?: boolean;
}

interface ConversationResponse {
    data: {
        thread_id: string;
        messages: string[];
    }
}

type StreamCallback = (chunk: StreamingChunk) => void;

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
    const { action, context = "conversation", silent = false } = options;
    const errorMessage = `Failed to ${action} ${context}`;
    console.error(`${errorMessage}:`, error);
    if (!silent) {
        toast.error(errorMessage);
    }
    throw error;
};

export const useConversation = (options: UseConversationOptions = { shouldFetch: true }) => {
    const createConversation = useCallback(
        async (): Promise<ConversationResponse> => {
            try {
                const response = await apiService.post<ConversationResponse>({
                    baseUrl: AGENT_REMOTE_URL,
                    method: 'POST',
                    url: `/conversation/create-conversation`,
                    usePrefix: true,
                    data: {}
                });

                return response;
            } catch (error) {
                handleApiError(error, { action: "create", context: "AI conversation" });
                return {
                    data: {
                        thread_id: '',
                        messages: []
                    }
                };
            }
        },
        []
    );

    const streamConversation = useCallback(
        (
            connectionId: number | null,
            userRequest: string,
            threadId: string,
            onChunk: StreamCallback,
            onComplete?: () => void,
            onError?: (error: any) => void,
            module?: string
        ): () => void => {
            const controller = new AbortController();
            const { signal } = controller;
            const baseUrl = `${AGENT_REMOTE_URL}${API_PREFIX_URL}`;
            const url =
                module === "dataops"
                    ? `${baseUrl}/conversation/conversation/query/stream`
                    : `${baseUrl}/conversation/conversation/query/stream?connection_config_id=${connectionId}`;

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('kc_token')}`
                },
                body: JSON.stringify({
                    user_request: userRequest,
                    thread_id: threadId,
                    module: module ? module : "explorer"
                }),
                signal
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const reader = response.body?.getReader();
                    if (!reader) {
                        throw new Error('Failed to get stream reader');
                    }

                    const decoder = new TextDecoder("utf-8");
                    let buffer = "";

                    const flushEventsFromBuffer = () => {
                        const events = buffer.split("\n\n");
                        buffer = events.pop() ?? "";

                        for (const evt of events) {
                            const dataLines = evt
                                .split("\n")
                                .filter(l => l.startsWith("data:"))
                                .map(l => l.slice(5).trim());

                            if (!dataLines.length) continue;

                            const payload = dataLines.join("\n");
                            try {
                                const parsed = JSON.parse(payload);

                                const items: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
                                for (const item of items) {
                                    onChunk(item as StreamingChunk);
                                }
                            } catch (e) {
                                console.error("Failed to parse SSE data JSON:", e, payload);
                            }
                        }
                    };

                    const process = (): Promise<void> =>
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                flushEventsFromBuffer();
                                onComplete?.();
                                return;
                            }
                            buffer += decoder.decode(value, { stream: true });
                            flushEventsFromBuffer();
                            return process();
                        });

                    return process().catch(err => {
                        onError?.(err);
                    });
                })
                .catch(error => {
                    console.error('Error with SSE connection:', error);
                    if (onError) onError(error);
                    else toast.error('Failed to connect to conversation stream');
                });

            return () => controller.abort();
        },
        []
    );

    return {
        createConversation,
        streamConversation
    };
};