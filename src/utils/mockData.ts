export enum RequirementStatus {
    COMPLETED = 'completed',
    IN_PROGRESS = 'in_progress',
    PENDING = 'pending',
  }
  
  export enum ConnectionType {
    POSTGRESQL = 'postgresql',
    MYSQL = 'mysql',
    ORACLE = 'oracle',
    S3 = 'aws_s3',
    GCS = 'gcs',
    BIGQUERY = 'bigquery',
  }
  
  export interface Connection {
    id: string;
    name: string;
    type: ConnectionType;
    host?: string;
    database?: string;
    bucket?: string;
  }
  
  export interface Table {
    id: string;
    connectionId: string;
    name: string;
    schema?: string;
  }
  
  export interface Column {
    id: string;
    tableId: string;
    name: string;
    dataType: string;
  }
  
  export interface HistoryEntry {
    timestamp: string;
    user: string;
    action: string;
    description: string;
  }
  
  // Add a type for mapping chat messages
  export type MappingChatMessage = { role: 'system' | 'user', text: string };
  
  // Update Requirement interface to use a typed mapping
  export interface Mapping {
    targetTable: string;
    targetColumn: string;
    targetDataType: string;
    sourceConnection: string;
    sourceTable: string;
    sourceColumns: string[];
    transformationRule: string;
    joinDetails: string;
    needsInput: boolean;
    userInput: string | null;
    chatMessages: MappingChatMessage[];
  }
  
  export interface Requirement {
    id: string;
    name: string;
    description: string;
    status: RequirementStatus;
    createdAt: string;
    updatedAt: string;
    user: string;
    targetConnection: string;
    sourceConnection: string;
    mappings: Mapping[];
    history: HistoryEntry[];
  }
  
  // Mock connections data
  export const mockConnections: Connection[] = [
    { id: 'conn1', name: 'CRM Database', type: ConnectionType.POSTGRESQL, host: 'crm-db.example.com', database: 'crm' },
    { id: 'conn2', name: 'Sales Database', type: ConnectionType.MYSQL, host: 'sales-db.example.com', database: 'sales' },
    { id: 'conn3', name: 'Inventory Database', type: ConnectionType.ORACLE, host: 'inv-db.example.com', database: 'inventory' },
    { id: 'conn4', name: 'Customer Data Lake', type: ConnectionType.S3, bucket: 'customer-data-lake' },
    { id: 'conn5', name: 'Analytics Warehouse', type: ConnectionType.BIGQUERY },
    { id: 'conn6', name: 'Marketing Data', type: ConnectionType.GCS, bucket: 'marketing-data' },
  ];
  
  // Mock tables data
  export const mockTables: Table[] = [
    { id: 'table1', connectionId: 'conn1', name: 'customers', schema: 'public' },
    { id: 'table2', connectionId: 'conn1', name: 'contacts', schema: 'public' },
    { id: 'table3', connectionId: 'conn2', name: 'orders', schema: 'sales' },
    { id: 'table4', connectionId: 'conn2', name: 'products', schema: 'sales' },
    { id: 'table5', connectionId: 'conn3', name: 'inventory', schema: 'inv' },
    { id: 'table6', connectionId: 'conn3', name: 'suppliers', schema: 'inv' },
  ];
  
  // Mock columns data
  export const mockColumns: Column[] = [
    { id: 'col1', tableId: 'table1', name: 'customer_id', dataType: 'INT' },
    { id: 'col2', tableId: 'table1', name: 'name', dataType: 'VARCHAR' },
    { id: 'col3', tableId: 'table1', name: 'email', dataType: 'VARCHAR' },
    { id: 'col4', tableId: 'table2', name: 'contact_id', dataType: 'INT' },
    { id: 'col5', tableId: 'table2', name: 'customer_id', dataType: 'INT' },
    { id: 'col6', tableId: 'table2', name: 'phone', dataType: 'VARCHAR' },
    { id: 'col7', tableId: 'table3', name: 'order_id', dataType: 'INT' },
    { id: 'col8', tableId: 'table3', name: 'customer_id', dataType: 'INT' },
    { id: 'col9', tableId: 'table3', name: 'order_date', dataType: 'DATE' },
    { id: 'col10', tableId: 'table4', name: 'product_id', dataType: 'INT' },
    { id: 'col11', tableId: 'table4', name: 'name', dataType: 'VARCHAR' },
    { id: 'col12', tableId: 'table4', name: 'price', dataType: 'DECIMAL' },
  ];
  
  // Data types for dropdown
  export const dataTypes = [
    { value: 'INT', label: 'INTEGER' },
    { value: 'VARCHAR', label: 'VARCHAR' },
    { value: 'TEXT', label: 'TEXT' },
    { value: 'DATE', label: 'DATE' },
    { value: 'TIMESTAMP', label: 'TIMESTAMP' },
    { value: 'DECIMAL', label: 'DECIMAL' },
    { value: 'BOOLEAN', label: 'BOOLEAN' },
    { value: 'FLOAT', label: 'FLOAT' },
    { value: 'DOUBLE', label: 'DOUBLE' },
    { value: 'CHAR', label: 'CHAR' },
  ];
  
  // Mock requirements data
  export const mockRequirements: Requirement[] = [
    {
      id: '1',
      name: 'Customer Dimension Pipeline',
      description: 'Pipeline to load customer data from CRM to data warehouse',
      status: RequirementStatus.COMPLETED,
      createdAt: '2025-02-15T10:30:00Z',
      updatedAt: '2025-02-16T14:20:00Z',
      user: 'Sarah Johnson',
      targetConnection: 'Analytics Warehouse',
      sourceConnection: 'CRM Database',
      mappings: [
        ...Array.from({ length: 50 }, (_, i) => {
          const fields = [
            'customer_id', 'name', 'email', 'date_of_birth', 'phone', 'address', 'city', 'state', 'zip', 'country',
            'created_at', 'updated_at', 'status', 'loyalty_points', 'segment', 'gender', 'age', 'preferred_channel',
            'last_login', 'account_manager', 'notes', 'marketing_opt_in', 'referral_code', 'customer_type', 'industry',
            'company', 'job_title', 'annual_revenue', 'lifetime_value', 'risk_score', 'churn_probability',
            'signup_source', 'preferred_language', 'timezone', 'avatar_url', 'is_active', 'is_verified', 'tier',
            'last_purchase_date', 'last_purchase_amount', 'total_orders', 'total_spent', 'avg_order_value',
            'favorite_product', 'wishlist_count', 'cart_abandon_rate', 'support_tickets', 'net_promoter_score',
            'survey_response', 'custom_field_1', 'custom_field_2', 'custom_field_3'
          ];
          const field = fields[i % fields.length];
          const mapping: Mapping = {
            targetTable: 'customers',
            targetColumn: field,
            targetDataType: i % 5 === 0 ? 'INT' : 'VARCHAR',
            sourceConnection: 'CRM Database',
            sourceTable: 'customers',
            sourceColumns: [field],
            transformationRule: 'Direct Mapping',
            joinDetails: '',
            needsInput: false,
            userInput: null,
            chatMessages: []
          };
          // Add chat history for 8 mappings
          if (i < 8) {
            mapping.needsInput = false;
            mapping.chatMessages = [
              { role: 'system', text: `How should the ${field} field be mapped?` },
              { role: 'user', text: `Map ${field} directly from source.` },
              { role: 'system', text: `Should ${field} be masked or transformed in any way?` },
              { role: 'user', text: `No masking needed for ${field}.` },
              { role: 'system', text: `Confirmed. ${field} will be mapped as is.` }
            ];
          }
          return mapping;
        })
      ],
      history: [
        {
          timestamp: '2025-02-15T10:30:00Z',
          user: 'Sarah Johnson',
          action: 'Requirement Created',
          description: 'Initial requirement created'
        },
        {
          timestamp: '2025-02-15T11:45:00Z',
          user: 'Sarah Johnson',
          action: 'Mappings Added',
          description: 'Added customer_id, name, and email mappings'
        },
        {
          timestamp: '2025-02-16T14:20:00Z',
          user: 'David Smith',
          action: 'Requirement Completed',
          description: 'Requirement validated and marked as completed'
        }
      ]
    },
    {
      id: '2',
      name: 'Sales Fact Table Pipeline',
      description: 'Pipeline to load sales data from transaction system',
      status: RequirementStatus.IN_PROGRESS,
      createdAt: '2025-02-17T09:15:00Z',
      updatedAt: '2025-02-17T16:40:00Z',
      user: 'Michael Lee',
      targetConnection: 'Analytics Warehouse',
      sourceConnection: 'Sales Database',
      mappings: [
        ...Array.from({ length: 55 }, (_, i) => {
          const fields = [
            'order_id', 'order_date', 'customer_id', 'product_id', 'quantity', 'unit_price', 'total_amount', 'discount',
            'tax', 'shipping_cost', 'payment_method', 'order_status', 'created_at', 'updated_at', 'sales_rep',
            'region', 'channel', 'promo_code', 'shipment_date', 'delivery_date', 'return_flag', 'refund_amount',
            'currency', 'exchange_rate', 'warehouse_id', 'batch_number', 'invoice_number', 'fulfillment_status',
            'gift_wrap', 'special_instructions', 'customer_notes', 'feedback_score', 'survey_response', 'net_promoter_score',
            'repeat_customer', 'first_time_buyer', 'subscription_id', 'subscription_status', 'renewal_date',
            'cancellation_date', 'last_modified_by', 'approval_status', 'approval_date', 'rejection_reason',
            'fraud_flag', 'risk_score', 'lifetime_value', 'customer_segment', 'product_category', 'product_subcategory',
            'brand', 'supplier_id', 'shipping_address', 'billing_address'
          ];
          const field = fields[i % fields.length];
          const mapping: Mapping = {
            targetTable: 'orders',
            targetColumn: field,
            targetDataType: i % 4 === 0 ? 'INT' : 'VARCHAR',
            sourceConnection: 'Sales Database',
            sourceTable: 'orders',
            sourceColumns: [field],
            transformationRule: 'Direct Mapping',
            joinDetails: '',
            needsInput: false,
            userInput: null,
            chatMessages: []
          };
          // Add chat history for 10 mappings
          if (i < 10) {
            mapping.needsInput = false;
            mapping.chatMessages = [
              { role: 'system', text: `How should the ${field} field be mapped?` },
              { role: 'user', text: `Map ${field} directly from source.` },
              { role: 'system', text: `Should ${field} be validated for data quality?` },
              { role: 'user', text: `Yes, add a check for nulls in ${field}.` },
              { role: 'system', text: `Confirmed. ${field} will be mapped with null check.` }
            ];
          }
          return mapping;
        })
      ],
      history: [
        {
          timestamp: '2025-02-17T09:15:00Z',
          user: 'Michael Lee',
          action: 'Requirement Created',
          description: 'Initial requirement created'
        },
        {
          timestamp: '2025-02-17T13:20:00Z',
          user: 'Michael Lee',
          action: 'Mappings Added',
          description: 'Added order_id and order_date mappings'
        },
        {
          timestamp: '2025-02-17T16:40:00Z',
          user: 'Sarah Johnson',
          action: 'Feedback Provided',
          description: 'Requested addition of order_date transformation'
        }
      ]
    },
    {
      id: '3',
      name: 'Product Inventory Integration',
      description: 'Pipeline to combine product data from ERP with inventory levels',
      status: RequirementStatus.PENDING,
      createdAt: '2025-02-18T14:00:00Z',
      updatedAt: '2025-02-19T11:30:00Z',
      user: 'Jennifer Wong',
      targetConnection: 'Analytics Warehouse',
      sourceConnection: 'Inventory Database',
      mappings: [
        {
          targetTable: 'inventory',
          targetColumn: 'product_id',
          targetDataType: 'INT',
          sourceConnection: 'Inventory Database',
          sourceTable: 'inventory',
          sourceColumns: ['product_id'],
          transformationRule: 'Direct Mapping',
          joinDetails: '',
          needsInput: false,
          userInput: null,
          chatMessages: []
        },
        {
          targetTable: 'inventory',
          targetColumn: 'quantity',
          targetDataType: 'INT',
          sourceConnection: 'Inventory Database',
          sourceTable: 'inventory',
          sourceColumns: ['quantity'],
          transformationRule: 'Direct Mapping',
          joinDetails: '',
          needsInput: false,
          userInput: null,
          chatMessages: []
        },
        {
          targetTable: 'inventory',
          targetColumn: 'warehouse_id',
          targetDataType: 'INT',
          sourceConnection: 'Inventory Database',
          sourceTable: 'inventory',
          sourceColumns: ['warehouse_id'],
          transformationRule: '',
          joinDetails: '',
          needsInput: true,
          userInput: null,
          chatMessages: [
            { role: 'system', text: 'What transformation should be applied to warehouse_id?' },
            { role: 'user', text: 'It should be mapped directly.' },
            { role: 'system', text: 'Please confirm if warehouse_id should be anonymized or kept as is for reporting.' }
          ]
        },
        {
          targetTable: 'inventory',
          targetColumn: 'last_updated',
          targetDataType: 'TIMESTAMP',
          sourceConnection: 'Inventory Database',
          sourceTable: 'inventory',
          sourceColumns: ['last_updated'],
          transformationRule: 'TO_TIMESTAMP(last_updated, "YYYY-MM-DD HH24:MI:SS")',
          joinDetails: '',
          needsInput: false,
          userInput: null,
          chatMessages: []
        },
        {
          targetTable: 'inventory',
          targetColumn: 'location',
          targetDataType: 'VARCHAR',
          sourceConnection: 'Inventory Database',
          sourceTable: 'inventory',
          sourceColumns: ['location'],
          transformationRule: '',
          joinDetails: '',
          needsInput: true,
          userInput: null,
          chatMessages: [
            { role: 'system', text: 'How should the location field be mapped? Should it be split into city/state?' },
            { role: 'user', text: 'Just map as is.' },
            { role: 'system', text: 'The source location contains both city and state. Please specify if you want to split or keep as a single field.' }
          ]
        },
        {
          targetTable: 'inventory',
          targetColumn: 'product_name',
          targetDataType: 'VARCHAR',
          sourceConnection: 'Inventory Database',
          sourceTable: 'products',
          sourceColumns: ['name'],
          transformationRule: 'Direct Mapping',
          joinDetails: 'JOIN products ON inventory.product_id = products.product_id',
          needsInput: false,
          userInput: null,
          chatMessages: []
        },
        {
          targetTable: 'inventory',
          targetColumn: 'category',
          targetDataType: 'VARCHAR',
          sourceConnection: 'Inventory Database',
          sourceTable: 'products',
          sourceColumns: ['category'],
          transformationRule: 'Direct Mapping',
          joinDetails: 'JOIN products ON inventory.product_id = products.product_id',
          needsInput: false,
          userInput: null,
          chatMessages: []
        },
        {
          targetTable: 'inventory',
          targetColumn: 'supplier_id',
          targetDataType: 'INT',
          sourceConnection: 'Inventory Database',
          sourceTable: 'suppliers',
          sourceColumns: ['supplier_id'],
          transformationRule: '',
          joinDetails: 'JOIN suppliers ON inventory.supplier_id = suppliers.supplier_id',
          needsInput: true,
          userInput: null,
          chatMessages: [
            { role: 'system', text: 'Should supplier_id be mapped directly or masked for privacy?' },
            { role: 'user', text: 'Map directly.' },
            { role: 'system', text: 'Supplier IDs are sensitive. Please confirm if masking is required.' }
          ]
        },
        {
          targetTable: 'inventory',
          targetColumn: 'reorder_level',
          targetDataType: 'INT',
          sourceConnection: 'Inventory Database',
          sourceTable: 'inventory',
          sourceColumns: ['reorder_level'],
          transformationRule: 'Direct Mapping',
          joinDetails: '',
          needsInput: false,
          userInput: null,
          chatMessages: []
        },
        {
          targetTable: 'inventory',
          targetColumn: 'discontinued',
          targetDataType: 'BOOLEAN',
          sourceConnection: 'Inventory Database',
          sourceTable: 'products',
          sourceColumns: ['discontinued'],
          transformationRule: 'CASE WHEN discontinued = "Y" THEN TRUE ELSE FALSE END',
          joinDetails: 'JOIN products ON inventory.product_id = products.product_id',
          needsInput: false,
          userInput: null,
          chatMessages: []
        },
        {
          targetTable: 'inventory',
          targetColumn: 'restock_date',
          targetDataType: 'DATE',
          sourceConnection: 'Inventory Database',
          sourceTable: 'inventory',
          sourceColumns: ['restock_date'],
          transformationRule: 'TO_DATE(restock_date, "YYYY-MM-DD")',
          joinDetails: '',
          needsInput: false,
          userInput: null,
          chatMessages: []
        }
      ],
      history: [
        {
          timestamp: '2025-02-18T14:00:00Z',
          user: 'Jennifer Wong',
          action: 'Requirement Created',
          description: 'Initial requirement created'
        },
        {
          timestamp: '2025-02-19T10:15:00Z',
          user: 'Jennifer Wong',
          action: 'Mapping Added',
          description: 'Added product_id and quantity mappings'
        },
        {
          timestamp: '2025-02-19T11:30:00Z',
          user: 'David Smith',
          action: 'User Input Requested',
          description: 'Need clarification on how to handle inventory levels from multiple warehouses'
        }
      ]
    }
  ];