import { Button } from "@/components/ui/button";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

export default function SuggestedQuestions({ onSelectQuestion }: SuggestedQuestionsProps) {
  const questions = [
    "What were our sales by region in the last quarter?",
    "Compare product performance between 2022 and 2023",
    "Show me customer retention by cohort",
    "What are our top 5 performing products?",
    "Analyze revenue trends by customer segment",
    "List top 10 expensive products"
  ];
  
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Suggested questions</h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, i) => (
          <Button 
            key={i} 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => onSelectQuestion(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}