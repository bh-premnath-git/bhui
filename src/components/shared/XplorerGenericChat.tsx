import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatMessages } from '@/hooks/useChatMessages'
import { AIChatInput } from '@/components/shared/AIChatInput'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'
import { motion } from 'framer-motion'

interface XplorerGenericChatUIProps {
  imageSrc?: string
  assistantColor?: string
  userColor?: string
  suggestions?: string[]
}

// Updated default suggestions to include the top 10 expensive products query
const defaultSuggestions = [
  'List the top ten expensive products',
  'Show me all orders above $300',
  'Find orders with delivery status "Shipped"',
  'Which region has the most orders?',
]

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

// New mock data for top 10 expensive products
const topExpensiveProducts = [
  { productName: "Côte de Blaye", unitPrice: 263.50 },
  { productName: "Thüringer Rostbratwurst", unitPrice: 123.79 },
  { productName: "Mishi Kobe Niku", unitPrice: 97.00 },
  { productName: "Sir Rodney's Marmalade", unitPrice: 81.00 },
  { productName: "Carnarvon Tigers", unitPrice: 62.50 },
  { productName: "Raclette Courdavault", unitPrice: 55.00 },
  { productName: "Manjimup Dried Apples", unitPrice: 53.00 },
  { productName: "Tarte au sucre", unitPrice: 49.30 }
];

// Mock SQL queries for different suggestions
const mockSQLQueries = {
  'List the top ten expensive products': 'SELECT p.product_name AS product_name, p.unit_price FROM public.products AS p ORDER BY p.unit_price DESC LIMIT 10;',
  'Show me all orders above $300': 'SELECT * FROM orders WHERE total > 300',
  'Find orders with delivery status "Shipped"': 'SELECT * FROM orders WHERE status = "Shipped"',
  'Show me order details for Order #10003': 'SELECT od.* FROM order_details od WHERE od.orderId = 10003',
  'Which region has the most orders?': 'SELECT region, COUNT(*) as orderCount FROM orders GROUP BY region ORDER BY orderCount DESC',
};

// Component to display SQL query
const SQLView = ({ query }) => {
  return (
    <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
      {query}
    </pre>
  );
};

// Component to display table view
const TableView = ({ data }) => {
  if (!data || data.length === 0) return <p>No data available</p>;

  // Get all column keys
  const allColumns = Object.keys(data[0]);

  return (
    <div className="h-full w-full rounded-lg bg-white">
      <div className="h-full overflow-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {allColumns.map((key) => (
                <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {allColumns.map((key, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row[key]}
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

// Enhanced chart view component with title and better axis labels
const ChartView = ({ data, metric, categoryKey, chartTitle }) => {
  // If it's products data, format specifically for that
  if (Array.isArray(data) && data.length > 0 && 'productName' in data[0] && 'unitPrice' in data[0]) {
    return (
      <div className="h-96 bg-gradient-to-br from-card to-card/95 overflow-hidden">
        <h3 className="text-center text-sm mb-2">{chartTitle || "Top 10 Most Expensive Products"}</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis
              type="number"
            />
            <YAxis
              dataKey="productName"
              type="category"
              width={100}
              label={{ value: 'Product Name', angle: -90, position: 'insideLeft', offset: -30 }}
            />
            <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
            <Legend />
            <Bar dataKey="unitPrice" fill="#A7D1F0" name="Unit Price ($)">
              <LabelList dataKey="unitPrice" position="right" formatter={(value) => `$${value}`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // If it's a region count query, format data differently
  if (Array.isArray(data) && data.length > 0 && 'region' in data[0] && 'count' in data[0]) {
    return (
      <div className="h-96 bg-gradient-to-br from-card to-card/95 overflow-hidden">
        <h3 className="text-center text-lg font-semibold mb-2">{chartTitle || "Orders by Region"}</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" label={{ value: 'Region', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Number of Orders', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#A7D1F0" name="Number of Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default chart for orders or order details
  return (
    <div className="h-96">
      <h3 className="text-center text-lg font-semibold mb-2">{chartTitle || "Data Visualization"}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={categoryKey || 'id'}
            label={{ value: categoryKey || 'ID', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: metric.charAt(0).toUpperCase() + metric.slice(1), angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey={metric} fill="#A7D1F0" name={metric.charAt(0).toUpperCase() + metric.slice(1)} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export function XplorerGenericChatUI({ imageSrc, assistantColor = '#009459',
  userColor = '#000000', suggestions = defaultSuggestions }: XplorerGenericChatUIProps) {
  const { messages, addUserMessage, addAssistantMessage } = useChatMessages();
  const [mockResponse, setMockResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('chart');
  const [input, setInput] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [metricToVisualize, setMetricToVisualize] = useState('total');
  const [categoryKey, setCategoryKey] = useState('id');
  const [chartTitle, setChartTitle] = useState('');

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
    let title = '';

    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('top ten expensive') || lowerMsg.includes('top 10 expensive') || lowerMsg.includes('expensive products')) {
      responseData = topExpensiveProducts;
      query = mockSQLQueries['List the top ten expensive products'];
      metric = 'unitPrice';
      category = 'productName';
      title = 'Top 10 Most Expensive Products';
      responseText = `Here are the top 10 most expensive products in our inventory, sorted by unit price.`;
    }
    else if (lowerMsg.includes('above $300') || lowerMsg.includes('over $300')) {
      responseData = mockOrders.filter(order => order.total > 300);
      query = mockSQLQueries['Show me all orders above $300'];
      title = 'Orders Exceeding $300';
      responseText = `I found ${responseData.length} orders with totals exceeding $300.`;
    }
    else if (lowerMsg.includes('shipped')) {
      responseData = mockOrders.filter(order => order.status === 'Shipped');
      query = mockSQLQueries['Find orders with delivery status "Shipped"'];
      title = 'Orders with Shipped Status';
      responseText = `I found ${responseData.length} orders with shipping status "Shipped".`;
    }
    else if (lowerMsg.includes('order details') && lowerMsg.includes('10003')) {
      responseData = mockOrderDetails.filter(detail => detail.orderId === 10003);
      query = mockSQLQueries['Show me order details for Order #10003'];
      metric = 'subtotal';
      category = 'productName';
      title = 'Order #10003 Details';
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
      title = 'Orders by Region';

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
        title = `Order #${orderId} Details`;
        responseText = `Here are the details for Order #${orderId}. This order has ${responseData.length} items.`;
      } else {
        // Show all order details if no specific order ID was provided or found
        responseData = mockOrderDetails;
        query = 'SELECT * FROM order_details';
        metric = 'subtotal';
        category = 'productName';
        title = 'All Order Details';
        responseText = `Here are all order details across all orders. There are ${responseData.length} items in total.`;
      }
    }
    else {
      // Default to showing all orders
      responseData = mockOrders;
      query = 'SELECT * FROM orders';
      title = 'All Orders';
      responseText = `Here are all orders in the system. There are ${responseData.length} orders in total.`;
    }

    // Set the response data and SQL query
    setFilteredData(responseData);
    setSqlQuery(query);
    setMetricToVisualize(metric);
    setCategoryKey(category);
    setChartTitle(title);

    // Add assistant response
    setTimeout(() => {
      addAssistantMessage(responseText);
      setMockResponse({
        data: responseData,
        query: query,
        title: title
      });
    }, 500);

    // Clear input
    setInput('');
  };

  return (
    <div className="h-full w-full flex flex-col">
      <ScrollArea className="flex-1 w-full">
        <div className="px-2 py-4 w-full max-w-md mx-auto">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <p className="text-lg font-medium text-gray-800 mb-4">How can I assist you?</p>
              <div className="space-y-3">
                {suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <div
                      className="w-8 h-8 rounded-full mt-1"
                      style={{ backgroundColor: assistantColor }}
                    />
                    <div
                      onClick={() => setInput(s)}
                      className="flex-1 rounded-2xl bg-gray-100 border border-border/40 px-4 py-3 text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {s}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((m, i) => {
                const isA = m.role === 'assistant';
                return (
                  <div key={i} className="flex items-start gap-4 py-2">
                    <div
                      className="w-8 h-8 rounded-full mt-1"
                      style={{ backgroundColor: isA ? assistantColor : userColor }}
                    />
                    <div
                      className={`flex-1 rounded-2xl px-2 py-3 shadow ${
                        isA ? 'bg-gray-100 text-black' : 'bg-gradient-to-r from-white to-slate-50'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                );
              })}
              {mockResponse && (
                <>
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value)}
                    className="mt-6"
                  >
                    <TabsList className="flex space-x-2 mb-2">
                      <TabsTrigger
                        value="chart"
                        className={`px-4 py-2 rounded-t-lg ${
                          activeTab === 'chart'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-white text-gray-500'
                        }`}
                      >
                        Chart
                      </TabsTrigger>
                      <TabsTrigger
                        value="table"
                        className={`px-4 py-2 rounded-t-lg ${
                          activeTab === 'table'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-white text-gray-500'
                        }`}
                      >
                        Table
                      </TabsTrigger>
                      <TabsTrigger
                        value="sql"
                        className={`px-2 py-2 rounded-t-lg ${
                          activeTab === 'sql'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-white text-gray-500'
                        }`}
                      >
                        SQL
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="chart" className="pt-4">
                    <ChartView
                      data={filteredData}
                      metric={metricToVisualize}
                      categoryKey={categoryKey}
                      chartTitle={chartTitle}
                    />
                  </TabsContent>
                  <TabsContent value="table" className="pt-4">
                    <TableView data={filteredData} />
                  </TabsContent>
                  <TabsContent value="sql" className="pt-4">
                    <SQLView query={sqlQuery} />
                  </TabsContent>
                  </Tabs>
                  <div className="flex items-start gap-4 mt-4">
                    <div
                      className="w-8 h-8 rounded-full mt-1"
                      style={{ backgroundColor: assistantColor }}
                    />
                    <div className="flex-1 rounded-2xl bg-gray-100 px-4 py-3 shadow">
                      <p className="leading-relaxed text-black">
                        Do you want me to analyze the reasons for the latency issue?
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-slate-200 bg-white">
        <AIChatInput input={input} onChange={setInput} onSend={() => handleSend(input)} placeholder="Type a message..." />
      </div>
    </div>
  );
}