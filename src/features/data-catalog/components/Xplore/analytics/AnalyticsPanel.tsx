import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function AnalyticsPanel({ 
  dashboardData: propsDashboardData,
  showHeader = true,
  chartStyles: propsChartStyles,
  viewMode: propsViewMode = "chart",
  onViewModeChange
}: { 
  dashboardData?: any,
  showHeader?: boolean,
  chartStyles?: ChartStyles,
  viewMode?: "chart" | "table" | "sql",
  onViewModeChange?: (mode: "chart" | "table" | "sql") => void
}) {
  // ...existing code...
  
  // Add state for feedback
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  
  const handleFeedbackSubmit = () => {
    // In a real application, you would send this to your backend
    console.log("Feedback:", {
      rating: feedbackRating,
      comment: feedbackComment,
      question: currentQuestion,
      timestamp: new Date().toISOString()
    });
    
    toast.success("Thank you for your feedback!");
    setShowFeedback(false);
    setFeedbackComment("");
    setFeedbackRating(null);
  };
  
  // Then add a feedback button and dialog:
  
  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">{dashboardData.title}</h1>
          <p className="text-muted-foreground">
            {dashboardData.timeRange} · {dashboardData.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={propsViewMode} onValueChange={(v) => handleViewModeChange(v as "chart" | "table" | "sql")}>
            <TabsList>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="sql">SQL</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFeedback(true)}
            className="ml-2"
          >
            <ThumbsUp className="h-3 w-3 mr-1" />
            Feedback
          </Button>
          <DropdownMenu>
            {/* existing dropdown menu */}
          </DropdownMenu>
        </div>
      </div>
      
      {/* ... rest of your component ... */}
      
      {/* Feedback Dialog */}
      {showFeedback && (
        <Card className="fixed inset-0 m-auto max-w-md h-72 z-50 shadow-lg">
          <CardContent className="p-6 flex flex-col h-full">
            <h3 className="text-lg font-medium mb-4">Rate this answer</h3>
            <div className="flex gap-4 justify-center mb-4">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setFeedbackRating(rating)}
                  className={`p-2 rounded-full ${
                    feedbackRating === rating ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <textarea
              value={feedbackComment}
              onChange={e => setFeedbackComment(e.target.value)}
              placeholder="What could be improved? (optional)"
              className="flex-1 p-2 border rounded-md resize-none"
            />
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowFeedback(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleFeedbackSubmit}
                disabled={feedbackRating === null}
              >
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 