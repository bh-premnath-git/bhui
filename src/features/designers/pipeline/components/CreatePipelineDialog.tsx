import React, { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { insertPipeline, setBuildPipeLineDtl } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
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
import { EngineSelector } from '@/components/headers/playground-header/EngineSelector';
import { ROUTES } from '@/config/routes';

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
  const { setPipeline_id, setPipeLineName, setProjectName } =
    usePipelineContext();

  const [showNotes, setShowNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
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
        insertPipeline({ ...values, tags: {} }),
      ).unwrap();

      if (!response?.error) {
        setPipeLineName?.(values.pipeline_name);
        setPipeline_id(response.pipeline_id);
        localStorage.setItem('pipeline_id', response.pipeline_id.toString());

        dispatch(setBuildPipeLineDtl(response));
        dispatch(setSelectedPipeline(response));

        const route =
          values.pipeline_type === 'requirement'
            ? ROUTES.DESIGNERS.REQUIREMENTS.NEW
            : `/designers/build-playground/${response.pipeline_id}`;
        navigate(route);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[800px] max-w-[90vw]"
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Create Pipeline</DialogTitle>
          <p id="dialog-description" className="text-sm text-muted-foreground">
            Create a new pipeline by selecting a project and providing a name.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Project */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <select
                value={selectedProjectId}
                onChange={e => handleProjectChange(e.target.value)}
                className="w-full border bg-white border-gray-200 rounded-md p-2"
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
                <p className="text-red-500 text-sm">Project is required</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                {...register('pipeline_name', { required: true })}
                placeholder="Enter name"
              />
              {errors.pipeline_name && (
                <p className="text-red-500 text-sm">Name is required</p>
              )}
            </div>
          </div>

          {/* Pipeline Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Pipeline Type</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  value: 'design',
                  border: 'border-blue-500',
                  bg: 'bg-blue-50',
                  dot: 'bg-blue-500',
                  label: 'Design Pipeline',
                  description: 'Build data transformation pipelines',
                },
                {
                  value: 'requirement',
                  border: 'border-green-500',
                  bg: 'bg-green-50',
                  dot: 'bg-green-500',
                  label: 'Requirement Pipeline',
                  description: 'Define pipeline requirements',
                },
              ].map(({ value, border, bg, dot, label, description }) => (
                <label key={value} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    value={value}
                    {...register('pipeline_type', { required: true })}
                    className="absolute opacity-0"
                  />
                  <div
                    className={`flex items-center p-4 border-2 rounded-lg hover:shadow-sm transition-all duration-200 ${
                      selectedPipelineType === value
                        ? `${border} ${bg}`
                        : 'border-gray-200 hover:border-gray-300'
                    } group-focus-within:ring-2 group-focus-within:ring-opacity-20`}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-4 h-4 border-2 rounded-full relative transition-all duration-200 ${
                            selectedPipelineType === value
                              ? border
                              : 'border-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute inset-1 w-2 h-2 rounded-full bg-white transition-all duration-200 ${
                              selectedPipelineType === value
                                ? 'opacity-100 scale-100'
                                : 'opacity-0 scale-0'
                            }`}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${dot}`} />
                          <span className="text-sm font-medium text-gray-900">
                            {label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.pipeline_type && (
              <p className="text-red-500 text-sm">Pipeline type is required</p>
            )}
          </div>

          {/* Engine Selector */}
          <EngineSelector />

          {/* Notes */}
          <div>
            <button
              type="button"
              className="text-blue-600 flex items-center"
              onClick={() => setShowNotes(prev => !prev)}
            >
              Add Notes{' '}
              {showNotes ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </button>
            {showNotes && (
              <textarea
                {...register('notes')}
                className="mt-2 w-full p-2 border rounded-md resize-none"
                placeholder="Enter notes here..."
                rows={3}
              />
            )}
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Close
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create Pipeline'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePipelineDialog;
