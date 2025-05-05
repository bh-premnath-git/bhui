import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AIChatInput } from "@/components/shared/AIChatInput";
import { User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatSlidingPortalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
}

export const ChatSlidingPortal = ({ 
  isOpen, 
  onClose, 
  imageSrc 
}: ChatSlidingPortalProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    // Show loading state
    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: 'Processing...' }]);

    // Simulate AI response
    setTimeout(() => {
      // Replace "Thinking..." with actual response
      setMessages(prev => [
        ...prev.slice(0, -1),
        { 
          role: 'assistant', 
          content: getNotebookResponse(input)
        }
      ]);
      setLoading(false);
    }, 1500);

    setInput("");
  };

  // Sample notebook-specific responses
  const getNotebookResponse = (query: string): string => {
    const normalizedQuery = query.toLowerCase();
    
    if (normalizedQuery.includes('template') || normalizedQuery.includes('generate')) {
      return "I can help create a notebook template! Would you like a template for:\n\n1. Database Source Documentation\n2. API Integration Requirements\n3. Data Transformation Rules\n\nLet me know which you prefer.";
    }
    
    if (normalizedQuery.includes('analyze') || normalizedQuery.includes('review')) {
      return "I'd be happy to analyze your notebook content. Please provide the specific section you'd like me to review, or I can provide general feedback on the overall structure and completeness.";
    }
    
    if (normalizedQuery.includes('suggest') || normalizedQuery.includes('improve')) {
      return "Here are some suggestions to improve your notebook:\n\n• Add more detailed connection parameters\n• Include data validation rules\n• Document refresh frequency requirements\n• Consider adding schema diagrams\n• Specify error handling procedures";
    }
    
    return "I'm your notebook assistant! I can help with:\n\n• Generating templates\n• Analyzing content\n• Suggesting improvements\n• Documentation best practices\n\nWhat would you like help with today?";
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    handleSend();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] p-0 flex flex-col h-full border-none bg-background/95 backdrop-blur-md">
        <div className="px-6 py-4 border-b bg-background/70 backdrop-blur-md">
          <h2 className="text-base font-medium">Notebook AI Assistant</h2>
        </div>
        
        <ScrollArea className="flex-1 px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 space-y-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <img 
                  src={imageSrc} 
                  alt="AI" 
                  className="w-6 h-8 transform -rotate-[40deg]"
                />
              </div>
              <div className="text-center space-y-2 max-w-sm">
                <p className="text-lg font-medium">How can I help with your notebook?</p>
                <p className="text-sm text-muted-foreground">
                  I can generate templates, analyze content, and suggest improvements.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 w-full max-w-md mt-4">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3 px-4 hover:bg-primary/5 border-primary/20"
                  onClick={() => handleQuickAction("Generate a template for my notebook")}
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium">Generate template</p>
                      <p className="text-xs text-muted-foreground mt-1">Create a structured notebook template</p>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3 px-4 hover:bg-primary/5 border-primary/20"
                  onClick={() => handleQuickAction("Analyze my notebook content")}
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium">Analyze content</p>
                      <p className="text-xs text-muted-foreground mt-1">Review and provide feedback on your notebook</p>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3 px-4 hover:bg-primary/5 border-primary/20"
                  onClick={() => handleQuickAction("Suggest improvements for my notebook")}
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium">Suggest improvements</p>
                      <p className="text-xs text-muted-foreground mt-1">Get ideas to enhance your documentation</p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  } gap-4 px-1`}
                >
                  {message.role === "assistant" ? (
                    <Avatar className="w-8 h-8 mr-0 flex-shrink-0 mt-1">
                      <AvatarImage src={imageSrc} className="w-4 h-6 transform -rotate-[40deg]" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="w-8 h-8 mr-0 flex-shrink-0 bg-primary/90 mt-1">
                      <AvatarFallback className="text-primary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={`flex flex-col max-w-[85%] ${
                      message.role === "assistant" ? "" : "items-end"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        message.role === "assistant" 
                          ? "bg-card border border-border/40" 
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-start gap-4 px-1">
                  <Avatar className="w-8 h-8 mr-0 flex-shrink-0 mt-1">
                    <AvatarImage src={imageSrc} className="w-4 h-6 transform -rotate-[40deg]" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col max-w-[85%]">
                    <div className="rounded-2xl px-4 py-3 bg-card border border-border/40 shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce delay-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 bg-background/70 backdrop-blur-md border-t">
          <AIChatInput
            input={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder="Ask about your notebook..."
            disabled={loading}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
