import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Database, ChevronDown, Plus, History, Check, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAnalytics } from "@/context/AnalyticsContext";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const {
    input,
    setInput,
    selectedConnection,
    selectedRecent,
    selectedName,
    connections,
    recentChats,
    isLoading: isLoadingConnections,
    error,
    handleConnectionSelect,
    handleRecentSelect,
    handleNewChat,
  } = useAnalytics();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input);
      setInput("");
      setIsTextareaFocused(false);
      setIsDropdownOpen(false);
      textareaRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t bg-background/80 px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center gap-2 bg-background relative transition-all duration-200">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-10 gap-2 text-xs font-normal hover:bg-muted relative z-10 px-3 justify-start group transition-all duration-200 ${
                isDropdownOpen ? 'min-w-[180px]' : 'min-w-[140px]'
              }`}
              disabled={isLoadingConnections}
            >
              {isLoadingConnections ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : selectedRecent ? (
                <History className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Database className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">
                {isLoadingConnections ? 'Loading...' : selectedName || 'Select Connection'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-100 ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={`p-0 transition-all duration-200 ${
              isDropdownOpen ? 'w-[240px]' : 'w-[200px]'
            }`}
            sideOffset={8}
          >
            <div className="py-1">
              <DropdownMenuLabel className="text-xs px-2 py-0.5">
                Connections
              </DropdownMenuLabel>
              <ScrollArea className="h-[80px]">
                {error ? (
                  <div className="p-2 text-xs text-destructive">{error}</div>
                ) : (
                  <div className="px-1">
                    {connections.map((connection) => (
                      <DropdownMenuItem
                        key={connection.id}
                        onClick={() => handleConnectionSelect(connection)}
                        className="text-xs justify-between py-1"
                      >
                        <div className="flex items-center gap-2">
                          <Database className="h-3.5 w-3.5" />
                          {connection.name}
                        </div>
                        {selectedConnection === connection.id && !selectedRecent && (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            <DropdownMenuSeparator className="my-0" />
            
            {recentChats.length > 0 && (
              <>
                <div className="py-1">
                  <DropdownMenuLabel className="text-xs px-2 py-0.5">
                    Recent
                  </DropdownMenuLabel>
                  <ScrollArea className="h-[80px]">
                    <div className="px-1">
                      {recentChats.map((chat) => (
                        <DropdownMenuItem
                          key={chat.id}
                          onClick={() => handleRecentSelect(chat)}
                          className="text-xs justify-between py-1"
                        >
                          <div className="flex items-center gap-2">
                            <History className="h-3.5 w-3.5" />
                            {chat.name}
                          </div>
                          {selectedRecent === chat.id && (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <DropdownMenuSeparator className="my-0" />
              </>
            )}
            
            <div className="p-1">
              <DropdownMenuItem 
                className="text-xs py-1"
                onClick={handleNewChat}
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5" />
                  New Chat
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative flex-1 rounded-lg border border-input bg-background overflow-hidden">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsTextareaFocused(true)}
            onBlur={() => setIsTextareaFocused(false)}
            placeholder="Ask a question about your data..."
            className={`min-h-[36px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 py-2 px-3 text-sm leading-tight shadow-none placeholder:text-muted-foreground/50 transition-all duration-200 ${
              isTextareaFocused ? 'min-h-[100px]' : ''
            }`}
            disabled={isLoading}
            rows={isTextareaFocused ? 4 : 1}
          />
        </div>

        <Button
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full bg-primary hover:bg-primary/90 transition-colors"
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
        >
          <SendHorizontal className="h-4 w-4 text-primary-foreground" />
        </Button>
      </div>
    </div>
  );
}