import { BarChart3, Database, LineChart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WelcomeScreenProps {
  suggestedQuestions: string[];
  onSuggestedQuestion: (question: string) => void;
}

export function WelcomeScreen({ suggestedQuestions, onSuggestedQuestion }: WelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-2 text-center">
      <div className="space-y-2 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-2">
          <h2 className="text-xl text-muted-foreground">
            Ask questions about your data in natural language to generate visualizations and insights
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6 mb-4">
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6" />}
            title="Compare Categories"
            description="Analyze data across different segments"
          />
          <FeatureCard
            icon={<LineChart className="h-6 w-6" />}
            title="Track Trends"
            description="Discover patterns over time"
          />
          <FeatureCard
            icon={<MessageSquare className="h-6 w-6" />}
            title="Natural Queries"
            description="Ask follow-up questions easily"
          />
          <FeatureCard
            icon={<Database className="h-6 w-6" />}
            title="Data Explorer"
            description="Browse your database structure"
          />
        </div>

        <div className="w-full max-w-2xl mx-auto space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Try asking:</h3>
          <div className="grid grid-cols-2 gap-2">
            {suggestedQuestions.map((question, i) => (
              <Button
                key={i}
                variant="outline"
                className={cn(
                  "justify-start text-left h-auto py-2 px-3",
                  "hover:bg-primary hover:text-primary-foreground",
                  "transition-colors duration-200",
                  "animate-in fade-in slide-in-from-bottom-4",
                  "animation-delay-" + (i * 100),
                  "whitespace-normal break-words"
                )}
                onClick={() => onSuggestedQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group flex flex-col items-center gap-1 p-3 rounded-xl bg-card hover:bg-accent transition-colors duration-200">
      <div className="p-1 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
        {icon}
      </div>
      <div className="space-y-1 text-center">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
