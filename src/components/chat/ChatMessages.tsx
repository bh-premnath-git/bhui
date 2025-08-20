import React, { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, ChevronRight, Sparkles } from 'lucide-react';
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
      <Card className="bg-chat-surface/30 max-h-full overflow-y-auto">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!message.isUser && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="/assets/ai/ai.svg" alt="AI" className="p-1" />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">AI</AvatarFallback>
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
                        variant={message.isUser ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleOptionClick(option)}
                        className="text-xs rounded-full border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
 
                {/* Render UI components */}
                {message.uiComponent && message.uiComponent.type === 'Card' && (
                  <Card
                    className={`relative mt-3 p-0 overflow-hidden border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all group ring-1 ring-transparent hover:ring-primary/30 focus-visible:ring-2 focus-visible:ring-primary/40 ${message.uiComponent?.stepId ? 'cursor-pointer' : 'opacity-60 cursor-default'}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${message.uiComponent.props.title || 'action'}`}
                    aria-disabled={!message.uiComponent?.stepId}
                    onClick={() => message.uiComponent?.stepId && handleCardClick(message.uiComponent.stepId)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && message.uiComponent?.stepId) {
                        e.preventDefault();
                        handleCardClick(message.uiComponent.stepId);
                      }
                    }}
                  >
                    {/* Left accent bar */}
                    <div className="absolute left-0 top-0 h-full w-1 bg-primary/30 group-hover:bg-primary/50 transition-colors" aria-hidden="true" />
                    {/* Subtle radial overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'radial-gradient(120px 80px at 16% 0%, hsl(var(--primary)/0.08), transparent 60%)' }}
                      aria-hidden="true"
                    />
 
                    <CardHeader className="p-4 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex items-start gap-2">
                          <Sparkles className="h-4 w-4 mt-0.5 text-primary/80 shrink-0" />
                          <div className="min-w-0">
                            <CardTitle className="text-base truncate">
                              {message.uiComponent.props.title}
                            </CardTitle>
                            {message.uiComponent.props.description && (
                              <CardDescription className="mt-0.5 text-xs line-clamp-2">
                                {message.uiComponent.props.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                          <Badge variant="secondary" className="rounded-full text-[10px]">Action</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <div className="px-4 pb-3">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>Tap to continue</span>
                        <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform translate-x-0.5 group-hover:translate-x-0" />
                      </div>
                    </div>
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
                <AvatarImage src="/assets/ai/ai.svg" alt="AI" className="p-1" />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">AI</AvatarFallback>
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
 