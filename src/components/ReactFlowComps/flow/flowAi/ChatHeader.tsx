import React from 'react';
import { X } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  title: string;
  type?: string;
  imageSrc?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose, title, type, imageSrc }) => {
  return (
    <div className="flex items-center p-6 border-b">
      <div className="flex items-center flex-1">
        <div>
        {imageSrc && (
          <img
            src={imageSrc}
            alt={title}
            className="w-16 h-16 rounded-full object-cover"
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
  );
};
