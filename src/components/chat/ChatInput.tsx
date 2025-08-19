import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Plus, Shuffle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setCurrentInput, addMessage } from '@/store/slices/chat/chatSlice';

export const ChatInput: React.FC = () => {
  const { currentInput, isLoading, context } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-effect rounded-2xl p-4 border border-chat-border/50 transition-smooth hover:border-primary/20 focus-within:border-primary/40 focus-within:glow-effect">
          <div className="flex items-start space-x-3">
            {/* Input Actions */}
            <div className="flex items-center space-x-1 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-full hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-full hover:bg-primary/10"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>

            {/* Main Input */}
            <div className="flex-1">
              <Textarea
                value={currentInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder="Ask v0 to build..."
                className="min-h-[48px] resize-none border-0 bg-transparent p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={isExpanded ? 3 : 1}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!currentInput.trim() || isLoading}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground rounded-full px-4 py-2 min-w-[80px] transition-bounce disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse [animation-delay:0.4s]" />
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </div>
              )}
            </Button>
          </div>

          {/* Agent Badge */}
          <div className="flex items-center justify-center mt-3 pt-3 border-t border-chat-border/30">
            <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">Agent</span>
            </div>
          </div>
        </div>

        {/* Upgrade Notice */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Upgrade to Team to unlock all of v0's features and more credits
            <Button variant="link" className="ml-2 text-primary p-0 h-auto">
              Upgrade Plan
            </Button>
          </p>
        </div>
      </form>
    </div>
  );
};