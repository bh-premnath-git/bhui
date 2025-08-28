import React, { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, ChevronRight, Sparkles } from 'lucide-react';
import { getChatService } from '@/services/chatService';
import { motion } from 'framer-motion';
import SuggestionButton from '@/features/designers/pipeline/components/SuggestionButton';

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

  const handleCardClick = (stepId: string, payload?: any) => {
    chatService.handleCardClick(stepId, payload);
  };

  const handleInputSubmit = (stepId: string, value: string) => {
    chatService.handleInputSubmit(stepId, value);
  };

  if (messages.length === 0 && !isTyping) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="h-full max-w-4xl mx-auto flex flex-col">
        <div className="flex-1 overflow-y-auto px-0">
          <div className="p-2 space-y-2 mt-[10px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`group flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <motion.div
                    className="relative inline-flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button
                      className="relative w-8 h-8 rounded-full group flex items-center justify-center hover:bg-accent"
                      style={{ backgroundColor: "#009f59" }}
                      whileHover={{ scale: 1.05, opacity: 0.9 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.img
                        src="/assets/ai/ai.svg"
                        alt="ai"
                        className="w-3 h-4 transform -rotate-[40deg] filter brightness-0 invert"
                        initial={{ rotate: -45 }}
                        animate={{ rotate: -40 }}
                        transition={{ type: 'spring', stiffness: 150 }}
                      />
                    </motion.button>
                  </motion.div>
                )}

                <div
                  className={`group max-w-[80%] rounded-2xl px-4 py-2.5 ${message.isUser
                      ? "relative ml-auto text-foreground ring-1 ring-border/40 shadow-sm bg-gradient-to-r from-muted/60 to-muted/30"
                      : "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 ring-1 ring-border/20"
                    }`}
                >
                  {message.content && (() => {
                    // Try to render JSON nicely if the content is JSON
                    try {
                      const trimmed = (message.content || '').trim();
                      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']')) ) {
                        const parsed = JSON.parse(trimmed);
                        return (
                          <pre className="text-xs leading-relaxed whitespace-pre overflow-auto max-h-80 bg-muted/30 rounded p-2">
                            {JSON.stringify(parsed, null, 2)}
                          </pre>
                        );
                      }
                    } catch {}
                    return (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                        {message.isStreaming && (
                          <span className="inline-block w-1 h-4 align-baseline bg-muted-foreground/60 animate-pulse ml-0.5 rounded-sm" />
                        )}
                      </p>
                    );
                  })()}
                  {!message.content && message.isStreaming && (
                    <div className="flex items-center gap-1 py-0.5">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:200ms]" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:400ms]" />
                    </div>
                  )}

                  {/* Render options as buttons */}
                  {message.options && message.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.options.map((option, index) => (
                        <SuggestionButton
                          key={index}
                          text={option}
                          onClick={() => handleOptionClick(option)}
                          index={index}
                          className="mr-1.5"
                        // Use Sparkles icon with assistant color
                        />
                      ))}
                    </div>
                  )}

                  {/* Render UI components */}
                  {message.uiComponent && message.uiComponent.type === 'Card' && (
                    <Card
                      className={`relative mt-3 p-0 overflow-hidden border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all group ring-1  ${message.uiComponent?.stepId ? 'cursor-pointer' : 'opacity-60 cursor-default'}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${message.uiComponent.props.title || 'action'}`}
                      aria-disabled={!message.uiComponent?.stepId}
                      onClick={() => message.uiComponent?.stepId && handleCardClick(message.uiComponent.stepId, (message.uiComponent as any).payload)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && message.uiComponent?.stepId) {
                          e.preventDefault();
                          handleCardClick(message.uiComponent.stepId, (message.uiComponent as any).payload);
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

                  {message.uiComponent && message.uiComponent.type === 'Input' && (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                        placeholder={message.uiComponent.props.placeholder || 'Type here'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = (e.target as HTMLInputElement).value.trim();
                            if (value) handleInputSubmit(message.uiComponent.stepId || '', value);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={(e) => {
                          const container = (e.currentTarget.parentElement as HTMLElement);
                          const input = container.querySelector('input');
                          const value = (input as HTMLInputElement)?.value.trim();
                          if (value) handleInputSubmit(message.uiComponent.stepId || '', value);
                        }}
                      >
                        {message.uiComponent.props.buttonLabel || 'Submit'}
                      </Button>
                    </div>
                  )}

                  {message.uiComponent && message.uiComponent.type === 'TextArea' && (
                    <div className="mt-3">
                      <textarea
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                        placeholder={message.uiComponent.props.placeholder || 'Describe here'}
                        rows={(message.uiComponent.props as any).rows || 4}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            const value = (e.target as HTMLTextAreaElement).value.trim();
                            if (value) handleInputSubmit(message.uiComponent.stepId || '', value);
                          }
                        }}
                      />
                      <div className="mt-2 flex justify-end">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const container = (e.currentTarget.parentElement?.parentElement as HTMLElement);
                            const input = container.querySelector('textarea');
                            const value = (input as HTMLTextAreaElement)?.value.trim();
                            if (value) handleInputSubmit(message.uiComponent.stepId || '', value);
                          }}
                        >
                          {message.uiComponent.props.buttonLabel || 'Submit'}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className={`mt-1 flex items-center gap-1 text-[10px] leading-none text-muted-foreground/70 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <time dateTime={new Date(message.timestamp).toISOString()}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
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
                  <div className="p-1">
                    <motion.img
                      src="/assets/ai/ai.svg"
                      alt="AI"
                      className="w-5 h-5 -rotate-[40deg]"
                      initial={{ rotate: -45 }}
                      animate={{ rotate: -40 }}
                      transition={{ type: 'spring', stiffness: 150 }}
                      style={{ filter: 'invert(28%) sepia(73%) saturate(471%) hue-rotate(108deg) brightness(96%) contrast(92%)' }}
                    />
                  </div>
                  <AvatarFallback className="bg-[#009f59]/10 text-[#009f59] text-[10px]">AI</AvatarFallback>
                </Avatar>
                <div className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 ring-1 ring-border/20 rounded-lg px-4 py-2">
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
        </div>
      </div>
    </div>
  );
};