export type ResponseType = 'IDENTIFY' | 'SQL' | 'TABLE' | 'CHART' | 'EXPLANATION';

export interface AIStreamingResponse {
  response_type?: ResponseType;
  content: any;
  timestamp?: string;
}

export interface AIMetaResponse {
  meta: {
    version: string;
    timestamp: string;
    request_id: string;
    status: string;
  };
  data: {
    message: string;
    input_question?: string;
    duration_ms?: number;
    results_summary?: Record<string, any>;
  };
}

// Function to parse streaming responses
export const parseStreamingResponse = (responseText: string): AIStreamingResponse[] => {
  const responses: AIStreamingResponse[] = [];
  
  // Split the response by 'data: ' and process each chunk
  const chunks = responseText.split('data: ');
  
  for (const chunk of chunks) {
    if (!chunk.trim()) continue;
    
    try {
      // Try to find valid JSON within the chunk
      let jsonString = chunk.trim();
      
      // Check if there's any non-JSON text after the JSON object
      // This handles cases where the chunk might contain extra text
      try {
        // Try to find where the JSON object ends
        const jsonEndMatch = jsonString.match(/^(\{.*\}|\[.*\])/s);
        if (jsonEndMatch && jsonEndMatch[0]) {
          jsonString = jsonEndMatch[0];
        }
      } catch (e) {
        // If this fails, we'll try with the original string
        console.log("Error finding JSON end:", e);
      }
      
      const parsedChunk = JSON.parse(jsonString);
      
      // Check if it's a meta message or actual response
      if (parsedChunk.response_type) {
        responses.push(parsedChunk);
      } else if (parsedChunk.data && Array.isArray(parsedChunk.data)) {
        // Handle case where data is an array of responses
        parsedChunk.data.forEach((item: any) => {
          if (item && item.response_type) {
            responses.push(item);
          }
        });
      }
    } catch (error) {
      console.log("Error parsing JSON chunk:", error, "Chunk:", chunk.substring(0, 50) + "...");
      
      // Try to salvage partial JSON by finding JSON objects with regex
      try {
        const jsonMatches = chunk.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g);
        if (jsonMatches) {
          for (const match of jsonMatches) {
            try {
              const parsedMatch = JSON.parse(match);
              if (parsedMatch.response_type) {
                responses.push(parsedMatch);
              }
            } catch (e) {
              // Skip invalid JSON objects
            }
          }
        }
      } catch (e) {
        console.log("Error trying to salvage JSON:", e);
      }
    }
  }
  
  return responses;
};

// Process the data to extract the most relevant information
export const processAIResponse = (responseText: string): string => {
  try {
    const responses = parseStreamingResponse(responseText);
    
    // Look for EXPLANATION or chart description as they contain the most readable data
    const explanation = responses.find(r => r.response_type === 'EXPLANATION');
    if (explanation && typeof explanation.content === 'string') {
      return explanation.content;
    }
    
    // If no explanation, check for chart data
    const chart = responses.find(r => r.response_type === 'CHART');
    if (chart) {
      try {
        // Extract JSON part from the chart content if needed
        const chartContent = typeof chart.content === 'string' 
          ? JSON.parse(chart.content.replace(/```json\n|\n```/g, ''))
          : chart.content;
        
        return chartContent.description || `Chart: ${chartContent.title}`;
      } catch (e) {
        console.error("Error parsing chart content:", e);
      }
    }
    
    // If no chart explanation, try SQL
    const sql = responses.find(r => r.response_type === 'SQL');
    if (sql && typeof sql.content === 'string') {
      return `SQL Query: ${sql.content.substring(0, 100)}...`;
    }
    
    // Last resort: just return the first response
    if (responses.length > 0) {
      const firstResponse = responses[0];
      if (typeof firstResponse.content === 'string') {
        return firstResponse.content;
      } else {
        return JSON.stringify(firstResponse.content);
      }
    }
    
    return "No readable content found in the response.";
  } catch (error) {
    console.error("Error processing AI response:", error);
    return "Error processing response.";
  }
};
