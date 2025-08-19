import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from "@/hooks/useRedux";
import { Clock, User, Bot, CheckCircle, AlertCircle } from 'lucide-react';

export const ChatMessages: React.FC = () => {
  const { messages } = useAppSelector((state) => state.chat);

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(timestamp);
  };

  // Sample conversation data from reference images
  const sampleMessages = [
    {
      id: '1',
      content: 'Add New Connection',
      isUser: false,
      timestamp: new Date(),
      status: 'completed',
    },
    {
      id: '2',
      content: 'Select the connection',
      isUser: false,
      timestamp: new Date(),
      details: 'Suggested connections - Postgres, MySQL, BigQuery...',
    },
    {
      id: '3',
      content: 'Postgres',
      isUser: true,
      timestamp: new Date(),
    },
    {
      id: '4',
      content: 'Click to add connection',
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: '5',
      content: 'Connection created successfully',
      isUser: false,
      timestamp: new Date(),
      status: 'success',
    },
    {
      id: '6',
      content: 'Below are some details about connections...',
      isUser: false,
      timestamp: new Date(),
      details: 'Number of Schemas: 10\nTop 10 Schemas: Public, catalog, audit',
    },
    {
      id: '7',
      content: 'Do you want to continue?',
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: '8',
      content: 'Yes',
      isUser: true,
      timestamp: new Date(),
    },
    {
      id: '9',
      content: 'Onboard new dataset...',
      isUser: false,
      timestamp: new Date(),
    },
  ];

  const displayMessages = messages.length > 0 ? messages : sampleMessages;

  if (displayMessages.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <Card className="bg-chat-surface/30 border-chat-border/50">
        <CardContent className="p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {displayMessages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex items-start space-x-3 ${
                  message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {message.isUser ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-xs md:max-w-md lg:max-w-lg ${
                  message.isUser ? 'text-right' : 'text-left'
                }`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Additional details for bot messages */}
                    {!message.isUser && (message as any).details && (
                      <div className="mt-2 p-2 bg-background/20 rounded text-xs">
                        {(message as any).details}
                      </div>
                    )}

                    {/* Status indicator */}
                    {!message.isUser && (message as any).status && (
                      <div className="mt-2 flex items-center space-x-1">
                        {(message as any).status === 'success' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (message as any).status === 'completed' ? (
                          <CheckCircle className="h-3 w-3 text-blue-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-yellow-500" />
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {(message as any).status}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className={`flex items-center space-x-1 mt-1 text-xs text-muted-foreground ${
                    message.isUser ? 'justify-end' : 'justify-start'
                  }`}>
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Connection Panel (from third reference image) */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-chat-border/30">
            <h4 className="font-medium mb-3">Connection Page</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Project</label>
                <select className="w-full p-2 border rounded bg-background text-sm">
                  <option>Choose project...</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Environment</label>
                <select className="w-full p-2 border rounded bg-background text-sm">
                  <option>Choose environment...</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hostname</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded bg-background text-sm"
                  placeholder="Enter hostname..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Port</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded bg-background text-sm"
                  placeholder="Enter port..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded bg-background text-sm"
                  placeholder="Enter username..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <input 
                  type="password" 
                  className="w-full p-2 border rounded bg-background text-sm"
                  placeholder="Enter password..."
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button size="sm" className="bg-primary text-primary-foreground">
                Submit
              </Button>
              <Button size="sm" variant="outline">
                Test Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};