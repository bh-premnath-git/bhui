import React, { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Terminal, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';
import { useQuery } from '@tanstack/react-query';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface DataPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Task {
  taskid: string;
  type: string;
}

const DataPreviewModal: React.FC<DataPreviewModalProps> = ({ isOpen, onClose }) => {
  const dagEunID = useAppSelector((state) => state.flow.dagEunID);
  const [logContent, setLogContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>('');

  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks', dagEunID],
    queryFn: async () => {
      if (!dagEunID) {
        return [];
      }
      const params = new URLSearchParams(dagEunID);
      const response = await fetch(`${CATALOG_API_PORT}/bh_airflow/get_dag_task_id/?${params}`, {
        method: 'GET',
      });
      const data = await response.json();
      return data.task_instances.map((item: any) => ({
        taskid: item.task_id,
        type: item.operator
      }));
    },
    enabled: !!dagEunID && isOpen
  });

  const { data: logData, isLoading: logLoading, error: logError } = useQuery({
    queryKey: ['logs', dagEunID, selectedTask],
    queryFn: async () => {
      if (!dagEunID || !selectedTask) {
        return '';
      }
      const params = new URLSearchParams({ ...dagEunID, task_id: selectedTask });
      const response = await fetch(`${CATALOG_API_PORT}/bh_airflow/get_dag_logs/?${params}`, {
        method: 'GET',
      });
      const data = await response.text();
      return data;
    },
    enabled: !!dagEunID && !!selectedTask && isOpen
  });

  useEffect(() => {
    if (tasksData && tasksData.length > 0) {
      setTasks(tasksData);
      if (!selectedTask) {
        setSelectedTask(tasksData[0].taskid);
      }
    }
  }, [tasksData]);

  useEffect(() => {
    if (logData) {
      setLogContent(logData);
    }
  }, [logData]);

  useEffect(() => {
    if (tasksError || logError) {
      setError(tasksError?.message || logError?.message || 'An unexpected error occurred.');
    }
  }, [tasksError, logError]);

  useEffect(() => {
    setIsLoading(tasksLoading || logLoading);
  }, [tasksLoading, logLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-end justify-center z-[1000] bg-black bg-opacity-50">
      <div className="w-full animate-[slideUp_0.3s_ease-out] max-h-[80vh] overflow-y-auto">
        <div className="bg-white rounded-t-lg shadow-lg relative">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-700 text-sm">
                <Terminal className="h-4 w-4" />
                Flow Name: {dagEunID?.dag_id || 'Unknown'}
              </div>
              <Select
                value={selectedTask}
                onValueChange={setSelectedTask}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem
                      key={task.taskid}
                      value={task.taskid}
                    >
                      {task.type} - {task.taskid}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <ScrollArea className="h-96 w-full rounded-md border">
              <div className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading logs...</span>
                  </div>
                ) : error ? (
                  <div className="text-red-500 font-mono text-sm">
                    <Terminal className="inline-block mr-2 mb-1 text-red-500" size={16} />
                    Error: {error}
                  </div>
                ) : (
                  <pre className="text-black font-mono text-sm whitespace-pre-wrap break-words">
                    <Terminal className="inline-block mr-2 mb-1 text-gray-500" size={16} />
                    {logContent || 'No logs available.'}
                  </pre>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

const slideUpKeyframes = `
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
`;

export default DataPreviewModal;