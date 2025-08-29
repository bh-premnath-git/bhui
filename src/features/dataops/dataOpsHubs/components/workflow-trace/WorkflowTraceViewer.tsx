"use client"

import { useState } from "react"
import { WorkflowHeader } from "./WorkflowHeader"
import { WorkflowTree } from "./WorkflowTree"
import { TaskDetailsPanel } from "./TaskDetailsPanel"
import { WorkflowMetadata } from "./WorkflowMetadata"

interface WorkflowTraceViewerProps {
  jobId?: string
  workflowData?: any
  title?: string
  subtitle?: string
  onTaskSelect?: (task: any) => void
}

export function WorkflowTraceViewer({
  jobId,
  workflowData,
  title = "Workflow Trace",
  onTaskSelect,
}: WorkflowTraceViewerProps) {
  const [selectedTask, setSelectedTask] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  const handleTaskSelect = (task: any) => {
    setSelectedTask(task)
    onTaskSelect?.(task)
  }

  // Hide left sidebar when logs or metadata tabs are active
  const shouldHideLeftSidebar = activeTab === "logs" || activeTab === "metadata"

  return (
    <div className="h-screen bg-white flex flex-col">
      <WorkflowHeader title={title} workflowData={workflowData} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Workflow Tree - Hidden when logs/metadata tabs are active */}
        <WorkflowTree
          jobId={jobId}
          workflowData={workflowData}
          selectedTask={selectedTask}
          onTaskSelect={handleTaskSelect}
        />

        {/* Main Content */}
        <div className={`flex-1 ${shouldHideLeftSidebar ? "w-full" : ""}`}>
          <TaskDetailsPanel
            selectedTask={selectedTask}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            jobId={jobId}
          />
        </div>

        {/* Right Sidebar - Metadata - Always visible */}
        {!shouldHideLeftSidebar && (
          <WorkflowMetadata workflowData={workflowData} selectedTask={selectedTask} jobId={jobId} />
        )}
      </div>
    </div>
  )
}
