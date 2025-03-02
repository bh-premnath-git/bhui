export interface TableMetadata {
  name: string;
  description: string;
  columns: {
    name: string;
    type: string;
    description: string;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    references?: string;
  }[];
}

export const fetchTableMetadata = async (tableName: string): Promise<TableMetadata | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Example metadata for a few tables
  const tables: Record<string, TableMetadata> = {
    'sales': {
      name: 'sales',
      description: 'Daily sales transactions by brand and product',
      columns: [
        { name: 'date', type: 'date', description: 'Transaction date' },
        { name: 'brand', type: 'string', description: 'Product brand name' },
        { name: 'product_id', type: 'integer', description: 'Unique product identifier', isForeignKey: true, references: 'products.id' },
        { name: 'quantity', type: 'integer', description: 'Number of units sold' },
        { name: 'revenue', type: 'decimal', description: 'Total revenue from sale' },
      ]
    },
    'customers': {
      name: 'customers',
      description: 'Customer information and demographics',
      columns: [
        { name: 'id', type: 'integer', description: 'Unique customer identifier', isPrimaryKey: true },
        { name: 'name', type: 'string', description: 'Customer name' },
        { name: 'email', type: 'string', description: 'Customer email address' },
        { name: 'signup_date', type: 'date', description: 'Date customer created account' },
        { name: 'region', type: 'string', description: 'Geographic region' },
      ]
    }
  };
  
  return tables[tableName] || null;
}; 