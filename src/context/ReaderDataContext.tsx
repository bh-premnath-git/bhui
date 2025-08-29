import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ReaderData {
  reader_name?: string;
  name?: string;
  file_type?: string;
  source?: {
    type?: string;
    source_name?: string;
    file_name?: string;
    table_name?: string;
    bh_project_id?: string;
    data_src_id?: string;
    file_type?: string;
    connection?: {
      name?: string;
      connection_config_id?: string;
      connection_type?: string;
      database?: string;
      schema?: string;
      secret_name?: string;
      file_path_prefix?: string;
    };
    connection_config_id?: string;
  };
}

interface ReaderDataContextType {
  readerData: ReaderData | null;
  setReaderData: (data: ReaderData | null) => void;
  updateReaderData: (updates: Partial<ReaderData>) => void;
}

const ReaderDataContext = createContext<ReaderDataContextType | undefined>(undefined);

export const useReaderData = () => {
  const context = useContext(ReaderDataContext);
  if (context === undefined) {
    throw new Error('useReaderData must be used within a ReaderDataProvider');
  }
  return context;
};

interface ReaderDataProviderProps {
  children: ReactNode;
}

export const ReaderDataProvider: React.FC<ReaderDataProviderProps> = ({ children }) => {
  const [readerData, setReaderData] = useState<ReaderData | null>(null);

  const updateReaderData = (updates: Partial<ReaderData>) => {
    setReaderData(prev => {
      if (!prev) return updates as ReaderData;
      
      return {
        ...prev,
        ...updates,
        source: {
          ...prev.source,
          ...updates.source
        }
      };
    });
  };

  const value = {
    readerData,
    setReaderData,
    updateReaderData
  };

  return (
    <ReaderDataContext.Provider value={value}>
      {children}
    </ReaderDataContext.Provider>
  );
};