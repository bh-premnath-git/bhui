import { CircleUserRound, Loader2 } from "lucide-react";

export default function ConversationView({ conversation, isLoading, decoded }) {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {conversation.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">Hello, <span className="text-indigo-500">{decoded?.name || 'User'}</span></h1>
            <p className="text-gray-500">How can I assist you today?</p>
          </div>
        ) : (
          conversation.map((entry) => (
            <div key={entry.id} className="space-y-6">
              <div className="flex items-start gap-4">
                <CircleUserRound className="text-gray-700 w-5 h-5" />
                <div className="flex-1 bg-white p-4 rounded-lg shadow-md border border-gray-200">
                  <p className="text-gray-800">{entry.question}</p>
                </div>
              </div>

              {entry.response === null ? (
                <div className="flex items-center gap-3 pl-12 text-gray-400 animate-pulse">
                  <Loader2 className="h-6 w-6" />
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <img
                    src="/assets/buildPipeline/bighammer.png"
                    alt="bighammer"
                    className="w-10 h-10 rounded-full border border-gray-300"
                  />
                  <div className="flex-1 bg-gray-100 p-4 rounded-lg shadow-md border border-gray-200">
                    <p className="text-gray-700">
                      {typeof entry.response === 'string' ? entry.response : entry.response.answer}
                    </p>
                  </div>
                </div>

              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
