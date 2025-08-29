interface WorkflowHeaderProps {
  title: string
  subtitle?: string
  workflowData?: any
}

export function WorkflowHeader({ title, workflowData }: WorkflowHeaderProps) {
  return (
    <div className="border-b bg-white px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3  px-4 py-2 ">
          <img src="/airflow.svg" alt="Airflow Task" className="w-6 h-6" />
          <span className="font-bold text-gray-900">{title}</span>
          {workflowData?.flow_type && (
            <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600 uppercase font-small mt-2">
              {workflowData.flow_type}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
