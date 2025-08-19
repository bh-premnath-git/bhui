import React from 'react';

export const ChatHeader: React.FC = () => {

  return (
    <div className="relative">

      {/* Main Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <h3 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
            Bighammer
          </h3>
        </div>
        
        <h4 className="text-lg md:text-xl font-bold text-foreground">
          How I can help?
        </h4>
      </div>
    </div>
  );
};