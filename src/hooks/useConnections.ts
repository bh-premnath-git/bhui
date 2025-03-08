import { useState, useEffect } from 'react';

export interface Connection {
  id: string;
  name: string;
}

export interface RecentChat {
  id: string;
  name: string;
}

// Simulated API data
const mockConnections: Connection[] = [
  { id: "newconneection1", name: "newconneection1" },
  { id: "newconnecton2", name: "newconnecton2" },
  { id: "connection3", name: "Production DB" },
  { id: "connection4", name: "Staging DB" },
  { id: "connection5", name: "Development DB" },
];

const mockRecentChats: RecentChat[] = [
  { id: "1", name: "Customer Analysis" },
  { id: "2", name: "Revenue Report" },
  { id: "3", name: "User Engagement" },
  { id: "4", name: "Sales Pipeline" },
  { id: "5", name: "Marketing Metrics" },
];

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate API calls
        const connectionsResponse = await Promise.resolve(mockConnections);
        const recentChatsResponse = await Promise.resolve(mockRecentChats);

        setConnections(connectionsResponse);
        setRecentChats(recentChatsResponse);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch connections and recent chats');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addConnection = async (newConnection: Omit<Connection, 'id'>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const connection: Connection = {
        id: crypto.randomUUID(),
        ...newConnection,
      };
      setConnections(prev => [...prev, connection]);
      return connection;
    } catch (err) {
      setError('Failed to add connection');
      throw err;
    }
  };

  const addRecentChat = async (newChat: Omit<RecentChat, 'id'>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const chat: RecentChat = {
        id: crypto.randomUUID(),
        ...newChat,
      };
      setRecentChats(prev => [chat, ...prev].slice(0, 10)); // Keep only 10 most recent
      return chat;
    } catch (err) {
      setError('Failed to add recent chat');
      throw err;
    }
  };

  return {
    connections,
    recentChats,
    isLoading,
    error,
    addConnection,
    addRecentChat,
  };
}