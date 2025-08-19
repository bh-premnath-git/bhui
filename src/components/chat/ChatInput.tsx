import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Plus, Shuffle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setCurrentInput, addMessage } from '@/store/slices/chat/chatSlice';

export const ChatInput: React.FC = () => {
  const { currentInput, isLoading, context } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (!currentInput.trim() || isLoading) return;

    // Add user message
    dispatch(addMessage({
      content: currentInput,
      isUser: true,
    }));

    // Simulate AI response
    setTimeout(() => {
      dispatch(addMessage({
        content: "I'd be happy to help you build that! Let me break down your request and create something amazing.",
        isUser: false,
      }));
    }, 1000);

    dispatch(setCurrentInput(''));
    setIsExpanded(false);
  };

  const handleInputChange = (value: string) => {
    dispatch(setCurrentInput(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="glass-effect rounded-xl p-3 border border-chat-border/50 transition-smooth hover:border-primary/20 focus-within:border-primary/40 focus-within:glow-effect">
        <div className="flex items-center space-x-2">
          {/* Input Actions */}
          <div className="flex items-center space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-7 h-7 rounded-full hover:bg-primary/10 p-0"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-7 h-7 rounded-full hover:bg-primary/10 p-0"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Main Input */}
          <div className="flex-1">
            <Textarea
              value={currentInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsExpanded(true)}
              placeholder="Ask BigHammer.ai to build..."
              className="min-h-[36px] resize-none border-0 bg-transparent py-2 px-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 leading-5"
              rows={isExpanded ? 3 : 1}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!currentInput.trim() || isLoading}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground rounded-full px-3 py-1.5 min-w-[60px] transition-bounce disabled:opacity-50 flex-shrink-0 h-8 text-sm"
          >
            {isLoading ? (
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Send</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};