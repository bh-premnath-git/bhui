import React from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ActionCategories } from './ActionCategories';
import { ActionsList } from './ActionsList';
import { ChatMessages } from './ChatMessages';
import { CommunityShowcase } from './CommunityShowcase';

export const ChatInterface: React.FC = () => {
  return (
    <div className="min-h-screen bg-chat-background transition-smooth">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-12">
          {/* Main Chat Section */}
          <div className="text-center space-y-8">
            <ChatHeader />
            <ChatInput />
            <ActionCategories />
          </div>
          
          {/* Chat Messages and Actions */}
          <div className="space-y-8">
            <ChatMessages />
            <ActionsList />
          </div>
          
          {/* Community Section */}
          <CommunityShowcase />
        </div>
      </div>
    </div>
  );
};