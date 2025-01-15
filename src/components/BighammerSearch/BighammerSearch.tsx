import { useState } from 'react';
import {  Menu } from 'lucide-react';
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
  const token = sessionStorage?.getItem('token');
  const decoded = token ? jwtDecode(token) : null;

  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'Previous Chat 1', timestamp: new Date().toISOString() },
    { id: 2, title: 'Previous Chat 2', timestamp: new Date().toISOString() },
  ]);

  const handleNewChat = () => {
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      title: `New Chat ${newChatId}`,
      timestamp: new Date().toISOString(),
    };
    setChatHistory([newChat, ...chatHistory]);
    setConversation([]);
    setQuestion('');
  };

  const handleDeleteChat = (id) => {
    setChatHistory(chatHistory.filter((chat) => chat.id !== id));
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = async () => {
    if (!question.trim()) return;

    const newEntry = { question, response: null, id: Date.now() };
    setConversation([...conversation, newEntry]);
    setQuestion('');
    setIsLoading(true);
    const body = {
      question,
      thread_id: 'thread_123456',
    }
    try {
      const res =  await ApiService('8090', 'post', '/platform_search/platform_search', body);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setConversation((prev) =>
        prev.map((entry) =>
          entry.id === newEntry.id
            ? { ...entry, response: data.answer }
            : entry
        )
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      setConversation((prev) =>
        prev.map((entry) =>
          entry.id === newEntry.id
            ? { ...entry, response: 'Error fetching response. Please try again.' }
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
