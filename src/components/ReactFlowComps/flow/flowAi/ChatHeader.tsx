import React from 'react';
import { MessageSquare, X } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  title: string;
  type?: string;
  imageSrc?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose, title, type, imageSrc }) => {
  return (
    <>
      <div className="flex items-center p-6 border-b">
        <div className="flex items-center flex-1">
          <div>
            {imageSrc && (
              <img
                src={imageSrc}
                alt={title}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
          </div>
          {type && (
            <span className="ml-4 px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
              {type}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200 mb-5"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="border-b bg-white">
        <div className="flex h-12 items-center px-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4" />
              <div className="rounded-md px-2  bg-gray-100 text-sm font-medium text-black">BigHammer AI</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
