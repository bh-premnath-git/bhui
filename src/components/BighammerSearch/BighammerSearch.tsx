import { useState, useCallback, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InputField from './InputField';
import ChatHistory from './ChatHistory';
import ConversationView from '@/components/BighammerSearch/ConversationView';
import './BigHammerSearch.css';
import { jwtDecode } from 'jwt-decode';
import { ApiService } from '@/services/apiServices';

export default function BigHammerSearch() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [threadId, setThreadId] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const token = sessionStorage?.getItem('token');
  const decoded = token ? jwtDecode(token) : null;

  const generateThreadId = useCallback(() => {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const createNewChat = useCallback(() => {
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      title: `New Chat ${newChatId}`,
      timestamp: new Date().toISOString(),
    };
    setChatHistory(prevHistory => [newChat, ...prevHistory]);
    setConversation([]);
    setQuestion('');
    setThreadId(generateThreadId());
    return newChat;
  }, [generateThreadId]);

  useEffect(() => {
    // Create a new chat when the component mounts
    createNewChat();
  }, [createNewChat]);

  const handleNewChat = () => {
    createNewChat();
  };

  const handleDeleteChat = (id) => {
    setChatHistory(prevHistory => prevHistory.filter((chat) => chat.id !== id));
    if (chatHistory.length === 1) {
      // If deleting the last chat, create a new one
      createNewChat();
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = async () => {
    if (!question.trim()) return;

    const newEntry = { question, response: null, id: Date.now() };
    setConversation(prevConversation => [...prevConversation, newEntry]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await ApiService('8090', 'post', '/platform_search/platform_search', {
        question,
        thread_id: threadId,
      });

      if (!response || typeof response.answer !== 'string') {
        throw new Error('Invalid response format');
      }

      setConversation(prevConversation =>
        prevConversation.map((entry) =>
          entry.id === newEntry.id
            ? {
                ...entry,
                response: response.answer,
              }
            : entry
        )
      );

      // Update the chat title with the first question
      if (conversation.length === 0) {
        setChatHistory(prevHistory =>
          prevHistory.map(chat =>
            chat.id === chatHistory[0].id
              ? { ...chat, title: question.substring(0, 30) + (question.length > 30 ? '...' : '') }
              : chat
          )
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      
      const errorMessage = error.message || 'An error occurred. Please try again.';

      setConversation(prevConversation =>
        prevConversation.map((entry) =>
          entry.id === newEntry.id
            ? {
                ...entry,
                response: `Error: ${errorMessage}`,
                error: true
              }
            : entry
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full relative bg-gradient-to-b from-gray-100 to-gray-300">
      <div className="flex-1 flex flex-col">
        <ConversationView
          conversation={conversation}
          isLoading={isLoading}
          decoded={decoded}
        />
        <InputField
          question={question}
          setQuestion={setQuestion}
          handleSearch={handleSearch}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="absolute top-4 right-4 z-50 text-gray-700 hover:text-gray-900"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isMenuOpen && (
        <ChatHistory
          chatHistory={chatHistory}
          handleNewChat={handleNewChat}
          handleDeleteChat={handleDeleteChat}
        />
      )}
    </div>
  );
}

