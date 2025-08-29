import { RootState } from "@/store";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react"
import { useSelector } from "react-redux";

interface WorkflowMetadataProps {
  workflowData?: any
  selectedTask?: any
  jobId?: string
}

export function WorkflowMetadata({ workflowData, selectedTask, jobId }: WorkflowMetadataProps) {
  
  const job = useSelector((state: RootState) => state.dataOpsHub.selectedDataOpsHub);


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

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "FAILURE":
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "PARTIAL_SUCCESS":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "RUNNING":
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "text-green-700"
      case "FAILURE":
      case "FAILED":
        return "text-red-700"
      case "PARTIAL_SUCCESS":
        return "text-yellow-700"
      case "RUNNING":
        return "text-blue-700"
      default:
        return "text-gray-700"
    }
  }

  const jobData = job || workflowData

  return (
    <div className="w-80 bg-gray-50 border-l flex-shrink-0">
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        <div className="space-y-6">
          {selectedTask ? (
            <>
              {/* Selected Task Metadata */}
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">START TIME</div>
                <div className="text-sm font-mono text-gray-900">{formatTime(job.job_start_time)}</div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">END TIME</div>
                <div className="text-sm font-mono text-gray-900">{formatTime(job.job_end_time)}</div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">STATUS</div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(job.flow_status)}
                  <span className={`text-sm font-semibold ${getStatusColor(job.flow_status)}`}>
                    {job.flow_status?.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">TOTAL DURATION</div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-mono text-blue-700">
                    {(() => {
                      if (!job.job_start_time || !job.job_end_time) return "0s"
                      const start = new Date(job.job_start_time)
                      const end = new Date(job.job_end_time)
                      const durationMs = end.getTime() - start.getTime()
                      const minutes = Math.floor(durationMs / 60000)
                      const seconds = Math.floor((durationMs % 60000) / 1000)
                      return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
                    })()}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PROJECT</div>
                <div className="text-sm font-mono text-gray-900">
                  {selectedTask.project_name || jobData?.project_name || "project-demo"}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">TYPE</div>
                <div>
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {job.flow_type || jobData?.flow_type || "INGESTION"}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">TOTAL TASKS</div>
                <div className="text-sm font-mono text-gray-900">1</div>
              </div>
            </>
          ) : jobData ? (
            <>
              {/* Job Metadata */}
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">START TIME</div>
                <div className="text-sm font-mono text-gray-900">{formatTime(job.job_start_time)}</div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">END TIME</div>
                <div className="text-sm font-mono text-gray-900">{formatTime(job.job_end_time)}</div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">STATUS</div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(job.flow_status || "SUCCESS")}
                  <span className={`text-sm font-semibold ${getStatusColor(job.flow_status || "SUCCESS")}`}>
                    {(job.flow_status || "SUCCESS")?.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">SUCCESS RATE</div>
                <div className="text-sm font-mono text-gray-900">
                  {jobData.successful_tasks && jobData.total_tasks
                    ? `${jobData.successful_tasks}/${jobData.total_tasks} tasks successful`
                    : "1/1 tasks successful"}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">TOTAL DURATION</div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-mono text-blue-700">
                    {(() => {
                      if (!job.job_start_time || !job.job_end_time) return "0s"
                      const start = new Date(job.job_start_time)
                      const end = new Date(job.job_end_time)
                      const durationMs = end.getTime() - start.getTime()
                      const minutes = Math.floor(durationMs / 60000)
                      const seconds = Math.floor((durationMs % 60000) / 1000)
                      return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
                    })()}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PROJECT</div>
                <div className="text-sm font-mono text-gray-900">{jobData.project_name || "project-demo"}</div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">TYPE</div>
                <div>
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {jobData.flow_type || "INGESTION"}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">TOTAL TASKS</div>
                <div className="text-sm font-mono text-gray-900">{jobData.total_tasks || "1"}</div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-sm text-gray-500">No metadata available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
