import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { insertPipeline, setBuildPipeLineDtl } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/features/admin/projects/hooks/useProjects';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useFieldArray } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { FormField } from '@/components/ui/form';
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

const CreatePipelineDialog: React.FC<CreatePipelineDialogProps> = ({ open, handleClose }) => {
    const { projects } = useProjects();
    const [showNotes, setShowNotes] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const context = usePipelineContext();
    const { setPipeline_id, setPipeLineName, setProjectName } = context;
    
    console.log('=== CREATE PIPELINE DIALOG DEBUG ===');
    console.log('Context keys:', Object.keys(context));
    console.log('setProjectName function:', setProjectName);
    console.log('Current projectName in context:', context.projectName);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            bh_project_id: '',
            pipeline_name: '',
            pipeline_type: '',
            notes: '',
        }
    });

    const selectedProjectId = watch('bh_project_id');
    const selectedPipelineType = watch('pipeline_type');
    const gitProjectList = Array.isArray(projects) ? projects.map((project: any) => ({
        bh_project_id: project.bh_project_id,
        bh_project_name: project.bh_project_name
    })) : [];

    const onSubmit = async (values: FormValues) => {
        try {
            setIsLoading(true);
            handleClose();

            const body = { ...values, tags: {} };
            const response = await dispatch(insertPipeline(body)).unwrap();
            
            // Set pipeline name and project name in context
            if (setPipeLineName) {
                setPipeLineName(values.pipeline_name);
            }
            
            // Find the selected project name
            const selectedProject = gitProjectList.find(project => project.bh_project_id === values.bh_project_id);
            console.log('OnSubmit - Selected project:', selectedProject);
            console.log('OnSubmit - setProjectName function:', setProjectName);
            if (selectedProject && setProjectName) {
                console.log('OnSubmit - Setting project name:', selectedProject.bh_project_name);
                setProjectName(selectedProject.bh_project_name);
                
                // Debug: Check if it was set
                setTimeout(() => {
                    console.log('OnSubmit - After setting - projectName in context:', context.projectName);
                }, 100);
            } else {
                console.error('OnSubmit - Cannot set project name - missing selectedProject or setProjectName function');
            }
            console.log(response)
            if (response?.error) {
                // Handle error - you might want to show a toast notification here
            } else {
                dispatch(setBuildPipeLineDtl(response));
                dispatch(setSelectedPipeline(response))

                setPipeline_id(response?.pipeline_id)
                localStorage.setItem("pipeline_id", response?.pipeline_id.toString())
                
                // Navigate based on pipeline type
                if (values.pipeline_type === 'requirement') {
                    navigate(ROUTES.DESIGNERS.REQUIREMENTS.NEW);
                } else {
                    navigate(`/designers/build-playground/${response?.pipeline_id}`);
                }
                // window.location.reload();
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project</label>
                            <select
                                value={selectedProjectId}
                                onChange={(e) => { 
                                    setValue('bh_project_id', e.target.value, { shouldValidate: true })
                                    const selectedProject = gitProjectList.find(project => project.bh_project_id.toString() === e.target.value);
                                    console.log('Selected project:', selectedProject);
                                    console.log('setProjectName function:', setProjectName);
                                    if (selectedProject && setProjectName) {
                                        console.log('Setting project name:', selectedProject.bh_project_name);
                                        setProjectName(selectedProject.bh_project_name);
                                        
                                        // Debug: Check if it was set
                                        setTimeout(() => {
                                            console.log('After setting - projectName in context:', context.projectName);
                                        }, 100);
                                    } else {
                                        console.error('Cannot set project name - missing selectedProject or setProjectName function');
                                    }
                                }}
                                className="w-full border bg-white border-gray-200 rounded-md p-2"
                            >
                                <option value="" disabled>Select Project</option>
                                {gitProjectList.map((project) => (
                                    <option key={project.bh_project_id} value={project.bh_project_id}>
                                        {project.bh_project_name}
                                    </option>
                                ))}
                            </select>
                            {errors.bh_project_id && (
                                <p className="text-red-500 text-sm">Project is required</p>
                            )}
                        </div>

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

                    <div className="space-y-3">
                        <label className="text-sm font-medium">Pipeline Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="relative cursor-pointer group">
                                <input
                                    type="radio"
                                    value="design"
                                    {...register('pipeline_type', { required: true })}
                                    className="absolute opacity-0"
                                />
                                <div className={`flex items-center p-4 border-2 rounded-lg hover:shadow-sm transition-all duration-200 ${
                                    selectedPipelineType === 'design' 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-blue-300'
                                } group-focus-within:ring-2 group-focus-within:ring-blue-500 group-focus-within:ring-opacity-20`}>
                                    <div className="flex items-center space-x-3 w-full">
                                        <div className="flex-shrink-0">
                                            <div className={`w-4 h-4 border-2 rounded-full transition-all duration-200 relative ${
                                                selectedPipelineType === 'design' 
                                                    ? 'border-blue-500 bg-blue-500' 
                                                    : 'border-gray-300'
                                            }`}>
                                                <div className={`absolute inset-1 w-2 h-2 rounded-full bg-white transition-all duration-200 ${
                                                    selectedPipelineType === 'design' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                                                }`}></div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="text-sm font-medium text-gray-900">Design Pipeline</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Build data transformation pipelines</p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                            <label className="relative cursor-pointer group">
                                <input
                                    type="radio"
                                    value="requirement"
                                    {...register('pipeline_type', { required: true })}
                                    className="absolute opacity-0"
                                />
                                <div className={`flex items-center p-4 border-2 rounded-lg hover:shadow-sm transition-all duration-200 ${
                                    selectedPipelineType === 'requirement' 
                                        ? 'border-green-500 bg-green-50' 
                                        : 'border-gray-200 hover:border-green-300'
                                } group-focus-within:ring-2 group-focus-within:ring-green-500 group-focus-within:ring-opacity-20`}>
                                    <div className="flex items-center space-x-3 w-full">
                                        <div className="flex-shrink-0">
                                            <div className={`w-4 h-4 border-2 rounded-full transition-all duration-200 relative ${
                                                selectedPipelineType === 'requirement' 
                                                    ? 'border-green-500 bg-green-500' 
                                                    : 'border-gray-300'
                                            }`}>
                                                <div className={`absolute inset-1 w-2 h-2 rounded-full bg-white transition-all duration-200 ${
                                                    selectedPipelineType === 'requirement' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                                                }`}></div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm font-medium text-gray-900">Requirement Pipeline</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Define pipeline requirements</p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                        {errors.pipeline_type && (
                            <p className="text-red-500 text-sm">Pipeline type is required</p>
                        )}
                    </div>
              <EngineSelector />

                    <div>
                        <button
                            type="button"
                            className="text-blue-600 flex items-center"
                            onClick={() => setShowNotes(!showNotes)}
                        >
                            Add Notes {showNotes ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                        </button>
                        <div className={`transition-all duration-300 ${showNotes ? 'block' : 'hidden'}`}>
                            <textarea
                                {...register('notes')}
                                className="mt-2 w-full p-2 border rounded-md resize-none"
                                placeholder="Enter notes here..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-black rounded-md hover:shadow-md transition-shadow"
                            disabled={isLoading}
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-black/90 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Pipeline'}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePipelineDialog;