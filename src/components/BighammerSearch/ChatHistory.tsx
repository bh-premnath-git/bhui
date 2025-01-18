import { Menu, PlusCircle, Trash2 } from "lucide-react";

export default function ChatHistory({ chatHistory, handleNewChat, handleDeleteChat }) {
    return (
      <div className="w-80 h-full bg-white shadow-lg border-l border-gray-200 absolute right-0 top-0 p-6">
        <button
          onClick={handleNewChat}
          className="mt-10 w-full flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg shadow-sm"
        >
          <PlusCircle className="h-5 w-5" />
          New Chat
        </button>
  
        {/* Chat History */}
        <h2 className="text-lg font-semibold text-gray-800 mt-6">Chat History</h2>
        <div className="space-y-3">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center justify-between p-2 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200"
            >
              <span className="truncate text-gray-800">{chat.title}</span>
              <button
                onClick={() => handleDeleteChat(chat.id)}
                className="h-5 w-5 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
  