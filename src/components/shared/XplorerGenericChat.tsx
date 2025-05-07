import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useChatMessages } from '@/hooks/useChatMessages'
import { AIChatInput } from '@/components/shared/AIChatInput'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface XplorerGenericChatUIProps {
  imageSrc?: string
}

// Mock data for orders
const mockOrders = [
  { id: 10001, customerName: 'Alice Johnson', orderDate: '2025-04-25', total: 245.99, status: 'Delivered', region: 'North' },
  { id: 10002, customerName: 'Bob Smith', orderDate: '2025-04-27', total: 89.50, status: 'Processing', region: 'South' },
  { id: 10003, customerName: 'Carol White', orderDate: '2025-04-29', total: 534.75, status: 'Shipped', region: 'East' },
  { id: 10004, customerName: 'Dave Brown', orderDate: '2025-05-01', total: 128.25, status: 'Delivered', region: 'West' },
  { id: 10005, customerName: 'Eve Green', orderDate: '2025-05-02', total: 375.00, status: 'Processing', region: 'North' },
  { id: 10006, customerName: 'Frank Black', orderDate: '2025-05-03', total: 612.40, status: 'Delivered', region: 'East' },
  { id: 10007, customerName: 'Grace Lee', orderDate: '2025-05-04', total: 92.80, status: 'Shipped', region: 'South' },
];

// Mock data for order details (items in each order)
const mockOrderDetails = [
  { orderId: 10001, productId: 1, productName: 'Laptop', quantity: 1, unitPrice: 199.99, subtotal: 199.99 },
  { orderId: 10001, productId: 2, productName: 'Mouse', quantity: 2, unitPrice: 23.00, subtotal: 46.00 },
  
  { orderId: 10002, productId: 3, productName: 'Keyboard', quantity: 1, unitPrice: 49.50, subtotal: 49.50 },
  { orderId: 10002, productId: 4, productName: 'USB Cable', quantity: 2, unitPrice: 20.00, subtotal: 40.00 },
  
  { orderId: 10003, productId: 5, productName: 'Monitor', quantity: 2, unitPrice: 249.99, subtotal: 499.98 },
  { orderId: 10003, productId: 6, productName: 'HDMI Cable', quantity: 1, unitPrice: 34.77, subtotal: 34.77 },
  
  { orderId: 10004, productId: 7, productName: 'Headphones', quantity: 1, unitPrice: 78.25, subtotal: 78.25 },
  { orderId: 10004, productId: 8, productName: 'Webcam', quantity: 1, unitPrice: 50.00, subtotal: 50.00 },
  
  { orderId: 10005, productId: 9, productName: 'Smartphone', quantity: 1, unitPrice: 375.00, subtotal: 375.00 },
  
  { orderId: 10006, productId: 10, productName: 'Tablet', quantity: 1, unitPrice: 499.99, subtotal: 499.99 },
  { orderId: 10006, productId: 11, productName: 'Screen Protector', quantity: 1, unitPrice: 12.50, subtotal: 12.50 },
  { orderId: 10006, productId: 12, productName: 'Tablet Case', quantity: 1, unitPrice: 99.91, subtotal: 99.91 },
  
  { orderId: 10007, productId: 13, productName: 'Wireless Mouse', quantity: 2, unitPrice: 34.40, subtotal: 68.80 },
  { orderId: 10007, productId: 14, productName: 'Mouse Pad', quantity: 2, unitPrice: 12.00, subtotal: 24.00 },
];

// Four query suggestions to display
const suggestions = [
  'Show me all orders above $300',
  'Find orders with delivery status "Shipped"',
  'Show me order details for Order #10003',
  'Which region has the most orders?',
];

// Mock SQL queries for different suggestions
const mockSQLQueries = {
  'Show me all orders above $300': 'SELECT * FROM orders WHERE total > 300',
  'Find orders with delivery status "Shipped"': 'SELECT * FROM orders WHERE status = "Shipped"',
  'Show me order details for Order #10003': 'SELECT od.* FROM order_details od WHERE od.orderId = 10003',
  'Which region has the most orders?': 'SELECT region, COUNT(*) as orderCount FROM orders GROUP BY region ORDER BY orderCount DESC',
};

// Component to display SQL query
const SQLView = ({ query }) => {
  return (
    <div className="rounded-lg bg-gray-800 text-white p-4 overflow-auto">
      <pre className="text-sm">{query}</pre>
    </div>
  );
};

// Component to display table view
const TableView = ({ data }) => {
    if (!data || data.length === 0) return <p>No data available</p>;
    
    // Get all column keys
    const allColumns = Object.keys(data[0]);
    
    // Apply column limits: min 2, max 3
    const displayColumns = allColumns.slice(0, Math.min(3, Math.max(2, allColumns.length)));
    
    return (
      <div className="h-full w-full rounded-lg bg-white">
        <div className="h-full overflow-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {displayColumns.map((key) => (
                  <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {displayColumns.map((key, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row[key] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

// Component to display chart view
const ChartView = ({ data, metric, categoryKey }) => {
  // If it's a region count query, format data differently
  if (Array.isArray(data) && data.length > 0 && 'region' in data[0] && 'count' in data[0]) {
    return (
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Number of Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Default chart for orders or order details
  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={categoryKey || 'id'} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={metric} fill="#8884d8" name={metric.charAt(0).toUpperCase() + metric.slice(1)} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export function XplorerGenericChatUI({ imageSrc }: XplorerGenericChatUIProps) {
  const { messages, addUserMessage, addAssistantMessage } = useChatMessages();
  const [mockResponse, setMockResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('table');
  const [input, setInput] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [metricToVisualize, setMetricToVisualize] = useState('total');
  const [categoryKey, setCategoryKey] = useState('id');

  // Handle sending a message
  const handleSend = async (message: string) => {
    if (!message.trim()) return;
    
    addUserMessage(message);
    
    // Process the message to determine what data to show
    let responseData = [];
    let query = '';
    let metric = 'total'; // Default metric to visualize
    let category = 'id';
    let responseText = '';
    
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('above $300') || lowerMsg.includes('over $300')) {
      responseData = mockOrders.filter(order => order.total > 300);
      query = mockSQLQueries['Show me all orders above $300'];
      responseText = `I found ${responseData.length} orders with totals exceeding $300.`;
    } 
    else if (lowerMsg.includes('shipped')) {
      responseData = mockOrders.filter(order => order.status === 'Shipped');
      query = mockSQLQueries['Find orders with delivery status "Shipped"'];
      responseText = `I found ${responseData.length} orders with shipping status "Shipped".`;
    } 
    else if (lowerMsg.includes('order details') && lowerMsg.includes('10003')) {
      responseData = mockOrderDetails.filter(detail => detail.orderId === 10003);
      query = mockSQLQueries['Show me order details for Order #10003'];
      metric = 'subtotal';
      category = 'productName';
      responseText = `Here are the details for Order #10003. This order has ${responseData.length} items.`;
    } 
    else if (lowerMsg.includes('region') && (lowerMsg.includes('most') || lowerMsg.includes('highest'))) {
      // Count orders by region
      const regionCounts = {};
      mockOrders.forEach(order => {
        regionCounts[order.region] = (regionCounts[order.region] || 0) + 1;
      });
      
      responseData = Object.entries(regionCounts).map(([region, count]) => ({
        region,
        count
      })).sort((a, b) => Number(b.count) - Number(a.count));
      
      query = mockSQLQueries['Which region has the most orders?'];
      metric = 'count';
      category = 'region';
      
      responseText = `The ${responseData[0].region} region has the most orders with ${responseData[0].count} orders.`;
    }
    else if (lowerMsg.includes('order details')) {
      // Extract order number if provided
      const orderIdMatch = lowerMsg.match(/\d+/);
      const orderId = orderIdMatch ? parseInt(orderIdMatch[0]) : null;
      
      if (orderId && mockOrderDetails.some(detail => detail.orderId === orderId)) {
        responseData = mockOrderDetails.filter(detail => detail.orderId === orderId);
        query = `SELECT * FROM order_details WHERE orderId = ${orderId}`;
        metric = 'subtotal';
        category = 'productName';
        responseText = `Here are the details for Order #${orderId}. This order has ${responseData.length} items.`;
      } else {
        // Show all order details if no specific order ID was provided or found
        responseData = mockOrderDetails;
        query = 'SELECT * FROM order_details';
        metric = 'subtotal';
        category = 'productName';
        responseText = `Here are all order details across all orders. There are ${responseData.length} items in total.`;
      }
    }
    else {
      // Default to showing all orders
      responseData = mockOrders;
      query = 'SELECT * FROM orders';
      responseText = `Here are all orders in the system. There are ${responseData.length} orders in total.`;
    }

    // Set the response data and SQL query
    setFilteredData(responseData);
    setSqlQuery(query);
    setMetricToVisualize(metric);
    setCategoryKey(category);
    
    // Add assistant response
    setTimeout(() => {
      addAssistantMessage(responseText);
      setMockResponse({
        data: responseData,
        query: query
      });
    }, 500);
    
    // Clear input
    setInput('');
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Message Area */}
      <div className="flex-1 mt-4 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            {imageSrc && (
              <img src={imageSrc} alt="AI logo" className="w-12 h-12 mb-4" />
            )}

            {/* Initial Query Suggestions */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => setInput(sug)}
                  className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 text-sm"
                >
                  {sug}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-600">How can I help with your order data today?</p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <Avatar className="h-8 w-8 flex items-center justify-center bg-[#009f59]">
                      <AvatarImage
                        src={imageSrc}
                        className="w-3.5 h-5 transform -rotate-[40deg]"
                        style={{ objectFit: 'contain' }}
                      />
                      <AvatarFallback className="text-white">AI</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#009f59] text-white">U</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 max-w-[80%] relative whitespace-pre-wrap break-words',
                      message.role === 'assistant'
                        ? 'bg-gray-100 text-black before:absolute before:left-[-6px] before:top-3 before:border-4 before:border-transparent before:border-r-gray-100'
                        : 'bg-blue-100 text-blue-900 before:absolute before:right-[-6px] before:top-3 before:border-4 before:border-transparent before:border-l-blue-100'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {/* Mock response tabs */}
              {mockResponse && (
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value)}
                  className="mt-6"
                >
                  <TabsList className="flex space-x-2 border-b">
                    <TabsTrigger value="table" className="px-4 py-2">Table</TabsTrigger>
                    <TabsTrigger value="chart" className="px-4 py-2">Chart</TabsTrigger>
                    <TabsTrigger value="sql" className="px-4 py-2">SQL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="table" className="pt-4">
                    <TableView data={filteredData} />
                  </TabsContent>
                  <TabsContent value="chart" className="pt-4">
                    <ChartView data={filteredData} metric={metricToVisualize} categoryKey={categoryKey} />
                  </TabsContent>
                  <TabsContent value="sql" className="pt-4">
                    <SQLView query={sqlQuery} />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2 mt-4 flex-shrink-0">
        <AIChatInput
          input={input}
          onChange={setInput}
          onSend={() => handleSend(input)}
        />
      </div>
    </div>
  );
}