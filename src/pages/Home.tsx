import React from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ActionCategories } from '@/components/chat/ActionCategories';
import { CommunityShowcase } from '@/components/chat/CommunityShowcase';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setContext, setOtherActions, setSelectedActionTitle } from '@/store/slices/chat/chatSlice';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Home: React.FC = () => {
  const { context, messages, otherActions, selectedActionTitle } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();

  const handleBackToHome = () => {
    dispatch(setContext(''));
    dispatch(setOtherActions(null));
    dispatch(setSelectedActionTitle(null));
  };

  const handleActionClick = (actionId: number, actionTitle: string) => {
    dispatch(setContext(`action-${actionId}`));
    dispatch(setOtherActions(null));
    dispatch(setSelectedActionTitle(actionTitle));
  };

  // Full-screen chat mode when context is set
  if (context) {
    return (
      <div className="min-h-screen bg-chat-background flex flex-col">
        {/* Chat Header with Back Button */}
        <div className="border-b border-chat-border/20 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 max-w-4xl">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="rounded-full hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedActionTitle || (context.startsWith('action-') ? 'Action Selected' : context.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()))}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 container mx-auto px-4 max-w-4xl">
          <div className="py-6 space-y-4">
            {/* Show Other Actions when context is 'other-items' */}
            {context === 'other-items' && otherActions && (
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm mt-2 mb-2">
                <h3 className="text-sm font-semibold text-foreground mb-3">Choose an action:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {otherActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.id}
                        variant="ghost"
                        onClick={() => handleActionClick(action.id, action.title)}
                        className="justify-start h-12 px-3 text-sm hover:bg-accent hover:text-accent-foreground rounded-lg border border-transparent hover:border-border"
                      >
                        <Icon className="w-4 h-4 mr-3 text-current" />
                        <span>{action.title}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {context === 'other-items' 
                    ? 'Select an action above or start typing...' 
                    : `Start your conversation about ${context.replace('-', ' ')}...`}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-card-foreground border border-border'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fixed Chat Input at Bottom */}
        <div className="border-t border-chat-border/20 bg-background/80 backdrop-blur-sm sticky bottom-0">
          <div className="container mx-auto px-4 py-4 max-w-4xl">
            <ChatInput />
          </div>
        </div>
      </div>
    );
  }

  // Default home page when no context
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
};

export default Home;