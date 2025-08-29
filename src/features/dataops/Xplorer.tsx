import { ChatMessage } from './components/Xplore/chat-message';
import { ChatInput } from './components/Xplore/chat-input';
import { WelcomeScreen } from './components/Xplore/xplore-welcome-screen';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useSuggestedDataopsQuestions } from '@/hooks/useSuggestedQuestions';
import { Toaster } from 'sonner';

export function Xplorer() {
  const { messages, isStreaming, handleSubmitQuestion, handleSuggestedQuestion } = useAnalytics();
  const { questions: suggestedQuestions } = useSuggestedDataopsQuestions();
  const suggestedQuestionsArray = suggestedQuestions?.map(q => q.text) || [];

  return (
    <>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto pb-1 scrollable-container">
          {messages.length === 0 ? (
            <WelcomeScreen
              suggestedQuestions={suggestedQuestionsArray}
              onSuggestedQuestion={handleSuggestedQuestion}
            />
          ) : (
            <div className="pt-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t bg-background p-2 fixed bottom-0 left-0 right-0 z-10 shadow-md">
          <div className="mx-auto max-w-2xl">
            <ChatInput
              isLoading={isStreaming}
              onSubmit={handleSubmitQuestion}
            />
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}