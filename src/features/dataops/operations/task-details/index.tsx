import {useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X, Settings } from 'lucide-react';
import ShowingLogs from "./ShowingLogs";
import TaskChartComponent from "./ChartComponent";
import { getTaskDetails } from '@/store/oldstore/DataOpsSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'; 

const TaskDetails = ({ jobId, onClose, selectedRowData }) => {
  const dispatch = useAppDispatch();
  const { taskDetails, taskLoading, taskError } = useAppSelector(state => state.dataopsApi);

  const [selectedTab, setSelectedTab] = useState("properties");
  const [isOpen, setIsOpen] = useState(true);
  const [columns, setColumns] = useState([
    { id: 'task_name', label: 'Task Name', visible: true },
    { id: 'task_status', label: 'Status', visible: true },
    { id: 'task_start_time', label: 'Start Time', visible: true },
    { id: 'task_end_time', label: 'End Time', visible: true },
    { id: 'task_metadata.task_type', label: 'Task Type', visible: false },
    { id: 'task_metadata.priority', label: 'Priority', visible: false },
    { id: 'task_statistics.records_processed', label: 'Records Processed', visible: false },
    { id: 'task_statistics.processing_time_ms', label: 'Processing Time (ms)', visible: false },
  ]);

  useEffect(() => {
    if (jobId) {
      dispatch(getTaskDetails(jobId));
    }
  }, [jobId, dispatch]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const handleColumnToggle = (columnId) => {
    setColumns(columns.map(col => col.id === columnId ? { ...col, visible: !col.visible } : col));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-3xl h-full flex flex-col">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {columns.map(column => (
                  <DropdownMenuItem key={column.id} onSelect={() => handleColumnToggle(column.id)}>
                    <Checkbox checked={column.visible} /> {column.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {selectedRowData && (
          <div className="p-4 border-b flex justify-between bg-gray-50">
            <p>Project Name: <strong>{selectedRowData.project_name}</strong></p>
            <p>Flow Name: <strong>{selectedRowData.flow_name}</strong></p>
          </div>
        )}

        {taskLoading ? (
          <p className="text-center py-4">Loading tasks...</p>
        ) : taskError ? (
          <p className="text-center text-red-500 py-4">{taskError}</p>
        ) : taskDetails.length === 0 ? (
          <p className="text-center py-4">No tasks found</p>
        ) : (
          <div className="overflow-auto py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.filter(col => col.visible).map(column => (
                    <TableHead key={column.id}>{column.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskDetails.map(task => (
                  <TableRow key={task.task_name}>
                    {columns.filter(col => col.visible).map(column => (
                      <TableCell key={column.id}>{getNestedValue(task, column.id)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="w-full flex">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="logs">Show Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="properties">
            <Card>
              <CardContent>
                <Label>Batch ID: {selectedRowData.batch_id}</Label>
                <Label>Input Data: {selectedRowData.input_data_path}</Label>
                <Label>Output Data: {selectedRowData.output_data_path}</Label>
                <TaskChartComponent selectedRowData={selectedRowData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="logs">
            <ShowingLogs selectedRowData={selectedRowData} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;
