import React from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import {ChatInput} from '@/components/chat/ChatInput';
import {ActionCategories} from '@/components/chat/ActionCategories';
import {ChatMessages} from '@/components/chat/ChatMessages';
import {ActionsList} from '@/components/chat/ActionsList';
import {CommunityShowcase} from '@/components/chat/CommunityShowcase';

const Home: React.FC = () => {
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
          {/* <div className="space-y-8">
            <ChatMessages />
            <ActionsList />
          </div> */}
          
          {/* Community Section */}
          <CommunityShowcase />
        </div>
      </div>
    </div>
  );
};

export default Home;