import React, { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronDown, ChevronUp, Wrench, FileText } from 'lucide-react';
import { insertPipeline, setBuildPipeLineDtl, setPipeLineType, setSelectedEngineType } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/features/admin/projects/hooks/useProjects';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { setSelectedPipeline } from '@/store/slices/designer/pipelineSlice';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { ROUTES } from '@/config/routes';
import { useEngineTypes, useAvailableEngineTypes } from '@/hooks/useSchemaTypes';
import { ValidEngineTypes } from '@/types/pipeline';

interface CreatePipelineDialogProps {
  handleClose: () => void;
  open: boolean;
}

interface FormValues {
  bh_project_id: string;
  pipeline_name: string;
  pipeline_type: string;
  notes: string;
}

const CreatePipelineDialog: React.FC<CreatePipelineDialogProps> = ({
  open,
  handleClose,
}) => {
  const { projects } = useProjects();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setPipeline_id, setPipeLineName, setProjectName,setPipelines,pipelines } =
    usePipelineContext();
  const { selectedEngineType } = useAppSelector((state: RootState) => state.buildPipeline);
  
  // Get dynamic engine types from schema
  const engineTypes = useEngineTypes();
  const availableEngineTypes = useAvailableEngineTypes();

  const [showNotes, setShowNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      bh_project_id: '',
      pipeline_name: '',
      pipeline_type: '',
      notes: '',
    },
  });

  const selectedProjectId = watch('bh_project_id');
  const selectedPipelineType = watch('pipeline_type');

  const gitProjectList = useMemo(
    () =>
      Array.isArray(projects)
        ? projects.map(({ bh_project_id, bh_project_name }) => ({
            bh_project_id,
            bh_project_name,
          }))
        : [],
    [projects],
  );

  const handleProjectChange = useCallback(
    (projectId: string) => {
      setValue('bh_project_id', projectId, { shouldValidate: true });
      const selectedProject = gitProjectList.find(
        p => p.bh_project_id.toString() === projectId,
      );
      if (selectedProject) setProjectName?.(selectedProject.bh_project_name);
    },
    [gitProjectList, setProjectName, setValue],
  );

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      handleClose();

      const response = await dispatch(
        insertPipeline({ ...values, tags: {}, engine_type: selectedEngineType }),
      ).unwrap();
      setPipelines([...pipelines, response]);
      if (!response?.error) {
        setPipeLineName?.(values.pipeline_name);
        setPipeline_id(response.pipeline_id);
        localStorage.setItem('pipeline_id', response.pipeline_id.toString());

        dispatch(setBuildPipeLineDtl(response));
        dispatch(setSelectedPipeline(response));
        dispatch(setPipeLineType(response.pipeline_type));
         reset();
        setShowNotes(false);
        dispatch(setSelectedEngineType(response.engine_type)); // Reset to default engine type
        const route = `/designers/build-playground/${response.pipeline_id}`;
        navigate(route);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pipelineTypes = [
    {
      value: 'design',
      icon: Wrench,
      label: 'Design Pipeline',
      description: 'Build data transformations',
      color: 'text-blue-600',
      gradient: 'from-blue-50 to-blue-100',
      border: 'border-blue-500',
      iconBg: 'bg-blue-100',
    },
    {
      value: 'requirement',
      icon: FileText,
      label: 'Requirement Pipeline',
      description: 'Define requirements',
      color: 'text-green-600',
      gradient: 'from-green-50 to-green-100',
      border: 'border-green-500',
      iconBg: 'bg-green-100',
    },
  ];



  const handleEngineSelect = (engineType: ValidEngineTypes) => {
    dispatch(setSelectedEngineType(engineType));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[650px] max-w-[90vw]"
        aria-describedby="dialog-description"
      >
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg">Create Pipeline</DialogTitle>
          <p id="dialog-description" className="text-xs text-muted-foreground">
            Create a new pipeline by selecting a project and providing a name.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Project */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Project</label>
              <select
                value={selectedProjectId}
                onChange={e => handleProjectChange(e.target.value)}
                className="w-full border bg-white border-gray-200 rounded-md px-2.5 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select Project
                </option>
                {gitProjectList.map(project => (
                  <option
                    key={project.bh_project_id}
                    value={project.bh_project_id}
                  >
                    {project.bh_project_name}
                  </option>
                ))}
              </select>
              {errors.bh_project_id && (
                <p className="text-red-500 text-xs">Project is required</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Name</label>
              <Input
                {...register('pipeline_name', { required: true })}
                placeholder="Enter name"
                className="h-8 text-sm"
              />
              {errors.pipeline_name && (
                <p className="text-red-500 text-xs">Name is required</p>
              )}
            </div>
          </div>

          {/* Pipeline Type */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Pipeline Type</label>
            <div className="grid grid-cols-2 gap-2">
              {pipelineTypes.map(({ value, icon: Icon, label, description, color, gradient, border, iconBg }, index) => (
                <label key={value} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    value={value}
                    {...register('pipeline_type', { required: true })}
                    className="absolute opacity-0"
                  />
                  <div
                    className={`flex items-center p-3 border-2 rounded-xl transition-all duration-200 ${
                      selectedPipelineType === value
                        ? `${border} bg-gradient-to-${index === 0 ? 'r' : 'l'} ${gradient} shadow-sm`
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 w-full">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            selectedPipelineType === value ? iconBg : 'bg-gray-100'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${
                            selectedPipelineType === value ? color : 'text-gray-600'
                          }`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-medium text-gray-900">
                            {label}
                          </span>
                          {selectedPipelineType === value && (
                            <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`} />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.pipeline_type && (
              <p className="text-red-500 text-xs">Pipeline type is required</p>
            )}
          </div>

          {/* Engine Type */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Engine Type</label>
            <div className={`grid gap-2 ${engineTypes.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {engineTypes.map(({ id, icon: Icon, label, description, color, gradient, border, iconBg }, index) => (
                <label key={id} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    value={id}
                    checked={selectedEngineType === id}
                    onChange={() => handleEngineSelect(id as ValidEngineTypes)}
                    className="absolute opacity-0"
                  />
                  <div
                    className={`flex items-center p-3 border-2 rounded-xl transition-all duration-200 ${
                      selectedEngineType === id
                        ? `${border} bg-gradient-to-${index % 2 === 0 ? 'r' : 'l'} ${gradient} shadow-sm`
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 w-full">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            selectedEngineType === id ? iconBg : 'bg-gray-100'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${
                            selectedEngineType === id ? color : 'text-gray-600'
                          }`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-medium text-gray-900">
                            {label}
                          </span>
                          {selectedEngineType === id && (
                            <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`} />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 flex items-center text-xs font-medium transition-colors"
              onClick={() => setShowNotes(prev => !prev)}
            >
              Add Notes{' '}
              {showNotes ? (
                <ChevronUp className="ml-1 h-3 w-3" />
              ) : (
                <ChevronDown className="ml-1 h-3 w-3" />
              )}
            </button>
            {showNotes && (
              <textarea
                {...register('notes')}
                className="mt-1.5 w-full p-2 border border-gray-200 rounded-md resize-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter notes here..."
                rows={2}
              />
            )}
          </div>

          {/* Actions */}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              Close
            </Button>
            <Button type="submit" disabled={isLoading || !isValid} className="h-8 text-xs">
              {isLoading ? 'Creating…' : 'Create Pipeline'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePipelineDialog;
