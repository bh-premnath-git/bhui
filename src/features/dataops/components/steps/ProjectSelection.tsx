import React, { useEffect } from 'react';
import { Database } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getProjectOptions } from '../schema';
import { useDispatch } from 'react-redux';
import { fetchProjects } from '@/store/slices/dataCatalog/datasourceSlice';
import { AppDispatch } from '@/store';

export const ProjectSelection = ({ 
  project, 
  selectedProject, 
  setSelectedProject, 
  setSelectedConnection, 
  setSelectedSchema, 
  setSelectedTables 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const projectOptions = getProjectOptions(project);
  
  useEffect(() => {
    // Fetch projects when component mounts
    dispatch(fetchProjects());
  }, [dispatch]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Database className="h-5 w-5 mr-2 text-primary" />
        <h2 className="text-lg font-semibold">Select Project</h2>
      </div>
      <Select
        value={selectedProject}
        onValueChange={(value) => {
          setSelectedProject(value);
          setSelectedConnection('');
          setSelectedSchema('');
          setSelectedTables([]);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projectOptions.map((project) => (
            <SelectItem key={project.value} value={project.value}>
              {project.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};