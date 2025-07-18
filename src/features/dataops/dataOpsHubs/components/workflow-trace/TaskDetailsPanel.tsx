"use client"
import { ChevronRight, ChevronDown, ExternalLink, Copy, Download, Eye, Database } from "lucide-react"

interface TaskDetailsPanelProps {
  selectedTask?: any
  activeTab: string
  onTabChange: (tab: string) => void
  jobId?: string
}

export function TaskDetailsPanel({ selectedTask, activeTab, onTabChange, jobId }: TaskDetailsPanelProps) {
  const formatTime = (timestamp: string) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const generateSampleLogs = (task: any) => {
    if (!task) return []
    const logs = [
      `[${formatTime(task.task_start_time)}] INFO - Starting task: ${task.task_name}`,
      `[${formatTime(task.task_start_time)}] INFO - Task configuration loaded successfully`,
      `[${formatTime(task.task_start_time)}] INFO - Validating input parameters`,
    ]

    if (task.task_status?.toUpperCase() === "SUCCESS") {
      logs.push(
        `[${formatTime(task.task_start_time)}] INFO - Processing data...`,
        `[${formatTime(task.task_start_time)}] INFO - Data validation completed`,
        `[${formatTime(task.task_end_time)}] INFO - Task completed successfully`,
      )
    } else if (task.task_status?.toUpperCase() === "FAILURE") {
      logs.push(
        `[${formatTime(task.task_start_time)}] INFO - Processing data...`,
        `[${formatTime(task.task_start_time)}] WARNING - Connection timeout detected`,
        `[${formatTime(task.task_start_time)}] ERROR - Task execution failed`,
        `[${formatTime(task.task_end_time)}] ERROR - Task failed with exit code 1`,
      )
    }
    return logs
  }

  const formatMetadataKey = (key: string) => {
    return key.replace(/_/g, " ").toUpperCase()
  }

  const formatMetadataValue = (key: string, value: any) => {
    if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"))) {
      const getUrlTitle = (key: string) => {
        const keyLower = key.toLowerCase()
        if (keyLower.includes("log")) return "View Task Logs"
        if (keyLower.includes("url")) return "Open Link"
        if (keyLower.includes("report")) return "View Report"
        if (keyLower.includes("dashboard")) return "Open Dashboard"
        if (keyLower.includes("monitor")) return "View Monitoring"
        return "Open Link"
      }

      return (
        <div className="flex items-center gap-2">
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-small"
          >
            <ExternalLink className="w-4 h-4" />
            {getUrlTitle(key)}
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(value)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy URL"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      )
    }
    return <span className="font-mono break-all">{String(value)}</span>
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {selectedTask ? (
        <>
          {/* Tabs */}
          <div className="flex border-b bg-white flex-shrink-0">
            {["overview", "logs", "metadata"].map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-gray-500 text-gray-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "overview" && (
              <div className="p-8 space-y-8">
                {/* Task Details Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Task Details</h3>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-700">Task Name</span>
                      </div>
                      <div className="ml-6 text-gray-600 font-mono">{selectedTask.task_name}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-700">Status</span>
                      </div>
                      <div className="ml-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            selectedTask.task_status?.toUpperCase() === "SUCCESS"
                              ? "bg-green-100 text-green-800"
                              : selectedTask.task_status?.toUpperCase() === "FAILURE"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedTask.task_status}
                        </span>
                      </div>
                    </div>

                    {selectedTask.task_metadata?.operator && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-700">Operator</span>
                        </div>
                        <div className="ml-6 text-gray-600 font-mono">{selectedTask.task_metadata.operator}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Execution Timeline */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">EXECUTION</h3>
                    <span className="text-sm text-gray-500">timeline</span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Start Time:</span>
                        <span className="font-mono text-gray-900">{formatTime(selectedTask.task_start_time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">End Time:</span>
                        <span className="font-mono text-gray-900">{formatTime(selectedTask.task_end_time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Status:</span>
                        <span
                          className={`font-semibold ${
                            selectedTask.task_status?.toUpperCase() === "SUCCESS"
                              ? "text-green-600"
                              : selectedTask.task_status?.toUpperCase() === "FAILURE"
                                ? "text-red-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {selectedTask.task_status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {selectedTask.task_metadata?.task_log_url && (
                    <button
                      onClick={() => window.open(selectedTask.task_metadata.task_log_url, "_blank")}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-400 transition-colors font-small text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Full Logs
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="p-8 space-y-6">
                <div className="bg-gray-200 rounded-xl p-6 font-mono text-sm text-black-400 max-h-96 overflow-y-auto">
                  {generateSampleLogs(selectedTask).map((log, index) => (
                    <div key={index} className="mb-1 leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors font-medium">
                    <Copy className="w-4 h-4" />
                    Copy Logs
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors font-medium">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            )}

            {activeTab === "metadata" && selectedTask.task_metadata && (
              <div className="p-8 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-6">Task Metadata</h3>
                  <div className="space-y-6">
                    {Object.entries(selectedTask.task_metadata).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex flex-col space-y-3">
                          <span className="font-semibold text-gray-700">{formatMetadataKey(key)}:</span>
                          <div className="text-gray-900">{formatMetadataValue(key, value)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a Task</h3>
            <p className="text-gray-600">Click on a task in the execution tree to view its details.</p>
          </div>
        </div>
      )}
    </div>
  )
}
