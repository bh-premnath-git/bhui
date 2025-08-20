import React, { useState } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ActionCategories } from '@/components/chat/ActionCategories';
import { CommunityShowcase } from '@/components/chat/CommunityShowcase';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { RightAsideComponent } from '@/components/chat/RightAsideComponent';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setContext, setOtherActions, setSelectedActionTitle, clearMessages } from '@/store/slices/chat/chatSlice';

// Example for centered/empty state
const Home: React.FC = () => {
  const { context, messages, otherActions, selectedActionTitle, layoutMode } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNewChat = () => {
    dispatch(setContext(''));
    dispatch(setOtherActions(null));
    dispatch(setSelectedActionTitle(null));
    dispatch(clearMessages());
  };

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  // Optionally handle chat history item click
  const handleSelectChat = (id: number) => {
    // Add context switch logic here if needed
  };

  // No context selected - show onboarding/centered layout
  if (!context) {
    return (
      <div className="flex h-screen bg-chat-background">
        <ChatSidebar
          open={sidebarOpen}
          onToggle={handleToggleSidebar}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
        />
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-10">
              <div className="text-center space-y-8">
                <ChatHeader />
                <ChatInput />
                <ActionCategories />
              </div>
              <CommunityShowcase />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Split layout mode
  if (layoutMode === 'split') {
    return (
      <div className="flex h-screen bg-chat-background">
        <ChatSidebar
          open={sidebarOpen}
          onToggle={handleToggleSidebar}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
        />
        <div className="flex flex-1 h-full">
          {/* Left Panel - Chat */}
          <div className="flex flex-col flex-1 border-r border-chat-border/50">
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col h-full px-4 py-4">
                {context === 'other-items' && otherActions && (
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Choose an action:</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {otherActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.id}
                            onClick={() => {
                              dispatch(setContext(`action-${action.id}`));
                              dispatch(setOtherActions(null));
                              dispatch(setSelectedActionTitle(action.title));
                            }}
                            className="justify-start h-10 px-3 text-sm hover:bg-accent hover:text-accent-foreground rounded-lg border border-transparent hover:border-border flex items-center"
                          >
                            <Icon className="w-4 h-4 mr-3 text-current" />
                            <span>{action.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      {context === 'other-items'
                        ? 'Select an action above or start typing...'
                        : `Start your conversation about ${context.replace('-', ' ')}...`}
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 pb-4">
                    <ChatMessages />
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-chat-border/20 bg-background/80 backdrop-blur-sm sticky bottom-0">
              <div className="p-4">
                <ChatInput />
              </div>
            </div>
          </div>
          {/* Right Panel - Component */}
          <div className="w-1/2 min-w-[300px] bg-background">
            <RightAsideComponent />
          </div>
        </div>
      </div>
    );
  }

  // Full-screen chat mode
  return (
    <div className="flex h-screen bg-chat-background">
      <ChatSidebar
        open={sidebarOpen}
        onToggle={handleToggleSidebar}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col container mx-auto px-4 max-w-4xl py-6">
          {context === 'other-items' && otherActions && (
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6 flex-shrink-0">
              <h3 className="text-sm font-semibold text-foreground mb-3">Choose an action:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {otherActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        dispatch(setContext(`action-${action.id}`));
                        dispatch(setOtherActions(null));
                        dispatch(setSelectedActionTitle(action.title));
                      }}
                      className="justify-start h-12 px-3 text-sm hover:bg-accent hover:text-accent-foreground rounded-lg border border-transparent hover:border-border flex items-center"
                    >
                      <Icon className="w-4 h-4 mr-3 text-current" />
                      <span>{action.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">
                {context === 'other-items'
                  ? 'Select an action above or start typing...'
                  : `Start your conversation about ${context.replace('-', ' ')}...`}
              </p>
            </div>
          ) : (
            <div className="flex-1 pb-4">
              <ChatMessages />
            </div>
          )}
        </div>
        <div className="border-t border-chat-border/20 bg-background/80 backdrop-blur-sm sticky bottom-0">
          <div className="container mx-auto px-4 py-4 max-w-4xl">
            <ChatInput />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;