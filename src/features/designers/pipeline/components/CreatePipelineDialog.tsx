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

interface CreatePipelineDialogProps {
    handleClose: () => void;
    open: boolean;
}

interface FormValues {
    bh_project_id: string;
    pipeline_name: string;
    notes: string;
}

const CreatePipelineDialog: React.FC<CreatePipelineDialogProps> = ({ open, handleClose }) => {
    const { projects } = useProjects();
    const [showNotes, setShowNotes] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {setPipeline_id,setPipeLineName} = usePipelineContext()
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            bh_project_id: '',
            pipeline_name: '',
            notes: '',
        }
    });

    const selectedProjectId = watch('bh_project_id');
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
            setPipeLineName(values.pipeline_name);
            if (response?.error) {
                // Handle error - you might want to show a toast notification here
            } else {
                dispatch(setBuildPipeLineDtl(response));
                setPipeline_id(response?.pipeline_id)
                localStorage.setItem("pipeline_id", response?.pipeline_id.toString())
                navigate(`/designers/build-playground/${response?.pipeline_id}`);
                // window.location.reload();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderDeduplicatorFields = (control: any) => {
        const { fields: deduplicatorByFields, append: appendDeduplicatorBy, remove: removeDeduplicatorBy } = useFieldArray({
            control,
            name: 'dedup_by'
        });

        return (
            <div>
                {deduplicatorByFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 mb-2">
                        <FormField
                            control={control}
                            name={`dedup_by.${index}`}
                            render={({ field }) => (
                                <div className="w-full">
                                    <Input
                                        {...field}
                                        placeholder="Enter dedup field"
                                    />
                                </div>
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => removeDeduplicatorBy(index)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <span className="text-xl">×</span>
                        </button>
                    </div>
                ))}
                <Button
                    type="button"
                    onClick={() => appendDeduplicatorBy('')}
                    className="text-green-600 font-bold"
                >
                    Add Deduplicator By
                </Button>
            </div>
        );
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
                                onChange={(e) => setValue('bh_project_id', e.target.value, { shouldValidate: true })}
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