import { MessagesList } from '@/components/chat/MessagesList';
import { ChatInput } from '@/components/chat/ChatInput';

interface ChatContentProps {
  showMessages: boolean;
  onAssistantMessageClick?: (messageId: string) => void;
}

export const ChatContent = ({ showMessages, onAssistantMessageClick }: ChatContentProps) => {
  return (
      <div className="h-full flex flex-col bg-background overflow-hidden">
        {showMessages ? (
          <>
            <MessagesList onAssistantMessageClick={onAssistantMessageClick} />
            <ChatInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>No messages yet</p>
            </div>
          </div>
        )}
      </div>
  );
};