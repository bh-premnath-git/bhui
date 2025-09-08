import { useAppSelector } from '@/hooks/useRedux';
import type { ChatMode } from '@/store/slices/chat/chatSlice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench,
  Code,
  FileText,
  Zap,
  BarChart3,
  Workflow
} from 'lucide-react';
import { useChatController } from '@/context/ChatControllerContext';

const suggestions = [
  {
    mode: 'create-pipeline',
    title: 'Try Pipeline Creation',
    description: 'Build intelligent data pipelines with AI assistance',
    icon: Workflow,
  },
  {
    mode: 'explore-data',
    title: 'Try Data Explorer',
    description: 'Query and visualize your data using natural language',
    icon: BarChart3,
  },
];


export const WipPlaceholder = () => {
  const { currentMode } = useAppSelector(state => state.chat);
  const { selectMode, backToHome } = useChatController();

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'analyze-code':
        return <Code className="w-5 h-5" />;
      case 'generate-report':
        return <FileText className="w-5 h-5" />;
      case 'optimize-query':
        return <Zap className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
    }
  };

  const isWipMode = !['create-pipeline', 'explore-data'].includes(currentMode) && currentMode !== 'default';

  return (
    <div className="h-full flex items-center justify-center p-6 bg-surface">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
            {isWipMode ? getModeIcon(currentMode) : <Wrench className="w-8 h-8 text-primary-foreground" />}
          </div>
          
          {isWipMode ? (
            <>
              <h2 className="text-2xl font-semibold mb-2">
                {currentMode.charAt(0).toUpperCase() + currentMode.slice(1).replace('-', ' ')} Mode
              </h2>
              <Badge variant="outline" className="mb-4 bg-warning/10 text-warning border-warning/20">
                <Wrench className="w-3 h-3 mr-1" />
                Coming Soon
              </Badge>
              <p className="text-muted-foreground mb-6">
                This mode is currently under development. We're working hard to bring you this feature soon!
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-2">Welcome to AI Analytics</h2>
              <p className="text-muted-foreground mb-6">
                Select a mode to start working with your data, or choose from our fully-featured tools below.
              </p>
            </>
          )}
        </div>

        {/* Suggestions - only show for default mode */}
        {!isWipMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {suggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <Card
                  key={suggestion.mode}
                  className="p-4 cursor-pointer transition-smooth hover:shadow-glow hover:border-primary/50"
                  onClick={() => selectMode(suggestion.mode as ChatMode)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium">{suggestion.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    {suggestion.description}
                  </p>
                </Card>
              );
            })}
          </div>
        )}


        {isWipMode && (
          <div className="mt-8">
            <Button 
              variant="outline" 
              onClick={() => backToHome()}
            >
              Back to Main Menu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};