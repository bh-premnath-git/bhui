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
    setMessages(prev => [...prev, { role: 'assistant', content: 'Thinking...' }]);

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
      <SheetContent side="right" className="w-[600px] p-4 flex flex-col h-full">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-sm font-semibold">Notebook AI Assistant</h2>
        </div>
        {messages.length === 0 ? (
          <div className="mt-4 flex flex-col items-center flex-grow justify-center">
            <img 
              src={imageSrc} 
              alt="AI" 
              className="w-4 h-6 transform -rotate-[40deg]"
            />
            <p className="text-sm text-gray-600 mt-4 mb-6">How can I assist with your notebook?</p>
            
            <div className="grid grid-cols-1 gap-2 w-full max-w-md">
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => handleQuickAction("Generate a template for my notebook")}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate template
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => handleQuickAction("Analyze my notebook content")}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze content
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => handleQuickAction("Suggest improvements for my notebook")}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Suggest improvements
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4 mt-4">
            <div className="space-y-6">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={imageSrc} />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8 bg-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] relative ${
                      message.role === "assistant"
                        ? "bg-gray-100 text-black before:absolute before:left-[-6px] before:top-3 before:border-4 before:border-transparent before:border-r-gray-100"
                        : "bg-primary text-primary-foreground before:absolute before:right-[-6px] before:top-3 before:border-4 before:border-transparent before:border-l-primary"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={imageSrc} />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 text-black rounded-lg px-4 py-2 max-w-[80%] relative before:absolute before:left-[-6px] before:top-3 before:border-4 before:border-transparent before:border-r-gray-100">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
        <div className="flex gap-2 mt-4">
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
