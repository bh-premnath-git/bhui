import React, { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Terminal, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { ApiService } from '@/services/apiServices';

interface DataPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataPreviewModal: React.FC<DataPreviewModalProps> = ({ isOpen, onClose }) => {
  const dagEunID = useAppSelector((state) => state.flowApi.dagEunID);
  const selectedFlowFromList = useAppSelector((state) => state.flowApi.selectedFlowFromList);
  const [logContent, setLogContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const seletors = Array.from(selectedFlowFromList.flow_definition.flow_json.flowJson ?? []);
  const tasks = []
  seletors.map((item: any) => {

    tasks.push({ type: item.type, taskid: item.task_id })
  })
  const [selectedTask, setSelectedTask] = useState(tasks[0]?.taskid || '');


  async function getData() {
    try {
      if (!dagEunID) {
        return;
      }
      setIsLoading(true);
      setError(null);
      const result = await ApiService('8011', 'get', `/bh_airflow/get_dag_task_id/`, null, dagEunID);
      const taskId = result?.task_instances?.[0]?.task_id;
      if (!taskId) {
        throw new Error('Task ID not found in the response.');
      }
      const logResult = await ApiService('8011', 'get', `/bh_airflow/get_dag_logs/`, null, { ...dagEunID, task_id: taskId });

      setLogContent(logResult);
    } catch (error) {
      setError(error.message || 'An unexpected error occurred.');
      console.error("err", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen && dagEunID) {
      getData();
    }
  }, [isOpen, dagEunID]);

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
                  defaultValue={tasks[0]?.taskid}
                  onValueChange={(value) => setSelectedTask(value)}
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

// Add this to your global CSS or a styled-components definition
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