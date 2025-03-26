import { BarChart3, Database, LineChart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WelcomeScreenProps {
  suggestedQuestions: string[];
  onSuggestedQuestion: (question: string) => void;
}

export function WelcomeScreen({ suggestedQuestions, onSuggestedQuestion }: WelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center bg-gradient-to-b from-background to-background/50">
      <div className="space-y-8 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-2">
          <h2 className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Explore your data universe through natural conversations
          </h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <FeatureCard
            icon={<Database className="h-8 w-8" />}
            title="DataOps Logs"
            description="Analyze job metrics"
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Visualize"
            description="Data to insights"
          />
          <FeatureCard
            icon={<LineChart className="h-8 w-8" />}
            title="Trends"
            description="Track patterns"
          />
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8" />}
            title="AI Chat"
            description="Ask naturally"
          />
        </div>

        <div className="w-full max-w-6xl mx-auto space-y-2 mt-6">
          <h3 className="text-xl font-semibold text-foreground">Try These Queries</h3>
          <div className="grid sm:grid-cols-2 gap-1">
            {suggestedQuestions.map((question, i) => (
              <Button
                key={i}
                variant="outline"
                className={cn(
                  "justify-start text-left h-auto py-3 px-4",
                  "hover:bg-primary hover:text-primary-foreground",
                  "transition-all duration-200",
                  "animate-in fade-in slide-in-from-bottom-4",
                  "animation-delay-" + (i * 100),
                  "whitespace-normal break-words",
                  "text-base",
                  "border-primary/20 hover:border-primary",
                  "backdrop-blur-sm"
                )}
                onClick={() => onSuggestedQuestion(question)}
              >
                <span className="mr-2 text-primary">→</span>
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
    <div className="group flex flex-col items-center w-64 p-6 rounded-2xl bg-card/50 hover:bg-accent/50 transition-all duration-300 hover:shadow-lg border border-primary/10 hover:border-primary/30 backdrop-blur-sm">
      <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 hover:scale-110">
        {icon}
      </div>
      <div className="space-y-2 text-center mt-4">
        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
