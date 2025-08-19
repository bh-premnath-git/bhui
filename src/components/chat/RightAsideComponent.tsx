import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setRightComponent, addMessage } from '@/store/slices/chat/chatSlice';
import { getChatService } from '@/services/chatService';

// Import specific form components - only ConnectionForm
import { ConnectionForm } from './forms/ConnectionForm';

export const RightAsideComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const rightComponent = useAppSelector((state) => state.chat.rightComponent);
  const chatService = getChatService(dispatch);

  if (!rightComponent || !rightComponent.isVisible) {
    return null;
  }

  const handleClose = async () => {
    // Close the right component
    dispatch(setRightComponent(null));
    
    // Treat close as submit - add success message
    dispatch(addMessage({
      content: '✅ Connection configuration completed successfully!',
      isUser: false
    }));
  };

  const renderComponent = () => {
    switch (rightComponent.componentId) {
      case 'connection-form':
        return <ConnectionForm />;
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            Component "{rightComponent.componentId}" not found
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full bg-background border-l border-chat-border/50">
      <Card className="h-full rounded-none border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-chat-border/30">
          <CardTitle className="text-lg font-semibold">
            {rightComponent.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-4rem)] overflow-auto">
          {renderComponent()}
        </CardContent>
      </Card>
    </div>
  );
};