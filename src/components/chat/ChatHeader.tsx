import React from 'react';

export const ChatHeader: React.FC = () => {

  return (
    <div className="relative">

      {/* Main Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
            Bighammer
          </h1>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          How I can help?
        </h2>
      </div>
    </div>
  );
};