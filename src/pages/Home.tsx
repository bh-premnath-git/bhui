import React from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ActionCategories } from '@/components/chat/ActionCategories';
import { CommunityShowcase } from '@/components/chat/CommunityShowcase';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { RightAsideComponent } from '@/components/chat/RightAsideComponent';
import { useAppSelector } from '@/hooks/useRedux';

const Home: React.FC = () => {
  const { context, layoutMode, messages } = useAppSelector((s) => s.chat);

  // No context selected - show initial centered layout
  if (!context) {
    return (
      <div className="min-h-screen bg-chat-background transition-smooth">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-12">
            <div className="text-center space-y-8">
              <ChatHeader />
              <ChatInput />
              <ActionCategories />
            </div>
            <CommunityShowcase />
          </div>
        </div>
      </div>
    );
  }

  // Context selected but no right component - centered chat layout
  if (layoutMode === 'centered') {
    return (
      <div className="min-h-screen bg-chat-background transition-smooth">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="w-full text-center space-y-8">
              {/* <ChatHeader /> */}
              {messages.length > 0 && <ChatMessages />}
              <ChatInput />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Split layout - chat on left, component on right
  return (
    <div className="min-h-screen bg-chat-background transition-smooth">
      <div className="flex h-screen">
        {/* Left Panel - Chat */}
        <div className="w-full">
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
              <div className="space-y-8">
                {/* <div className="text-center">
                  <ChatHeader />
                </div> */}
                {messages.length > 0 && <ChatMessages />}
                <ChatInput />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Component */}
        <div className="w-full border-l border-chat-border/50">
          <RightAsideComponent />
        </div>
      </div>
    </div>
  );
};

export default Home;