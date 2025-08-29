import { useState, useMemo } from "react"
import { LazyLoading } from "@/components/shared/LazyLoading"
import { useTaskDetails } from "../hooks/useTaskDetails"
import { WorkflowTraceViewer } from "./workflow-trace"

interface DataOpsHubSchemaProps {
  jobId?: string
}

export function DataOpsHubSchema({ jobId }: DataOpsHubSchemaProps) {
  const [offset, setOffset] = useState(0)
  const [pageSize, setPageSize] = useState(100) // Increased to get all tasks for workflow view

  const { taskDetails, isFetching, total, next, prev } = useTaskDetails({
    shouldFetch: true,
    jobId: jobId,
    limit: pageSize,
    offset: offset,
  })

  // Transform task details into workflow data
  const workflowData = useMemo(() => {
    if (!taskDetails || taskDetails.length === 0) return null

    const firstTask = taskDetails[0]

    // Calculate overall workflow status
    const hasFailures = taskDetails.some((task: any) => task.task_status?.toUpperCase() === "FAILURE")
    const hasRunning = taskDetails.some((task: any) => task.task_status?.toUpperCase() === "RUNNING")
    const allSuccess = taskDetails.every((task: any) => task.task_status?.toUpperCase() === "SUCCESS")

    let overallStatus = "UNKNOWN"
    if (hasRunning) {
      overallStatus = "RUNNING"
    } else if (hasFailures) {
      overallStatus = allSuccess ? "PARTIAL_SUCCESS" : "FAILURE"
    } else if (allSuccess) {
      overallStatus = "SUCCESS"
    }

    // Calculate total duration
    const startTimes = taskDetails
      .map((task: any) => new Date(task.task_start_time))
      .filter((date) => !isNaN(date.getTime()))
    const endTimes = taskDetails
      .map((task: any) => new Date(task.task_end_time))
      .filter((date) => !isNaN(date.getTime()))

    const earliestStart = startTimes.length > 0 ? new Date(Math.min(...startTimes.map((d) => d.getTime()))) : null
    const latestEnd = endTimes.length > 0 ? new Date(Math.max(...endTimes.map((d) => d.getTime()))) : null

    let totalDuration = "0s"
    if (earliestStart && latestEnd) {
      const durationMs = latestEnd.getTime() - earliestStart.getTime()
      const minutes = Math.floor(durationMs / 60000)
      const seconds = Math.floor((durationMs % 60000) / 1000)
      totalDuration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
    }

    return {
      name: firstTask.flow_name || "Unknown Workflow",
      flow_type: firstTask.flow_type,
      status: overallStatus,
      start_time: earliestStart?.toISOString(),
      end_time: latestEnd?.toISOString(),
      total_duration: totalDuration,
      batch_id: firstTask.batch_id,
      project_name: firstTask.project_name,
      job_id: firstTask.job_id,
      total_tasks: taskDetails.length,
      successful_tasks: taskDetails.filter((task: any) => task.task_status?.toUpperCase() === "SUCCESS").length,
    }
  }, [taskDetails])

  const handleTaskSelect = (task: any) => {
    // Handle task selection logic here if needed
    console.log("Selected task:", task)
  }

  // Pagination handlers (if you need them for other components)
  const pageIndex = Math.floor(offset / pageSize)
  const pageCount = Math.ceil((total || 0) / pageSize)

  const handlePageChange = (page: number) => {
    const newOffset = page * pageSize
    setOffset(newOffset)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setOffset(0)
  }

  const handleNextPage = () => {
    if (next) {
      setOffset((prev) => prev + pageSize)
    }
  }

  const handlePrevPage = () => {
    if (prev) {
      setOffset((prev) => Math.max(0, prev - pageSize))
    }
  }

  if (isFetching && !taskDetails) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LazyLoading fullScreen={false} className="w-40 h-40" />
      </div>
    )
  }

  if (!taskDetails || taskDetails.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500">No workflow data available</p>
          {jobId && <p className="text-sm text-gray-400 mt-2">Job ID: {jobId}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <LazyLoading fullScreen={false} className="w-40 h-40" />
          </div>
        )}

        <div className="overflow-hidden bg-white">
          <WorkflowTraceViewer
            jobId={jobId}
            workflowData={workflowData}
            title={workflowData?.name || "Data Operations Workflow"}
            onTaskSelect={handleTaskSelect}
          />
        </div>
        
        {/* Optional: Add pagination controls below the workflow viewer if needed */}
        {total && total > pageSize && (
          <div className="flex items-center justify-between px-4 py-2 mt-4 border rounded-lg bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {offset + 1} to {Math.min(offset + pageSize, total)} of {total} tasks
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={!prev}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {pageIndex + 1} of {pageCount}
              </span>
              <button
                onClick={handleNextPage}
                disabled={!next}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}