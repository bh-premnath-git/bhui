import { useState, useEffect } from 'react';
import { useConnections as useAdminConnections } from '@/features/admin/connection/hooks/useConnection';

export interface Connection {
  id: string;
  name: string;
}

export interface RecentChat {
  id: string;
  name: string;
}

// Mock data just for recent chats since we don't have a real API for this yet
const mockRecentChats: RecentChat[] = [
  { id: "1", name: "Customer Analysis" },
  { id: "2", name: "Revenue Report" },
  { id: "3", name: "User Engagement" },
  { id: "4", name: "Sales Pipeline" },
  { id: "5", name: "Marketing Metrics" },
];

export function useConnections() {
  const { connections: adminConnections, isLoading: adminLoading, isError: adminError } = useAdminConnections();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use real connections data
        if (adminConnections && adminConnections.length > 0) {
          // Map admin connections format to our simplified format
          const mappedConnections: Connection[] = adminConnections.map(conn => ({
            id: conn.id.toString(),
            name: conn.connection_config_name || conn.id.toString()
          }));
          
          setConnections(mappedConnections);
        }

        // For recent chats we'll still use mock data until we have a real API
        setRecentChats(mockRecentChats);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch connections and recent chats');
        setIsLoading(false);
      }
    };

    // Only fetch data when admin connections are loaded
    if (!adminLoading) {
      fetchData();
    }
  }, [adminConnections, adminLoading]);

  useEffect(() => {
    if (adminError) {
      setError('Failed to fetch connections from database');
    }
  }, [adminError]);

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
      setRecentChats(prev => [chat, ...prev].slice(0, 10));
      return chat;
    } catch (err) {
      setError('Failed to add recent chat');
      throw err;
    }
  };

  return {
    connections,
    recentChats,
    isLoading: isLoading || adminLoading,
    error,
    addConnection,
    addRecentChat,
  };
}