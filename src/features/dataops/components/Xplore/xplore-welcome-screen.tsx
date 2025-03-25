import { BarChart3, Database, LineChart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WelcomeScreenProps {
  suggestedQuestions: string[];
  onSuggestedQuestion: (question: string) => void;
}

export function WelcomeScreen({ suggestedQuestions, onSuggestedQuestion }: WelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
      <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            DataOps AI Assistant
          </h1>
          <h2 className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Your intelligent companion for exploring and visualizing DataOps insights through natural conversations
          </h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <FeatureCard
            icon={<BarChart3 className="h-7 w-7" />}
            title="Compare Categories"
            description="Analyze and compare data across different segments effortlessly"
          />
          <FeatureCard
            icon={<LineChart className="h-7 w-7" />}
            title="Track Trends"
            description="Visualize and understand patterns over time periods"
          />
          <FeatureCard
            icon={<MessageSquare className="h-7 w-7" />}
            title="Natural Queries"
            description="Chat naturally and ask follow-up questions with ease"
          />
          <FeatureCard
            icon={<Database className="h-7 w-7" />}
            title="DataOps Services"
            description="Access and explore your DataOps services seamlessly"
          />
        </div>

        <div className="w-full max-w-3xl mx-auto space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Get Started with Example Questions</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {suggestedQuestions.map((question, i) => (
              <Button
                key={i}
                variant="outline"
                className={cn(
                  "justify-start text-left h-auto py-4 px-4",
                  "hover:bg-primary hover:text-primary-foreground",
                  "transition-all duration-200",
                  "animate-in fade-in slide-in-from-bottom-4",
                  "animation-delay-" + (i * 100),
                  "whitespace-normal break-words",
                  "text-base"
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
    <div className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-lg">
      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
        {icon}
      </div>
      <div className="space-y-2 text-center">
        <h3 className="font-semibold text-lg text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
