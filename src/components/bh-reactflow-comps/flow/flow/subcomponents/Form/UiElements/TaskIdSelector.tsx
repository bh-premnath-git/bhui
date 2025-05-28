import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
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
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
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

  // We no longer need handleInputChange since we removed the text input
  // Instead, we'll check for duplicates in the handleSelect function

  // Handle selection from dropdown
  const handleSelect = (selectedValue: string) => {
    console.log("TaskIdSelector - Selected value:", selectedValue);
    
    // Check for duplicates - make sure no other node is using this cluster_task_id
    const isDuplicate = nodes.some(node =>
      node.data?.formData?.cluster_task_id === selectedValue && 
      node.data?.formData?.task_id !== value // Exclude the current node
    );

    if (isDuplicate) {
      setError('This Cluster Task ID is already in use by another node');
    } else {
      setError(null);
      setInputValue(selectedValue);
      onChange(id, selectedValue);
      setOpen(false);
    }
  };
  
  // Initialize with current value
  useEffect(() => {
    if (value) {
      console.log("TaskIdSelector - Initializing with value:", value);
      setInputValue(value);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={cn("text-sm font-medium", mandatory && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {label}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {inputValue || placeholder || "Select task ID..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search for task ID..." />
            <CommandEmpty>
              {taskIds.length === 0 
                ? "No nodes with task IDs found. Please create nodes first." 
                : "No matching task ID found."}
            </CommandEmpty>
            <CommandGroup>
              {taskIds.length > 0 ? (
                taskIds.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={() => handleSelect(item.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        inputValue === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))
              ) : (
                <CommandItem disabled>
                  No nodes with task IDs found. Please create nodes first.
                </CommandItem>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <p className="text-xs text-gray-500 mt-1">
        {description || "Select a task ID from existing nodes. EMR cluster nodes are highlighted."}
      </p>
    </div>
  );
};