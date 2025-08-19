import React, { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { getChatService } from '@/services/chatService';

export const ChatMessages: React.FC = () => {
  const dispatch = useAppDispatch();
  const { messages, isTyping } = useAppSelector((state) => state.chat);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = getChatService(dispatch);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleOptionClick = (option: string) => {
    chatService.handleUserChoice(option);
  };

  const handleCardClick = (stepId: string) => {
    chatService.handleCardClick(stepId);
  };

  if (messages.length === 0 && !isTyping) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-chat-surface/30 border-chat-border/50 max-h-96 overflow-y-auto">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!message.isUser && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-background border border-chat-border/50'
                }`}
              >
                {message.content && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}
                
                {/* Render options as buttons */}
                {message.options && message.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleOptionClick(option)}
                        className="text-xs"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Render UI components */}
                {message.uiComponent && message.uiComponent.type === 'Card' && (
                  <Card 
                    className="mt-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => message.uiComponent?.stepId && handleCardClick(message.uiComponent.stepId)}
                  >
                    <h4 className="font-medium text-sm">{message.uiComponent.props.title}</h4>
                    {message.uiComponent.props.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.uiComponent.props.description}
                      </p>
                    )}
                  </Card>
                )}
                
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>

              {message.isUser && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-muted">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-background border border-chat-border/50 rounded-lg px-4 py-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:200ms]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:400ms]" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </Card>
    </div>
  );
};