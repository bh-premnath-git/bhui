import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setBuildPipeLineDtl } from '@/store/oldstore/BuildPipeLineSlice';
import { ApiService } from "@/services/api.services";
import { CATALOG_API_PORT } from '@/services/environment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Button,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@/components/ui';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';

const schema = z.object({
  bh_project_id: z.string().nonempty('Project is required'),
  pipeline_name: z.string().nonempty('Name is required'),
  notes: z.string().optional(),
});

interface PipeLineCreatePopupProps {
  handleClose: () => void;
  open: boolean;
  showToast: any;
}

const PipeLineCreatePopup: React.FC<PipeLineCreatePopupProps> = ({
  open,
  showToast,
  handleClose,
}) => {
  const { gitProjectList } = useSelector((state: RootState) => state.projectApi);
  const [showNotes, setShowNotes] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const methods = useForm({
    resolver: zodResolver(schema),
  });
  const { handleSubmit, control, formState: { isSubmitting } } = methods;

  const onSubmit = async (values: any) => {
    const response = await ApiService({
      portNumber: CATALOG_API_PORT,
      method: 'post',
      url: '/pipeline',
      data: values
    });
    if (response?.error) {
      showToast(response?.error, { color: 'red' });
    } else {
      dispatch(setBuildPipeLineDtl(response));
      showToast('Pipeline created successfully', { color: 'green' });
      navigate(`/designers/build-playground/${response?.pipeline_id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[40vw] h-[40vh]">
        <DialogHeader>
          <DialogTitle>Create Pipeline</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new pipeline.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="bh_project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          {field.value
                            ? gitProjectList.find(
                                (project: any) => project.bh_project_id === field.value
                              )?.bh_project_name
                            : 'Select Project'}
                        </SelectTrigger>
                        <SelectContent>
                          {gitProjectList.map((project: any) => (
                            <SelectItem key={project.bh_project_id} value={project.bh_project_id}>
                              {project.bh_project_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="pipeline_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNotes(!showNotes)}
              >
                Add Notes
              </Button>
              {showNotes && (
                <FormField
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Enter notes here..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <div className="mt-6 flex justify-center">
              <Button type="submit" disabled={isSubmitting}>
                Create Pipeline
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default PipeLineCreatePopup;
