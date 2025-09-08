import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Mic, MicOff, Send, User, Database, FolderPlus, Settings, ArrowLeft } from 'lucide-react';
import { ChatMode } from '@/store/slices/chat/chatSlice';
import { chatService } from '@/services/chatService';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setInput, setThreadId, clearThreadId } from '@/store/slices/chat/chatSlice';
import { useChatController } from '@/context/ChatControllerContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useConversation } from '@/hooks/useConversation';

interface ChatInputProps {
  onSend?: (message: string) => void;
  placeholder?: string;
  className?: string;
  centered?: boolean;
  showLeftIcons?: boolean;
  layoutMode?: 'one-column' | 'multi-column';
  onModeSelect?: (mode: string) => void;
  onBackToDefault?: () => void;
  currentMode?: ChatMode;
}

const ChatInputComponent: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = "How Can I Help You ?",
  className = "",
  centered = false,
  showLeftIcons = true,
  layoutMode = 'multi-column',
  onModeSelect,
  onBackToDefault,
  currentMode = 'default'
}) => {
  const dispatch = useAppDispatch();
  const message = useAppSelector(state => state.chat.input);
  const currentModeFromRedux = useAppSelector(state => state.chat.currentMode);
  const { view } = useAppSelector(state => state.home);
  const { selectMode, sendMessage, backToDefault } = useChatController();
  const { createConversation, streamConversation } = useConversation();
  const selectedConnection = useAppSelector(state => (state.render.data as any)?.selectedConnection);
  const threadId = useAppSelector(state => state.chat.threadId);
  // Voice recording via shared hook
  const {
    isListening: isRecording,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Use Redux state for current mode, fallback to prop
  const activeMode = currentModeFromRedux || currentMode || 'default';

  // Use controller methods if props not provided
  const handleModeSelect = onModeSelect || selectMode;
  const handleBackToDefault = onBackToDefault || backToDefault;
  const handleSendMessage = onSend || sendMessage;

  // For welcome view, use centered layout
  const isWelcomeView = view === 'welcome';
  const shouldCenter = isWelcomeView || centered;
  const shouldShowLeftIcons = isWelcomeView && activeMode === 'default' && (showLeftIcons !== false);

  // Update chat input whenever speech transcript changes
  useEffect(() => {
    if (transcript) {
      dispatch(setInput((message ? message + ' ' : '') + transcript.trim()));
    }
  }, [transcript, message, dispatch]);

  const startRecording = () => {
    if (!isSupported) {
      console.warn('Speech recognition not supported in this browser.');
      return;
    }
    resetTranscript();
    startListening();
  };

  const stopRecording = () => {
    stopListening();
  };

  const handleSend = useCallback(() => {
    if (!message.trim() || !chatService.canSendMessage()) return;

    // For explore-data route, ensure thread + connection exist, then stream
    if (activeMode === 'explore-data' && selectedConnection?.id && threadId) {
      // Optimistically add user message via controller
      handleSendMessage(message);
      dispatch(setInput(''));

      // Start streaming conversation
      streamConversation(
        selectedConnection.id,
        message,
        threadId,
        (chunk) => {
          // TODO: Dispatch chunk updates to Redux – placeholder for now
          console.log('SSE chunk:', chunk);
        },
        () => console.log('Stream complete'),
        (err) => console.error('Stream error', err),
        'explorer'
      );

      return;
    }

    // Fallback to existing logic
    handleSendMessage(message);
    dispatch(setInput(''));
  }, [message, activeMode, selectedConnection, threadId, handleSendMessage, dispatch, streamConversation]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const containerClasses = useMemo(() => shouldCenter
    ? "flex h-full items-center justify-center p-2"
    : "border-t bg-card/50 p-4 backdrop-blur-sm", [shouldCenter]);

  const isOneColumn = layoutMode === 'one-column';
  const isDefaultMode = activeMode === 'default';

  const handleOptionClick = useCallback((option: string) => {
    const modeMap: Record<string, ChatMode> = {
      'create pipeline': 'create-pipeline',
      'explore data': 'explore-data',
      'check jobs': 'check-jobs',
      'Add user or role': 'add-user',
      'Add new connection': 'add-connection',
      'Onboard new dataset': 'onboard-dataset',
      'Add project': 'add-project',
      'Add environment': 'add-environment'
    };

    const mode = modeMap[option];
    if (mode) {
      handleModeSelect(mode);
    }
  }, [handleModeSelect]);

  // Left Icons Component
  const LeftIcons = () => shouldShowLeftIcons ? (
    <div className="flex items-center gap-1.5">
      {isDefaultMode ? (
        <>
          {/* Text boxes */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="pl-0 pr-2.5 py-1 h-7 text-xs rounded-lg hover:bg-muted/60 transition-colors duration-200 font-medium"
              onClick={() => handleOptionClick('create pipeline')}
            >
              Create Pipeline
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="px-2.5 py-1 h-7 text-xs rounded-lg hover:bg-muted/60 transition-colors duration-200 font-medium"
              onClick={() => handleOptionClick('explore data')}
            >
              Explore Data
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="px-2.5 py-1 h-7 text-xs rounded-lg hover:bg-muted/60 transition-colors duration-200 font-medium"
              onClick={() => handleOptionClick('check jobs')}
            >
              Check Jobs
            </Button>
          </div>

          {/* Plus icon dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`p-0 rounded-full hover:bg-muted/60 transition-colors duration-200 ${shouldCenter ? 'h-7 w-7' : 'h-8 w-8'
                  }`}
              >
                <Plus className={shouldCenter ? "h-4 w-4" : "h-4 w-4"} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 bg-background border shadow-lg rounded-lg p-1"
            >
              <DropdownMenuItem
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 rounded-md transition-colors cursor-pointer"
                onClick={() => handleOptionClick('Add user or role')}
              >
                <User className="h-4 w-4" />
                Add User or Roles
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 rounded-md transition-colors cursor-pointer"
                onClick={() => handleOptionClick('Add new connection')}
              >
                <Database className="h-4 w-4" />
                Add New Connection
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 rounded-md transition-colors cursor-pointer"
                onClick={() => handleOptionClick('Onboard new dataset')}
              >
                <FolderPlus className="h-4 w-4" />
                Onboard New Dataset
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 rounded-md transition-colors cursor-pointer"
                onClick={() => handleOptionClick('Add project')}
              >
                <FolderPlus className="h-4 w-4" />
                Add Project
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 rounded-md transition-colors cursor-pointer"
                onClick={() => handleOptionClick('Add environment')}
              >
                <Settings className="h-4 w-4" />
                Add Environment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        /* Back button when not in default mode */
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-2.5 py-1 h-7 text-xs rounded-lg hover:bg-muted/60 transition-colors duration-200 font-medium"
          onClick={handleBackToDefault}
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Button>
      )}
    </div>
  ) : null;

  useEffect(() => {
    if (activeMode === 'explore-data' && !threadId) {
      createConversation()
        .then(res => dispatch(setThreadId(res.data.thread_id)))
        .catch(() => dispatch(clearThreadId()));
    }
  }, [activeMode, threadId, createConversation, dispatch])

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className={`w-full ${isOneColumn && shouldCenter ? 'max-w-md mx-auto' :
          shouldCenter ? 'max-w-2xl mx-auto' : 'max-w-4xl mx-auto'
        }`}>
        {/* Single container for all layouts */}
        <div className={`
          bg-background border rounded-xl shadow-lg backdrop-blur-sm
          ${shouldCenter
            ? 'px-4 py-3 shadow-xl border-2 hover:shadow-2xl transition-all duration-300'
            : 'px-4 py-3 shadow-md'
          }
          ${isOneColumn && shouldCenter ? 'min-h-[90px] flex flex-col gap-3' : shouldCenter ? 'flex flex-col gap-3' : 'flex items-center gap-3'}
        `}>
          {shouldCenter ? (
            /* Centered layout - input on top, buttons below */
            <>
              {/* Input and right icons row */}
              <div className="flex items-center gap-3">
                {/* Input field */}
                <div className="flex-1 px-3 flex items-center min-h-[32px]">
                  <Textarea
                    value={message}
                    onChange={(e) => dispatch(setInput(e.target.value))}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="border-0 bg-transparent resize-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 p-0 w-full text-base min-h-[32px] max-h-[340px] font-medium leading-8"
                    rows={1}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      paddingTop: '0',
                      paddingBottom: '0'
                    }}
                  />
                </div>

                {/* Right side buttons */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-0 rounded-full hover:bg-muted/60 transition-colors duration-200 h-9 w-9 ${isRecording ? "bg-primary/10" : ""}`}
                      onClick={isRecording ? stopRecording : startRecording}
                      aria-label={isRecording ? "Stop voice input" : "Start voice input"}
                    >
                      {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <span
                      className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 transition-opacity ${isRecording ? "opacity-100" : "opacity-0"
                        }`}
                      aria-hidden
                    />
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSend}
                    disabled={!message.trim() || !chatService.canSendMessage()}
                    size="sm"
                    className="p-0 rounded-full bg-transparent hover:bg-muted/60 disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95 h-6 w-6"
                  >
                    <Send className="text-foreground h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Left icons row - at bottom */}
              {shouldShowLeftIcons && (
                <div className="flex justify-start px-1 pt-1 border-t border-border/30">
                  <LeftIcons />
                </div>
              )}
            </>
          ) : (
            /* Multi-column layout - all in one row */
            <>
              <LeftIcons />

              {/* Input field */}
              <div className="flex-1 px-3 flex items-center min-h-[32px]">
                <Textarea
                  value={message}
                  onChange={(e) => dispatch(setInput(e.target.value))}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="border-0 bg-transparent resize-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 p-0 w-full flex items-center text-sm min-h-[24px] max-h-[100px] leading-6"
                  rows={1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: '0',
                    paddingBottom: '0'
                  }}
                />
              </div>

              {/* Right side buttons */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-0 rounded-full hover:bg-muted/60 transition-colors duration-200 h-8 w-8 ${isRecording ? "bg-primary/10" : ""}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    aria-label={isRecording ? "Stop voice input" : "Start voice input"}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <span
                    className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 transition-opacity ${isRecording ? "opacity-100" : "opacity-0"
                      }`}
                    aria-hidden
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSend}
                  disabled={!message.trim() || !chatService.canSendMessage()}
                  size="sm"
                  className="p-0 rounded-full bg-transparent hover:bg-muted/60 disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95 h-7 w-7"
                >
                  <Send className="text-foreground h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          )}
        </div>

        {!shouldCenter && (
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Press Cmd+Enter to send
          </p>
        )}

        {/* Enterprise-level branding for centered mode */}
        {shouldCenter && (
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground/80 font-medium">
              AI-powered assistant ready to help
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const ChatInput = React.memo(ChatInputComponent);
ChatInput.displayName = 'ChatInput';