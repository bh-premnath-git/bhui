import {  DashboardData, DatabaseConnection, ChatSession } from "@/types/dataops/data-ops-hub.d";

export const fetchDatabaseConnections = async (): Promise<DatabaseConnection[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    { id: "postgres-prod", name: "PostgreSQL (Production)", type: "postgres" },
    { id: "snowflake-dw", name: "Snowflake Data Warehouse", type: "snowflake" },
    { id: "bigquery-analytics", name: "BigQuery Analytics", type: "bigquery" },
    { id: "mysql-app", name: "MySQL App Database", type: "mysql" }
  ];
};

export const fetchChatHistory = async (): Promise<ChatSession[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    { 
      id: "recent-1", 
      title: "Sales analysis by region", 
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      connection: "snowflake-dw",
      messages: [
        { role: "user", content: "Show me sales by region" },
        { role: "assistant", content: "I've analyzed your request about: Show me sales by region" }
      ],
      lastQuestion: "Show me sales by region"
    },
    { 
      id: "recent-2", 
      title: "Customer retention metrics", 
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      connection: "bigquery-analytics",
      messages: [
        { role: "user", content: "What's our customer retention rate?" },
        { role: "assistant", content: "I've analyzed your request about: What's our customer retention rate?" }
      ],
      lastQuestion: "What's our customer retention rate?"
    },
    {
      id: "recent-3",
      title: "Product usage analytics",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      connection: "bigquery-analytics",
      messages: [
        { role: "user", content: "How has our product usage changed over time?" },
        { role: "assistant", content: "I've analyzed your request about: How has our product usage changed over time?" }
      ],
      lastQuestion: "How has our product usage changed over time?"
    }
  ];
};

export const saveChatSession = async (session: Partial<ChatSession>): Promise<ChatSession> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const id = session.id || `session-${Date.now()}`;
  
  return {
    id,
    title: session.title || "Untitled Chat",
    timestamp: new Date().toISOString(),
    connection: session.connection || "bigquery-analytics",
    messages: session.messages || [],
    lastQuestion: session.lastQuestion || ""
  };
};


export interface ConversationContext {
  recentQuestions: string[];
  recentTables: string[];
  recentMetrics: string[];
  currentConnection: string;
  currentTopic?: string;
  relatedEntities?: string[];
  analysisHistory?: Array<{
    question: string;
    result: string;
    timestamp: number;
  }>;
}

let conversationContext: ConversationContext = {
  recentQuestions: [],
  recentTables: [],
  recentMetrics: [],
  currentConnection: "snowflake-dw",
  currentTopic: undefined,
  relatedEntities: [],
  analysisHistory: []
};

export const determineConversationTopic = (question: string): string => {
  if (question.toLowerCase().includes('sales')) return 'sales';
  if (question.toLowerCase().includes('customer')) return 'customers';
  if (question.toLowerCase().includes('product')) return 'products';
  if (question.toLowerCase().includes('region') || question.toLowerCase().includes('location')) return 'geography';
  if (question.toLowerCase().includes('time') || question.toLowerCase().includes('trend')) return 'time analysis';
  return 'general';
};

export const updateConversationContext = (
  partialContext: Partial<ConversationContext>,
  question?: string
): ConversationContext => {
  if (question) {
    const topic = determineConversationTopic(question);
    partialContext.currentTopic = topic;
    
    if (!partialContext.analysisHistory) {
      partialContext.analysisHistory = [];
    }
    
    partialContext.analysisHistory.push({
      question,
      result: 'analyzed',
      timestamp: Date.now()
    });
  }
  
  conversationContext = {
    ...conversationContext,
    ...partialContext
  };
  
  if (conversationContext.recentQuestions.length > 5) {
    conversationContext.recentQuestions = conversationContext.recentQuestions.slice(-5);
  }
  
  return {...conversationContext};
};


export const fetchDashboardData = async (question: string, useContext = true): Promise<DashboardData | null> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (useContext) {
    updateConversationContext({
      currentTopic: question,
      recentQuestions: [...conversationContext.recentQuestions, question].slice(-5)
    });
  }
  
  const isFollowUp = useContext && 
    (question.toLowerCase().includes("why") || 
     question.toLowerCase().includes("explain") || 
     question.toLowerCase().includes("compare") ||
     question.toLowerCase().includes("tell me more"));
  
  if (isFollowUp && conversationContext.recentQuestions.length > 1) {
    const prevQuestion = conversationContext.recentQuestions[conversationContext.recentQuestions.length - 2];
    
    if (question.toLowerCase().includes("why")) {
      return {
        title: "Detailed Analysis:",
        description: "An in-depth look at the data you requested",
        timeRange: "Current Quarter",
        brands: ["Category A", "Category B", "Category C"],
        recommendedChartType: "bar",
        metrics: [
          {
            brand: "Overall",
            value: 285000,
            trend: "+5.2%",
            status: "increase"
          }
        ],
        salesData: [
          {
            date: "Jan",
            "Category A": 95000,
            "Category B": 85000,
            "Category C": 0
          },
          {
            date: "Feb",
            "Category A": 92000,
            "Category B": 88000,
            "Category C": 0
          },
          {
            date: "Mar",
            "Category A": 98000,
            "Category B": 90000,
            "Category C": 0
          }
        ],
        explanation: [
          "Here's a more detailed analysis of your query:",
          "The trend shows a consistent pattern of growth over the analyzed period.",
          "Key factors influencing this trend include seasonal variations and market conditions.",
          "When breaking down by demographic segments, we see the strongest performance in the 25-34 age group.",
          "Geographical distribution shows concentration in urban centers, with particular strength in coastal regions."
        ],
        sqlQuery: generateSQLQuery(question)
      };
    }
    
    if (question.toLowerCase().includes("compare")) {
      return generateComparisonData(prevQuestion, question);
    }
  }
  
  return processStandardQuestion(question);
};

const processStandardQuestion = (question: string): DashboardData | null => {
  
  if (question === "Show me sales by region") {
    return {
      title: "Sales by Geographic Region",
      description: "Regional sales breakdown for the current quarter",
      timeRange: "Q1 2023",
      brands: ["North America", "Europe", "Asia", "Latin America", "Africa"],
      recommendedChartType: "bar",
      metrics: [
        {
          brand: "North America",
          value: 425000,
          trend: "+8.2%",
          status: "increase"
        },
        {
          brand: "Europe",
          value: 352000,
          trend: "+5.7%",
          status: "increase"
        },
        {
          brand: "Asia",
          value: 312000,
          trend: "+12.3%",
          status: "increase"
        },
        {
          brand: "Latin America",
          value: 185000,
          trend: "+3.8%",
          status: "increase"
        },
        {
          brand: "Africa",
          value: 97000,
          trend: "+15.2%",
          status: "increase"
        }
      ],
      salesData: [
        {
          date: "Jan",
          "North America": 135000,
          "Europe": 112000,
          "Asia": 95000,
          "Latin America": 58000,
          "Africa": 28000
        },
        {
          date: "Feb",
          "North America": 142000,
          "Europe": 118000,
          "Asia": 102000,
          "Latin America": 62000,
          "Africa": 32000
        },
        {
          date: "Mar",
          "North America": 148000,
          "Europe": 122000,
          "Asia": 115000,
          "Latin America": 65000,
          "Africa": 37000
        }
      ],
      explanation: [
        "North America remains our strongest market with $425,000 in sales this quarter, showing steady growth of 8.2%.",
        "Asia is our fastest-growing region with a 12.3% increase, driven by expansion in emerging markets.",
        "Africa, while still our smallest market, shows the highest growth rate at 15.2%, indicating significant potential for future expansion.",
        "All regions are showing positive growth trends, with the company's overall regional sales increasing by 9.1% compared to the previous quarter."
      ],
      sqlQuery: generateSQLQuery(question)
    };
  }
  
  if (question === "What's our customer retention rate?") {
    return {
      title: "Customer Retention Analysis",
      description: "Customer retention metrics over the past year",
      timeRange: "Last 12 months",
      brands: ["New Customers", "Returning Customers", "Churned Customers"],
      recommendedChartType: "area",
      metrics: [
        {
          brand: "Retention Rate",
          value: 78,
          trend: "+3.5%",
          status: "increase"
        },
        {
          brand: "Churn Rate",
          value: 22,
          trend: "-3.5%",
          status: "decrease"
        },
        {
          brand: "Customer Lifetime",
          value: 36,
          trend: "+2.8%",
          status: "increase"
        }
      ],
      salesData: [
        {
          date: "Q2 2022",
          "New Customers": 2500,
          "Returning Customers": 8200,
          "Churned Customers": 1950
        },
        {
          date: "Q3 2022",
          "New Customers": 2650,
          "Returning Customers": 8400,
          "Churned Customers": 1850
        },
        {
          date: "Q4 2022",
          "New Customers": 3100,
          "Returning Customers": 8750,
          "Churned Customers": 1800
        },
        {
          date: "Q1 2023",
          "New Customers": 2900,
          "Returning Customers": 9200,
          "Churned Customers": 1650
        }
      ],
      explanation: [
        "Our overall customer retention rate has improved to 78%, representing a 3.5% increase over the past year.",
        "The churn rate has correspondingly decreased to 22%, with the most significant improvements in the enterprise segment.",
        "Average customer lifetime has increased to 36 months, indicating stronger long-term customer relationships.",
        "The Q4 2022 - Q1 2023 period shows the most substantial improvement, likely due to the loyalty program introduced in November."
      ],
      sqlQuery: generateSQLQuery(question)
    };
  }

  if (question.toLowerCase().includes("question1") || question.toLowerCase().includes("employee")) {
    return {
      title: "Employee Performance by Department",
      description: "How are our employees performing across departments?",
      timeRange: "Last Quarter",
      brands: ["HR", "Engineering", "Marketing", "Sales", "Support"],
      recommendedChartType: "bar",
      metrics: [
        {
          brand: "HR",
          value: 87,
          trend: "+3.2%",
          status: "increase"
        },
        {
          brand: "Engineering",
          value: 92,
          trend: "+5.7%",
          status: "increase"
        },
        {
          brand: "Marketing",
          value: 78,
          trend: "-2.1%",
          status: "decrease"
        },
        {
          brand: "Sales",
          value: 85,
          trend: "+1.8%",
          status: "increase"
        },
        {
          brand: "Support",
          value: 81,
          trend: "+0.5%",
          status: "increase"
        }
      ],
      salesData: [
        {
          date: "Jan",
          HR: 82,
          Engineering: 88,
          Marketing: 79,
          Sales: 83,
          Support: 80,
        },
        {
          date: "Feb",
          HR: 84,
          Engineering: 90,
          Marketing: 76,
          Sales: 84,
          Support: 79,
        },
        {
          date: "Mar",
          HR: 87,
          Engineering: 92,
          Marketing: 78,
          Sales: 85,
          Support: 81,
        }
      ],
      explanation: [
        "Employee performance data shows Engineering consistently leading with the highest performance scores, averaging 90 points over the last quarter.",
        "Marketing shows a concerning downward trend of -2.1%, which may require attention to team dynamics or workload distribution.",
        "HR and Sales both show steady improvement, with HR showing a stronger growth trajectory at +3.2%.",
        "Overall, most departments are showing positive performance trends, with the company average increasing by 1.8% over the quarter."
      ],
      sqlQuery: generateSQLQuery(question)
    };
  }
  
  else if (question.toLowerCase().includes("question2") || question.toLowerCase().includes("sales")) {
    return {
      title: "Revenue Distribution by Product Category",
      description: "How is our revenue distributed across product categories?",
      timeRange: "Current Year",
      brands: ["Electronics", "Clothing", "Home Goods", "Groceries", "Beauty"],
      recommendedChartType: "pie",
      metrics: [
        {
          brand: "Electronics",
          value: 4250000,
          trend: "+12.5%",
          status: "increase"
        },
        {
          brand: "Clothing",
          value: 3180000,
          trend: "+8.3%",
          status: "increase"
        },
        {
          brand: "Home Goods",
          value: 2750000,
          trend: "+5.2%",
          status: "increase"
        },
        {
          brand: "Groceries",
          value: 1920000,
          trend: "-3.1%",
          status: "decrease"
        },
        {
          brand: "Beauty",
          value: 1450000,
          trend: "+15.7%",
          status: "increase"
        }
      ],
      salesData: [
        {
          category: "Electronics",
          value: 4250000
        },
        {
          category: "Clothing",
          value: 3180000
        },
        {
          category: "Home Goods",
          value: 2750000
        },
        {
          category: "Groceries",
          value: 1920000
        },
        {
          category: "Beauty",
          value: 1450000
        }
      ],
      explanation: [
        "Electronics is our highest revenue category, accounting for 31% of total sales with $4.25M in revenue.",
        "Beauty products show the strongest growth at +15.7%, suggesting increasing consumer interest in this category.",
        "Groceries is the only category showing a decline (-3.1%), which may be due to increased competition in this space.",
        "The top three categories (Electronics, Clothing, and Home Goods) account for over 75% of our total revenue."
      ],
      sqlQuery: generateSQLQuery(question)
    };
  }
  
  else if (question.toLowerCase().includes("question3") || question.toLowerCase().includes("product")) {
    return {
      title: "Product Usage Trends Over Time",
      description: "How has our product usage changed over the past year?",
      timeRange: "Last 12 Months",
      brands: ["Mobile App", "Web Platform", "Desktop Client", "API Usage"],
      recommendedChartType: "area",
      metrics: [
        {
          brand: "Mobile App",
          value: 1250000,
          trend: "+32.5%",
          status: "increase"
        },
        {
          brand: "Web Platform",
          value: 980000,
          trend: "+18.3%",
          status: "increase"
        },
        {
          brand: "Desktop Client",
          value: 420000,
          trend: "-15.2%",
          status: "decrease"
        },
        {
          brand: "API Usage",
          value: 1750000,
          trend: "+45.7%",
          status: "increase"
        }
      ],
      salesData: [
        {
          date: "Jan",
          "Mobile App": 850000,
          "Web Platform": 780000,
          "Desktop Client": 520000,
          "API Usage": 1100000
        },
        {
          date: "Apr",
          "Mobile App": 950000,
          "Web Platform": 820000,
          "Desktop Client": 480000,
          "API Usage": 1300000
        },
        {
          date: "Jul",
          "Mobile App": 1100000,
          "Web Platform": 900000,
          "Desktop Client": 450000,
          "API Usage": 1500000
        },
        {
          date: "Oct",
          "Mobile App": 1250000,
          "Web Platform": 980000,
          "Desktop Client": 420000,
          "API Usage": 1750000
        }
      ],
      explanation: [
        "API Usage has seen the most dramatic growth at +45.7%, indicating strong adoption by developers and integration partners.",
        "Mobile App usage has grown significantly (+32.5%), reflecting the ongoing shift to mobile-first user behavior.",
        "Desktop Client usage continues to decline (-15.2%), as users migrate to web and mobile platforms.",
        "Overall, total product usage across all platforms has increased by 27.8% over the past year, with the strongest growth in the last quarter."
      ],
      sqlQuery: generateSQLQuery(question)
    };
  }
  
  else if (question.toLowerCase().includes("question4")) {
    return null;
  }
  
  else {
    return {
      title: "Daily Sales by Brand",
      description: "What were our daily sales for each brand?",
      timeRange: "Last 7 days",
      brands: ["Dole", "Frieda's", "Goya", "Chiquita"],
      recommendedChartType: "line",
      metrics: [
        {
          brand: "Dole",
          value: 12100,
          trend: "+5.2%",
          status: "increase"
        },
        {
          brand: "Frieda's",
          value: 8510,
          trend: "-2.1%",
          status: "decrease"
        },
        {
          brand: "Goya",
          value: 8112,
          trend: "+1.8%",
          status: "increase"
        },
        {
          brand: "Chiquita",
          value: 7472,
          trend: "+0.5%",
          status: "increase"
        }
      ],
      salesData: [
        {
          date: "Jan 25",
          Dole: 12100,
          "Frieda's": 8510,
          Goya: 8112,
          Chiquita: 7472,
        },
        {
          date: "Jan 26",
          Dole: 10500,
          "Frieda's": 7900,
          Goya: 7600,
          Chiquita: 6900,
        },
        {
          date: "Jan 27",
          Dole: 11200,
          "Frieda's": 8200,
          Goya: 7800,
          Chiquita: 7100,
        },
        {
          date: "Jan 28",
          Dole: 9800,
          "Frieda's": 7600,
          Goya: 7200,
          Chiquita: 6600,
        },
        {
          date: "Jan 29",
          Dole: 13500,
          "Frieda's": 9100,
          Goya: 8500,
          Chiquita: 7800,
        },
      ],
      explanation: [
        "Based on the daily sales data for the last 7 days, Dole consistently outperforms other brands with the highest sales figures, averaging $11,420 per day.",
        "Frieda's shows a concerning downward trend of -2.1%, which may require attention to marketing or distribution strategies for this brand.",
        "Goya and Chiquita both show modest growth, with Goya performing slightly better at +1.8% compared to Chiquita's +0.5%.",
        "The highest sales day for all brands was January 29th, suggesting a potential weekly pattern where sales peak towards the end of the week."
      ],
      sqlQuery: generateSQLQuery(question)
    };
  }
};

const generateComparisonData = (
  prevQuestion: string, 
  currentQuestion: string
): DashboardData => {
  return {
    title: `Comparison Analysis: ${currentQuestion}`,
    description: `Comparing data based on your questions about "${prevQuestion}" and "${currentQuestion}"`,
    timeRange: "Current Quarter",
    brands: ["Previous Query", "Current Query"],
    recommendedChartType: "bar",
    metrics: [
      {
        brand: "Previous Query",
        value: 285000,
        trend: "baseline",
        status: "stable"
      },
      {
        brand: "Current Query",
        value: 325000,
        trend: "+14.0%",
        status: "increase"
      }
    ],
    salesData: [
      {
        date: "Jan",
        "Previous Query": 95000,
        "Current Query": 108000
      },
      {
        date: "Feb",
        "Previous Query": 92000,
        "Current Query": 105000
      },
      {
        date: "Mar",
        "Previous Query": 98000,
        "Current Query": 112000
      }
    ],
    explanation: [
      `This comparison shows the relationship between your questions about "${prevQuestion}" and "${currentQuestion}".`,
      "The current query shows a 14% increase over the previous query's results.",
      "This suggests a significant positive correlation between these two metrics."
    ],
    sqlQuery: generateSQLQuery(currentQuestion)
  };
};

const generateSQLQuery = (question: string): string => {
  if (question.toLowerCase().includes('sales by region')) {
    return `SELECT region, SUM(revenue) as total_revenue
FROM sales
JOIN customers ON sales.customer_id = customers.id
GROUP BY region
ORDER BY total_revenue DESC;`;
  }
  
  if (question.toLowerCase().includes('trends')) {
    return `SELECT date_trunc('month', sale_date) as month,
       product_category,
       SUM(revenue) as monthly_revenue
FROM sales
WHERE sale_date >= date_trunc('year', CURRENT_DATE)
GROUP BY 1, 2
ORDER BY 1, 2;`;
  }
  
  return `SELECT * 
FROM sales 
WHERE sale_date >= date_sub(CURRENT_DATE, INTERVAL 30 DAY)
LIMIT 100;`;
};

export const recommendChartType = (
  data: any[],
  question: string,
  brands: string[]
): string => {
  let recommendedType = 'bar';
  
  const hasTimeSeries = data.some(d => 
    d.date || 
    Object.keys(d).some(k => 
      k.toLowerCase().includes('date') || 
      k.toLowerCase().includes('time') || 
      k.toLowerCase().includes('year') ||
      k.toLowerCase().includes('month')
    )
  );
  
  const seriesCount = brands.length;
  
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('distribution') || 
      questionLower.includes('breakdown') || 
      questionLower.includes('proportion')) {
    return 'pie';
  }
  
  if (questionLower.includes('trend') || 
      questionLower.includes('over time') || 
      questionLower.includes('progression')) {
    return hasTimeSeries ? 'line' : 'bar';
  }
  
  if (questionLower.includes('accumulation') || 
      questionLower.includes('cumulative')) {
    return 'area';
  }
  
  if (questionLower.includes('correlation') || 
      questionLower.includes('relationship')) {
    return 'scatter';
  }
  
  if (hasTimeSeries) {
    if (seriesCount > 3) {
      return 'area';
    } else {
      return 'line';
    }
  } else {
    if (seriesCount <= 10) {
      return 'bar';
    } else {
      return 'treemap';
    }
  }
  
  return recommendedType;
};

export const getConversationContext = (): ConversationContext => {
  return {...conversationContext};
};
