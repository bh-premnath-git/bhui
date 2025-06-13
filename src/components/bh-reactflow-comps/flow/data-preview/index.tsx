import React, { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Terminal, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';
import { useQuery } from '@tanstack/react-query';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { useSidebar } from '@/context/SidebarContext';
import { apiService } from '@/lib/api/api-service';
import { LoadingState } from '@/components/shared/LoadingState';


// Define the animation class
const ANIMATION_CLASS = "translate-y-0 transition-transform duration-300 ease-out";
const INITIAL_CLASS = "translate-y-full";

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
  const { isExpanded } = useSidebar();
  const [logContent, setLogContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      console.log("Modal opened, isOpen:", isOpen, "dagEunID:", dagEunID);
    }
  }, [isOpen, dagEunID]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks', dagEunID],
    queryFn: async () => {
      if (!dagEunID) {
        return [];
      }
      
      try {
        const {dag_run_id, ...other} = dagEunID;
        const response = await apiService.get<{ task_instances: any[] }>({
          baseUrl: CATALOG_REMOTE_API_URL,
          url: '/bh_airflow/get_dag_task_id',
          params: dagEunID,
          usePrefix: true,
          method: 'GET',
          metadata: {
            errorMessage: 'Failed to fetch tasks'
          }
        });
        
        return response.task_instances.map((item: any) => ({
          taskid: item.task_id,
          type: item.operator
        }));
      } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }
    },
    enabled: !!dagEunID && isOpen
  });

  const { data: logData, isLoading: logLoading, error: logError } = useQuery({
    queryKey: ['logs', dagEunID, selectedTask],
    queryFn: async () => {
      if (!dagEunID || !selectedTask) {
        return '';
      }
      
      const response = await apiService.get<string>({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/bh_airflow/get_dag_logs',
        params: { ...dagEunID, task_id: selectedTask },
        usePrefix: true,
        method: 'GET',
        metadata: {
          errorMessage: 'Failed to fetch logs'
        }
      });
      
      return response;
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
    <div 
      className="fixed inset-0 flex flex-col items-stretch z-[1000] bg-black bg-opacity-50"
      style={{ left: isExpanded ? '16rem' : '5rem' }} 
    >
      <div 
        className={`mt-auto w-full max-h-[80vh] overflow-y-auto ${isAnimating ? ANIMATION_CLASS : INITIAL_CLASS}`}
      >
        <div className="bg-card rounded-t-lg shadow-lg relative w-full">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-card-foreground text-sm">
                <Terminal className="h-4 w-4" />
                Flow Name: {dagEunID?.dag_id || 'Unknown'}
              </div>
              <Select
                value={selectedTask}
                onValueChange={setSelectedTask}
              >
                <SelectTrigger className="w-[280px] md:w-[320px]">
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
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors duration-300"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <ScrollArea className="h-96 w-full rounded-md border">
              <div className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <LoadingState className='w-40 h-40' fullScreen={true} />
                  </div>
                ) : error ? (
                  <div className="text-destructive font-mono text-sm">
                    <Terminal className="inline-block mr-2 mb-1 text-destructive" size={16} />
                    Error: {error}
                  </div>
                ) : (
                  <pre className="text-card-foreground font-mono text-sm whitespace-pre-wrap break-words">
                    <Terminal className="inline-block mr-2 mb-1 text-muted-foreground" size={16} />
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

export default DataPreviewModal;