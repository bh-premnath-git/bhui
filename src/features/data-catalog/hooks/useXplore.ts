import { apiService } from "@/lib/api/api-service";
import {API_DOMAIN, API_PREFIX_URL, AGENT_PORT } from "@/config/platformenv";
import { useCallback } from "react";
import { toast } from "sonner";

interface UseXploreOptions {
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

interface StreamConversationResponse {
    data: any; // Define a more specific type based on the actual response structure
}

type StreamCallback = (chunk: string) => void;

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
    const { action, context = "conversation", silent = false } = options;
    const errorMessage = `Failed to ${action} ${context}`;
    console.error(`${errorMessage}:`, error);
    if (!silent) {
        toast.error(errorMessage);
    }
    throw error;
};

export const useXplore = (options: UseXploreOptions = { shouldFetch: true }) => {
    const createConversation = useCallback(
        async (): Promise<ConversationResponse> => {
            try {
                const response = await apiService.post<ConversationResponse>({
                    portNumber: AGENT_PORT,
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
        (conversationId: number, userRequest: string, threadId: string, onChunk: StreamCallback, onComplete?: () => void, onError?: (error: any) => void): () => void => {
            const controller = new AbortController();
            const { signal } = controller;
            const baseUrl = `${API_DOMAIN}:${AGENT_PORT}${API_PREFIX_URL}`;
            const url = `${baseUrl}/conversation/conversation/query/stream?connection_config_id=${conversationId}`;

            // Start the stream
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_request: userRequest,
                    thread_id: threadId
                }),
                signal
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    // Get the reader from the response body stream
                    const reader = response.body?.getReader();
                    if (!reader) {
                        throw new Error('Failed to get stream reader');
                    }

                    // Process the stream
                    const processStream = ({ done, value }: ReadableStreamReadResult<Uint8Array>) => {
                        // If the stream is done, call the completion callback
                        if (done) {
                            if (onComplete) onComplete();
                            return;
                        }

                        // Decode the chunk and split by newlines
                        const chunk = new TextDecoder().decode(value);

                        try {
                            // Process each line in the chunk
                            const lines = chunk.split('\n').filter(line => line.trim() !== '');

                            for (const line of lines) {
                                // SSE format typically starts with "data: "
                                if (line.startsWith('data:')) {
                                    const jsonStr = line.slice(5).trim();
                                    onChunk(jsonStr);
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing SSE chunk:', e);
                            onChunk(chunk); // If parsing fails, just pass the raw chunk
                        }

                        // Continue reading
                        reader.read().then(processStream).catch(err => {
                            if (onError) onError(err);
                        });
                    };

                    // Start reading the stream
                    reader.read().then(processStream).catch(err => {
                        if (onError) onError(err);
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