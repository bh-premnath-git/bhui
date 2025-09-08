import { useAppSelector } from '@/hooks/useRedux';
import { WelcomeGreeting } from './WelcomeGreeting';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatControllerProvider } from '@/context/ChatControllerContext';
import { PipelineWizardProvider } from '@/context/PipelineWizardContext';
import { LayoutRenderer } from './LayoutRenderer';
import { FeatureShowcase } from './FeatureShowcase';

export const HomeLayout = () => {
  const { view } = useAppSelector(state => state.home);

  return (
    <PipelineWizardProvider>
      {view === 'welcome' ? (
        <div className="min-h-screen flex flex-col bg-background">
          <div className="flex-1 flex flex-col justify-center">
            <WelcomeGreeting />
          </div>
          <ChatControllerProvider>
            <ChatInput />
          </ChatControllerProvider>
          <FeatureShowcase />
        </div>
      ) : (
        <ChatControllerProvider>
          <div className="h-screen flex flex-col bg-background overflow-hidden">
            <LayoutRenderer />
          </div>
        </ChatControllerProvider>
      )}
    </PipelineWizardProvider>
  );
};