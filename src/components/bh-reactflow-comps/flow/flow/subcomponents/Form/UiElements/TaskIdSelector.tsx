import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { cn } from '@/lib/utils';

interface TaskIdSelectorProps {
  id: string;
  label: string;
  value: string;
  onChange: (key: string, value: string) => void;
  placeholder?: string;
  mandatory?: boolean;
  default?: string;
  description?: string;
  parameter_name?: string;
}

export const TaskIdSelector: React.FC<TaskIdSelectorProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  mandatory = false,
  default: defaultValue,
  description,
  parameter_name
}) => {
  const { nodes } = usePipelineContext();
  const [taskIds, setTaskIds] = useState<{ value: string; label: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Extract task IDs from all nodes
  useEffect(() => {
    const extractedTaskIds: { value: string; label: string }[] = [];
    
    console.log("TaskIdSelector - All nodes:", nodes.map(n => ({
      id: n.id,
      label: n.data?.label,
      type: n.data?.formData?.type,
      task_id: n.data?.formData?.task_id
    })));

    // First, add all task IDs from nodes
    nodes.forEach(node => {
      if (node.data?.formData?.task_id) {
        // Add all nodes with task_id
        extractedTaskIds.push({
          value: node.data.formData.task_id,
          label: `${node.data.label || 'Node'}: ${node.data.formData.task_id}${node.data?.formData?.type === 'EmrCreateJobFlowOperator' ? ' (EMR Cluster)' : ''}`
        });
      }
    });
    
    console.log("TaskIdSelector - Extracted task IDs:", extractedTaskIds);
    
    setTaskIds(extractedTaskIds);
  }, [nodes]);

  // Handle selection from dropdown
  const handleValueChange = (selectedValue: string) => {
    console.log("TaskIdSelector - Selected value:", selectedValue);
    
    // Ignore the disabled placeholder option
    if (selectedValue === "no-tasks-available") {
      return;
    }
    
    // Check for duplicates - make sure no other node is using this cluster_task_id
    const isDuplicate = nodes.some(node =>
      node.data?.formData?.cluster_task_id === selectedValue && 
      node.data?.formData?.task_id !== value // Exclude the current node
    );

    if (isDuplicate) {
      setError('This Cluster Task ID is already in use by another node');
    } else {
      setError(null);
      onChange(id, selectedValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={cn("text-sm font-medium", mandatory && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {label}
      </Label>

      <Select value={value || ''} onValueChange={handleValueChange}>
        <SelectTrigger 
          id={id}
          className={cn(
            "w-full",
            error && "border-red-500 focus:ring-red-500"
          )}
        >
          <SelectValue placeholder={placeholder || "Select task ID..."} />
        </SelectTrigger>
        <SelectContent style={{ zIndex: 9999, backgroundColor: "white", color: "black" }}>
          {taskIds.length > 0 ? (
            taskIds.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-tasks-available" disabled>
              No nodes with task IDs found. Please create nodes first.
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <p className="text-xs text-gray-500 mt-1">
        {description || "Select a task ID from existing nodes. EMR cluster nodes are highlighted."}
      </p>
    </div>
  );
};