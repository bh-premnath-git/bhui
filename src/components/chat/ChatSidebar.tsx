import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Menu } from 'lucide-react';

const chatHistory = [
  { id: 1, title: 'Chat sidebar with toggle and new', date: 'Today' },
  { id: 2, title: 'Effective coding learning plan overview', date: 'Today' },
  { id: 3, title: 'Tenant-aware query execution issue analysis', date: 'Yesterday' }
];

type ChatSidebarProps = {
  open: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectChat?: (id: number) => void;
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  open,
  onToggle,
  onNewChat,
  onSelectChat,
}) => {
  const [showToggleTooltip, setShowToggleTooltip] = useState(false);
  const [showNewChatTooltip, setShowNewChatTooltip] = useState(false);

  return (
    <div className="relative h-full">
      <aside
        className={`h-full flex flex-col overflow-y-auto bg-white transition-all duration-200
          ${open ? 'w-80 min-w-[320px] border-r border-gray-200' : 'w-14 min-w-[56px]'}
        `}
        style={{ zIndex: 30 }}
      >
        {/* Fixed Header */}
        <div className={`flex items-center px-4 py-4 bg-white sticky top-0 z-10 ${open ? 'justify-between' : 'flex-col gap-2'}`}>
          {/* <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className=" mt-4 ml-3 hover:bg-gray-100 text-black h-9 w-9 "
              onClick={onToggle}
              aria-label={open ? 'Hide chat history' : 'Show chat history'}
              onMouseEnter={() => !open && setShowToggleTooltip(true)}
              onMouseLeave={() => setShowToggleTooltip(false)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            {showToggleTooltip && !open && (
              <div className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-gray-300 whitespace-nowrap z-50">
                {open ? 'Hide chat history' : 'Show chat history'}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-transparent border-l-gray-800"></div>
              </div>
            )}
          </div> */}
          
          <div className="relative top-24">
              <Button
              variant="ghost"
              size="icon"
              className="ml-2 hover:bg-gray-100 text-white h-6 w-6 bg-gray-600 rounded-full"
              onClick={onNewChat}
              aria-label="New Chat"
              onMouseEnter={() => !open && setShowNewChatTooltip(true)}
              onMouseLeave={() => setShowNewChatTooltip(false)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {/* Tooltip for new chat button */}
            {showNewChatTooltip && !open && (
              <div className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-gray-300 whitespace-nowrap z-50">
                New Chat
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-transparent border-l-gray-800"></div>
              </div>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div className={`flex-1 ${open ? 'block' : 'hidden'}`}>
          {/* Today Section */}
          <div className="px-3 py-2">
            <h3 className="text-xs font-medium text-gray-600 mb-2 px-3">Today</h3>
            <ul className="space-y-1">
              {chatHistory.filter(item => item.date === 'Today').map((item) => (
                <li
                  key={item.id}
                  className="group flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm relative"
                  onClick={() => onSelectChat?.(item.id)}
                >
                  <div className="flex-1 min-w-0">
                    <span className="block text-gray-900 truncate pr-6">{item.title}</span>
                  </div>
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Yesterday Section */}
          <div className="px-3 py-2">
            <h3 className="text-xs font-medium text-gray-600 mb-2 px-3">Yesterday</h3>
            <ul className="space-y-1">
              {chatHistory.filter(item => item.date === 'Yesterday').map((item) => (
                <li
                  key={item.id}
                  className="group flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm relative"
                  onClick={() => onSelectChat?.(item.id)}
                >
                  <div className="flex-1 min-w-0">
                    <span className="block text-gray-900 truncate pr-6">{item.title}</span>
                  </div>
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
};