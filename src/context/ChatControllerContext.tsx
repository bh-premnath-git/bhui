import { createContext, useContext, ReactNode, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setMode, addMessage, updateMessage, setStreaming, setMessageStage, clearState as clearChatState } from '@/store/slices/chat/chatSlice';
import { switchToChat, clearState as clearHomeState } from '@/store/slices/chat/homeSlice';
import { setRenderer, updateData, setActiveMessage, setStatus, clearState as clearRenderState } from '@/store/slices/chat/renderSlice';
import { setTwoColumn, clearState as clearLayoutState } from '@/store/slices/chat/layoutSlice';
import { clearState as clearInspectorState } from '@/store/slices/chat/inspectorSlice';
import { clearState as clearAssetsState } from '@/store/slices/chat/assetsSlice';
import { chatService } from '@/services/chatService';
import { usePipelineWizardContext } from '@/context/PipelineWizardContext';
import type { ChatMode } from '@/store/slices/chat/chatSlice';
import { store } from '@/store';

interface ChatControllerContextType {
  selectMode: (mode: ChatMode) => void;
  backToDefault: () => void;
  backToHome: () => void;
  sendMessage: (message: string) => void;
  focusComposer: () => void;
  onAssistantMessageClick: (messageId: string) => void;
}

const ChatControllerContext = createContext<ChatControllerContextType | null>(null);

export const useChatController = () => {
  const context = useContext(ChatControllerContext);
  if (!context) {
    throw new Error('useChatController must be used within a ChatControllerProvider');
  }
  return context;
};

interface ChatControllerProviderProps {
  children: ReactNode;
}

export const ChatControllerProvider = ({ children }: ChatControllerProviderProps) => {
  const dispatch = useAppDispatch();
  const pipelineWizard = usePipelineWizardContext();
  const { messages, currentMode } = useAppSelector((state) => state.chat);
  const { data } = useAppSelector((state) => state.render);

  // Track if we're currently processing a message to prevent duplicates
  const [isProcessing, setIsProcessing] = useState(false);

  const resetStates = () => {
    dispatch(clearChatState());
    dispatch(clearHomeState());
    dispatch(clearLayoutState());
    dispatch(clearRenderState());
    dispatch(clearInspectorState());
    dispatch(clearAssetsState());
    if (pipelineWizard.isActive()) pipelineWizard.reset();
  };

  const selectMode = (mode: ChatMode) => {
    resetStates();
    dispatch(setMode(mode));
    dispatch(switchToChat());

    // Use the appropriate manager to set up the mode
    chatService.selectMode(mode, dispatch);

    // kick off pipeline wizard immediately
    if (mode === 'create-pipeline') {
      // keep 1-column; wizard will switch to 2-column after pipeline is created
      const renderer = chatService.getRenderer('create-pipeline');
      dispatch(setRenderer(renderer));
      dispatch(setStatus('idle'));
      pipelineWizard.start();
    }
  };

  const backToDefault = () => {
    resetStates();
    dispatch(setMode('default'));
    chatService.selectMode('default', dispatch);
  };

  const backToHome = () => {
    resetStates();
    chatService.selectMode('default', dispatch);
  };

  const sendMessage = async (message: string) => {
    // Prevent duplicate calls
    if (isProcessing) {
      console.log('🚫 Already processing a message, ignoring duplicate call');
      return;
    }
    
    setIsProcessing(true);
    try {
      // If no mode is selected (default), try to auto-detect or suggest modes
      if (currentMode === 'default') {
        const detectedMode = chatService.detectModeFromQuery(message);
        if (detectedMode) {
          console.log('🤖 Auto-detected mode:', detectedMode);
          dispatch(setMode(detectedMode));
          selectMode(detectedMode); // This will switch to chat view and set renderer
        } else {
          // Switch to chat view and let user choose mode after seeing the query
          dispatch(switchToChat());
        }
      }
      
      // If pipeline wizard active, route input there and skip generic flow
      if (pipelineWizard.isActive() || currentMode === 'create-pipeline') {
        dispatch(addMessage({ role: 'user', content: message }));
        await pipelineWizard.submit(message);
        setIsProcessing(false);
        return;
      }

      // Add user message for other modes
      dispatch(addMessage({
        role: 'user',
        content: message,
      }));
      
      // Switch to 2-column layout based on manager logic
      const currentEffectiveMode = currentMode === 'default' ? chatService.detectModeFromQuery(message) || 'default' : currentMode;
      
      // For data explorer, switch to 2-column when connection is selected and user sends a query
      if (currentEffectiveMode === 'explore-data' && data.selectedConnection) {
        dispatch(setTwoColumn());
        const renderer = chatService.getRenderer(currentEffectiveMode);
        dispatch(setRenderer(renderer));
        dispatch(setStatus('loading')); // Set loading state for every query
      }
      // For other modes, switch on first message OR update renderer for subsequent queries
      else if (chatService.shouldSwitchToTwoColumn(currentEffectiveMode, messages, data)) {
        if (messages.length === 0) {
          dispatch(setTwoColumn());
        }
        // Always update renderer and show loading for each query (including subsequent ones)
        const renderer = chatService.getRenderer(currentEffectiveMode);
        dispatch(setRenderer(renderer));
        dispatch(setStatus('loading')); // Set loading state for every query
      }

      // Simulate AI response with proper stage progression
      dispatch(setStreaming(true));
      console.log('🤖 Starting AI response simulation');
      
      const assistantMessageId = crypto.randomUUID();
      console.log('🆔 Generated assistant message ID:', assistantMessageId);
      
      // Add assistant message with stage content that will be updated
      dispatch(addMessage({
        role: 'assistant' as const,
        content: 'Thinking...',
      }));
      console.log('📝 Assistant message added with thinking state');

      // Get the assistant message we just added (it's the last one)
      const getCurrentAssistantMessage = () => {
        const currentMessages = store.getState().chat.messages;
        return currentMessages[currentMessages.length - 1]; // Last message should be our assistant message
      };

      // Stage 1: Thinking
      dispatch(setMessageStage({ messageId: assistantMessageId, stage: 'thinking' }));
      console.log('🧠 Stage: thinking');
      
      let targetMessage = getCurrentAssistantMessage();
      if (targetMessage) {
        dispatch(updateMessage({
          id: targetMessage.id,
          updates: { content: '🧠 Analyzing your request...' }
        }));
      }
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 2: Tool
      dispatch(setMessageStage({ messageId: assistantMessageId, stage: 'tool' }));
      console.log('🔧 Stage: tool');
      
      targetMessage = getCurrentAssistantMessage();
      if (targetMessage) {
        dispatch(updateMessage({
          id: targetMessage.id,
          updates: { content: '🔧 Processing with AI tools...' }
        }));
      }
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Stage 3: Rendering
      dispatch(setMessageStage({ messageId: assistantMessageId, stage: 'rendering' }));
      console.log('🎨 Stage: rendering');
      
      targetMessage = getCurrentAssistantMessage();
      if (targetMessage) {
        dispatch(updateMessage({
          id: targetMessage.id,
          updates: { content: '🎨 Generating response...' }
        }));
      }
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Final: Show actual content and update renderer data
      const finalEffectiveMode = currentMode === 'default' ? chatService.detectModeFromQuery(message) || 'default' : currentMode;
      const responseContent = chatService.generateResponse(finalEffectiveMode, message);
      
      targetMessage = getCurrentAssistantMessage();
      if (targetMessage) {
        // Set this message as active and update renderer data
        dispatch(setActiveMessage(targetMessage.id));
        dispatch(updateData({ 
          currentQuery: message,
          queryResponse: responseContent,
          timestamp: Date.now(),
          mode: finalEffectiveMode
        }));
        
        // Set status to ready after data is updated
        dispatch(setStatus('ready'));
        
        dispatch(updateMessage({
          id: targetMessage.id,
          updates: { content: responseContent }
        }));
        console.log('✅ Updated assistant message with final content');
      }

      dispatch(setMessageStage({ messageId: assistantMessageId, stage: 'complete' }));
      dispatch(setStreaming(false));
      console.log('🎉 Message processing complete');
      
    } catch (error) {
      console.error('❌ Error in sendMessage:', error);
      dispatch(setStreaming(false));
    } finally {
      setIsProcessing(false);
    }
  };

  const focusComposer = () => {
    // Implementation for focusing the input composer
    const input = document.querySelector('input[placeholder*="Ask"]') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  const onAssistantMessageClick = (messageId: string) => {
    console.log('🔄 Restoring renderer state for message:', messageId);
    dispatch(setActiveMessage(messageId));
  };

  return (
    <ChatControllerContext.Provider
      value={{
        selectMode,
        backToDefault,
        backToHome,
        sendMessage,
        focusComposer,
        onAssistantMessageClick,
      }}
    >
      {children}
    </ChatControllerContext.Provider>
  );
};

// All mode detection and response generation logic moved to managers
