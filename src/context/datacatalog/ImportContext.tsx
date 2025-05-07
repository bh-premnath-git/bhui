import React, { createContext, useContext, useState } from 'react';

export type DatabaseConfig = {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
};

export type TableSchema = {
  name: string;
  columns: string[];
};

type ImportContextType = {
  step: number;
  setStep: (step: number) => void;
  databaseConfig: DatabaseConfig;
  setDatabaseConfig: (config: DatabaseConfig) => void;
  selectedSchema: string;
  setSelectedSchema: (schema: string) => void;
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  tableData: any[];
  setTableData: (data: any[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  schemas: string[];
  setSchemas: (schemas: string[]) => void;
  tables: TableSchema[];
  setTables: (tables: TableSchema[]) => void;
};

const ImportContext = createContext<ImportContextType | undefined>(undefined);

export function ImportProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);
  const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig>({
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
  });
  const [selectedSchema, setSelectedSchema] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [schemas, setSchemas] = useState<string[]>([]);
  const [tables, setTables] = useState<TableSchema[]>([]);

  return (
    <ImportContext.Provider
      value={{
        step,
        setStep,
        databaseConfig,
        setDatabaseConfig,
        selectedSchema,
        setSelectedSchema,
        selectedTable,
        setSelectedTable,
        tableData,
        setTableData,
        isLoading,
        setIsLoading,
        schemas,
        setSchemas,
        tables,
        setTables,
      }}
    >
      {children}
    </ImportContext.Provider>
  );
}

export function useImport() {
  const context = useContext(ImportContext);
  if (context === undefined) {
    throw new Error('useImport must be used within an ImportProvider');
  }
  return context;
}