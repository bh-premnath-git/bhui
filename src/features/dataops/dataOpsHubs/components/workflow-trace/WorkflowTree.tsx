"use client"

import { useState, useEffect } from "react"
import {
    ChevronRight,
    ChevronDown,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Workflow,
    PanelLeftOpen,
    PanelLeftClose,
} from "lucide-react"
import { useTaskDetails } from "../../hooks/useTaskDetails"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

interface WorkflowTreeProps {
    jobId?: string
    workflowData?: any
    selectedTask?: any
    onTaskSelect: (task: any) => void
}

export function WorkflowTree({ jobId, workflowData, selectedTask, onTaskSelect }: WorkflowTreeProps) {
    const [expandedNodes, setExpandedNodes] = useState(new Set(["job-root"]))
    const [isPanelOpen, setIsPanelOpen] = useState(true)

    const { taskDetails, isFetching } = useTaskDetails({
        shouldFetch: !!jobId,
        jobId: jobId,
        limit: 100,
        offset: 0,
    })

    const selectedDataOpsHub = useSelector((state: RootState) => state.dataOpsHub.selectedDataOpsHub);

    useEffect(() => {
        if (!selectedTask && taskDetails?.length > 0) {
            const firstNode = workflowData
                ? {
                    id: "job-root",
                    name: workflowData.name,
                    status: workflowData.status,
                    total_duration: workflowData.total_duration,
                    children: taskDetails,
                }
                : taskDetails[0]

            onTaskSelect(firstNode)
        }
    }, [taskDetails, selectedTask, workflowData])

    const getStatusIcon = (status: string) => {
        switch (status?.toUpperCase()) {
            case "SUCCESS":
                return <CheckCircle className="w-3 h-3 text-green-600" />
            case "FAILURE":
            case "FAILED":
                return <XCircle className="w-3 h-3 text-red-600" />
            case "PARTIAL_SUCCESS":
                return <AlertTriangle className="w-3 h-3 text-yellow-600" />
            case "RUNNING":
                return <Clock className="w-3 h-3 text-blue-600 animate-pulse" />
            default:
                return <Clock className="w-3 h-3 text-gray-400" />
        }
    }

    const toggleNode = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes)
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId)
        } else {
            newExpanded.add(nodeId)
        }
        setExpandedNodes(newExpanded)
    }

    const calculateTaskDuration = (task: any) => {
        if (!task.task_start_time || !task.task_end_time) return "0s"

        const start = new Date(task.task_start_time)
        const end = new Date(task.task_end_time)
        const durationMs = end.getTime() - start.getTime()

        const minutes = Math.floor(durationMs / 60000)
        const seconds = Math.floor((durationMs % 60000) / 1000)

        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
    }

    const TreeNode = ({
        node,
        level = 0,
        isRoot = false,
    }: {
        node: any
        level?: number
        isRoot?: boolean
    }) => {
        const nodeId = node.id || node.task_id
        const isExpanded = expandedNodes.has(nodeId)
        const hasChildren = node.children && node.children.length > 0

        const isSelected =
            selectedTask &&
            ((selectedTask.task_id && selectedTask.task_id === node.task_id) ||
                (selectedTask.id && selectedTask.id === node.id))

        return (
            <div className="relative">
                <div
                    className={`flex items-center gap-2 py-3 px-3 cursor-pointer text-sm transition-all duration-200 ${isSelected ? "bg-gray-200 border-l-4 border-gray-500" : "hover:bg-gray-50 text-gray-800"
                        }`}
                    style={{ marginLeft: `${level * 12}px` }}
                    onClick={() => {
                        onTaskSelect(node)
                        if (hasChildren) toggleNode(nodeId)
                    }}
                >
                    {hasChildren ? (
                        <button className="flex items-center justify-center w-4 h-4 shrink-0">
                            {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-500" />
                            ) : (
                                <ChevronRight className="w-3 h-3 text-gray-400" />
                            )}
                        </button>
                    ) : (
                        <div className="w-4 shrink-0" />
                    )}

                    {/* Task Icon */}
                    {isRoot ? (
                        <img
                            src="/airflow.svg"
                            alt="Airflow Task"
                            className={`w-4 h-4 shrink-0 ${isSelected ? "grayscale-0" : "grayscale opacity-80"
                                }`}
                        />

                    ) : (
                        <Workflow className="w-3 h-3 shrink-0 text-gray-600" />
                    )}

                    {/* Task name (only if open) */}
                    {isPanelOpen && (
                        <span className="font-medium truncate flex-1 text-gray-900">{node.task_name || node.name}</span>
                    )}

                    {isRoot && (
                        <span className="shrink-0">{getStatusIcon(selectedDataOpsHub.flow_status || node.status)}</span>
                    )}


                    {/* Duration */}
                    {isPanelOpen && (
                        <span className="text-xs font-mono shrink-0 text-gray-500">
                            {node.duration || node.total_duration || calculateTaskDuration(node)}
                        </span>
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="relative">
                        {node.children.map((child: any) => (
                            <TreeNode key={child.id || child.task_id} node={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={`transition-all duration-300 ${isPanelOpen ? "w-80" : "w-16"} bg-gray-50 border-r flex-shrink-0`}>
            <div className="flex flex-col h-full">
                {/* Toggle button inside top bar */}
                <div className="px-4 py-3 bg-white border-b flex items-center justify-between flex-shrink-0">
                    {isPanelOpen && <span className="text-sm font-semibold text-gray-700">TRACE</span>}
                    <button
                        onClick={() => setIsPanelOpen(!isPanelOpen)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        {isPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                    </button>
                </div>

                {/* Tree content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-1">
                        {workflowData && (
                            <TreeNode
                                node={{
                                    id: "job-root",
                                    name: workflowData.name || "sales-flow2",
                                    status: workflowData.status || "SUCCESS",
                                    total_duration: workflowData.total_duration || "12s",
                                    children: taskDetails,
                                }}
                                isRoot={true}
                            />
                        )}
                        {!workflowData && taskDetails?.map((task: any) => <TreeNode key={task.task_id} node={task} level={0} />)}
                    </div>
                </div>
            </div>
        </div>
    )
}
