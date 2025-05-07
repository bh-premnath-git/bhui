export function XplorerGenericChatUI() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold">AI Chat</h2>
        <p className="mt-2 text-sm text-gray-500">
          Ask questions about your data and get instant insights.
        </p>
      </div>
      <div className="border-t border-gray-200 p-4">
        <input
          type="text"
          placeholder="Type your question..."
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
    </div>
  )
}