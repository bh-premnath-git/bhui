import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Send, Mic, MicOff, Plus, Sliders, Loader2, Database, AlertTriangle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { Connection, setSelectedConnection, setCurrentInput, addMessage, addMessageWithId, updateMessageContent, setTyping, setContext, setOtherActions, clearMessages, setSelectedActionTitle, setRightComponent, clearSelectedConnection, setThreadId, clearThreadId } from "@/store/slices/chat/chatSlice";
import { ActionsList } from "./ActionsList";
import { useConnections as useAdminConnections } from '@/features/admin/connection/hooks/useConnection';
import { useConversation } from '@/hooks/useConversation';

export const ChatInput: React.FC = () => {
  const { currentInput, isLoading, context, selectedConnection, threadId,currentInputStep } = useAppSelector((state) => state.chat);

  const {
    connections: hookConnections = [] as Connection[],
    isLoading: hookIsLoading,
    isFetching: hookIsFetching,
    isError: hookIsError
  } = useAdminConnections();

  const { createConversation } = useConversation();

  const dispatch = useAppDispatch();

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionEvent | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow the textarea with smooth height control
  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto"; // reset first to get the correct scrollHeight
    const max = 240; // up to ~10-12 lines (increased from 160px)
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

    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    const input = currentInput.trim();
    if (!input || isLoading) return;

    // Clear input immediately for better UX
    dispatch(setCurrentInput(""));

    if (currentInputStep) {
      // Route to workflow system with captured input
      const { getChatService } = await import('@/services/chatService');
      const chatService = getChatService(dispatch);
      await chatService.handleInputSubmit(currentInputStep.stepId, input);
      return;
    }

    // Default behavior for general chat (when not in a workflow)
    // User message
    dispatch(
      addMessage({
        content: input,
        isUser: true,
      })
    );

    if (context === 'action-explore-data') {
      const query = input;

      const { getChatService } = await import('@/services/chatService');
      const chatService = getChatService(dispatch);

      // Run the actual explore flow now
      await chatService.processExploreQuery(query, selectedConnection, threadId);

      // Don't reset context - keep it as 'action-explore-data' for follow-up queries
      return;
    }

    // If the user was answering the 'explore data' question, reset the context.
    if (context === 'explore-data-question') {
      dispatch(setContext('idle'));
    }
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

  // Handler functions for dropdown actions
  const handleCreatePipeline = async () => {
    const actionId = 'create-pipeline';
    dispatch(clearSelectedConnection());
    dispatch(setOtherActions(null));
    dispatch(clearMessages());

    try {
      dispatch(setSelectedActionTitle('Create pipeline'));
      const { getChatService } = await import('@/services/chatService');
      const chatService = getChatService(dispatch);
      dispatch(setContext(`action-${actionId}`));
      await chatService.processAction(actionId);
    } catch (e) {
      dispatch(setContext('create-pipeline'));
      console.error('Failed to start create pipeline action', e);
    }
  };

  const handleSelectExploreConnection = (connection: Connection) => {
    const actionId = 'explore-data';
    dispatch(setSelectedConnection(connection));
    dispatch(setOtherActions(null));
    dispatch(clearMessages());
    dispatch(setSelectedActionTitle('Explore Data'));
    // Arm the input mode; do NOT call the service here
    dispatch(setContext(`action-${actionId}`));
    createConversation()
      .then(res => {
        dispatch(setThreadId(res.data.thread_id));
      })
      .catch(err => {
        console.error('Failed to create conversation thread:', err);
        dispatch(clearThreadId());
      });
  };

  const handleCheckJob = async () => {
    const actionId = 'check-job-statistics';
    dispatch(clearSelectedConnection());
    dispatch(setOtherActions(null));
    dispatch(clearMessages());

    try {
      dispatch(setSelectedActionTitle('Check Job Statistics'));
      const { getChatService } = await import('@/services/chatService');
      const chatService = getChatService(dispatch);
      dispatch(setContext(`action-${actionId}`));
      await chatService.processAction(actionId);
    } catch (e) {
      dispatch(setContext('check-jobs'));
      console.error('Failed to start check job action', e);
    }
  };

  const handleAddUserOrRole = async () => {
    const actionId = 'add-users-roles';
    dispatch(clearSelectedConnection());
    dispatch(setOtherActions(null));
    dispatch(clearMessages());

    try {
      dispatch(setSelectedActionTitle('Add Users or roles'));
      const { getChatService } = await import('@/services/chatService');
      const chatService = getChatService(dispatch);
      dispatch(setContext(`action-${actionId}`));
      await chatService.processAction(actionId);
    } catch (e) {
      dispatch(setContext('add-users-roles'));
      console.error('Failed to start add user or role action', e);
    }
  };

  const handleAddNewConnection = async () => {
    const actionId = 'add-connections';
    dispatch(clearSelectedConnection());
    dispatch(setOtherActions(null));
    dispatch(clearMessages());

    try {
      dispatch(setSelectedActionTitle('Add new Connections'));
      const { getChatService } = await import('@/services/chatService');
      const chatService = getChatService(dispatch);
      dispatch(setContext(`action-${actionId}`));
      await chatService.processAction(actionId);
    } catch (e) {
      dispatch(setContext('add-connections'));
      console.error('Failed to start add new connection action', e);
    }
  };

  const handleOnboardNewDataset = async () => {
    const actionId = 'onboard-dataset';
    dispatch(clearSelectedConnection());
    dispatch(setOtherActions(null));
    dispatch(clearMessages());

    try {
      dispatch(setSelectedActionTitle('Onboard new dataset'));
      const { getChatService } = await import('@/services/chatService');
      const chatService = getChatService(dispatch);
      dispatch(setContext(`action-${actionId}`));
      await chatService.processAction(actionId);
    } catch (e) {
      dispatch(setContext('onboard-dataset'));
      console.error('Failed to start onboard new dataset action', e);
    }
  };

  const handleAddProject = async () => {
    const actionId = 'add-project';
    dispatch(clearSelectedConnection());
    dispatch(setOtherActions(null));
    dispatch(clearMessages());

    try {
      dispatch(setSelectedActionTitle('Add Project'));
      const { getChatService } = await import('@/services/chatService');
      const chatService = getChatService(dispatch);
      dispatch(setContext(`action-${actionId}`));
      await chatService.processAction(actionId);
    } catch (e) {
      dispatch(setContext('add-project'));
      console.error('Failed to start add new project action', e);
    }
  };

  const handleAddEnvironment = async () => {
    const actionId = 'add-environment';
    dispatch(clearSelectedConnection());
    dispatch(setOtherActions(null));
    dispatch(clearMessages());

    try {
      dispatch(setSelectedActionTitle('Add Environment'));
      const { getChatService } = await import('@/services/chatService');
      const chatService = getChatService(dispatch);
      dispatch(setContext(`action-${actionId}`));
      await chatService.processAction(actionId);
    } catch (e) {
      dispatch(setContext('add-environment'));
      console.error('Failed to start add new environment action', e);
    }
  };

  // Function to close right aside panel when dropdown menus are opened
  const handleCloseRightAside = () => {
    dispatch(setRightComponent(null));
  };

  const placeholderText =
    context === 'action-explore-data' ? selectedConnection ? `Ask about data in ${selectedConnection.connection_config_name}`
      : 'e.g., "Show me total sales by region for the last quarter"'
      : 'How Can I Help You ?';

  return (
    <div className="w-full max-w-3xl mx-auto px-2">
      {/* Inline suggestion chips (when a category is selected) */}
      <div className="pb-1">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore - dynamic import prevents circular complaints */}
        <ActionsList variant="compact" />
      </div>

      <form
        onSubmit={handleFormSubmit}
        className="rounded-2xl border border-chat-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all shadow-md"
        aria-label="Chat input form"
      >
        {/* Input area */}
        <div className="flex flex-col gap-2 px-3 py-1.5">
          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={currentInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={autoGrow}
            placeholder={placeholderText}
            rows={2}
            className="flex-1 resize-none border-0 bg-transparent pl-0 pr-2 py-1.5 text-sm leading-5 placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[56px] max-h-60 overflow-y-auto"
            aria-label="Chat message"
          />

          {/* Controls row */}
          <div className="flex items-center justify-between">
            {/* Left side icons */}
            <div className="flex items-center gap-1">
              {/* Plus icon with dropdown */}
              <DropdownMenu onOpenChange={(open) => open && handleCloseRightAside()}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded hover:bg-primary/10 border"
                    aria-label="Create actions"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={handleCreatePipeline}>
                    Create Pipeline
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Database className="mr-2 h-4 w-4" />
                      <span>Explore Data</span>
                    </DropdownMenuSubTrigger>

                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-72 p-0 border border-border/50 shadow-lg">
                        {/* Loading */}
                        {(hookIsLoading || hookIsFetching) && (
                          <div className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground border-b border-border/30">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Loading connections…</span>
                          </div>
                        )}

                        {/* Error */}
                        {hookIsError && !(hookIsLoading || hookIsFetching) && (
                          <div className="flex items-center gap-3 px-4 py-3 text-sm text-destructive border-b border-border/30">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Failed to load connections</span>
                          </div>
                        )}

                        {/* Empty */}
                        {!hookIsError && !(hookIsLoading || hookIsFetching) && hookConnections.length === 0 && (
                          <div className="px-4 py-3 text-sm text-muted-foreground">
                            No connections found
                          </div>
                        )}

                        {/* List - Show max 3 items, scroll for more */}
                        {!hookIsError && !(hookIsLoading || hookIsFetching) && hookConnections.length > 0 && (
                          <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                            {hookConnections.map((c, index) => (
                              <DropdownMenuItem
                                key={String(c.id)}
                                onClick={() => handleSelectExploreConnection(c)}
                                className={`
                                  flex items-center gap-3 px-4 py-3 cursor-pointer
                                  hover:bg-accent/50 focus:bg-accent/50 transition-colors
                                  ${index < hookConnections.length - 1 ? 'border-b border-border/20' : ''}
                                `}
                              >
                                <div className="flex-shrink-0">
                                  <Database className="h-4 w-4 text-primary/70" />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-sm font-medium text-foreground truncate">
                                    {c.connection_config_name}
                                  </span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                            {hookConnections.length > 3 && (
                              <div className="px-4 py-2 text-xs text-muted-foreground text-center border-t border-border/20 bg-muted/20">
                                Scroll to see more connections
                              </div>
                            )}
                          </div>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={handleCheckJob}>
                    Check Job
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sliders icon with dropdown */}
              <DropdownMenu onOpenChange={(open) => open && handleCloseRightAside()}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded hover:bg-primary/10 border"
                    aria-label="Settings actions"
                  >
                    <Sliders className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={handleAddUserOrRole}>
                    Add User or Role
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAddNewConnection}>
                    Add New Connection
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOnboardNewDataset}>
                    Onboard New Dataset
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAddProject}>
                    Add Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAddEnvironment}>
                    Add Environment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side icons */}
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
                  className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 transition-opacity ${isRecording ? "opacity-100" : "opacity-0"
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
        </div>

        {/* Footer: hint and categories */}



      </form>
    </div>
  );
};