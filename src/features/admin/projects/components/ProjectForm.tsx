
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectMutationData } from '../types/project.types';

interface ProjectFormProps {
  initialData?: ProjectMutationData;
  onSubmit: (data: ProjectMutationData) => void;
  mode?: 'create' | 'edit';
}

export function ProjectForm({ initialData, onSubmit, mode = 'create' }: ProjectFormProps) {
  const form = useForm<ProjectMutationData>({
    defaultValues: initialData || {
      name: '',
      description: '',
      status: 'active',
      type: 'development',
      gitProvider: '',
      gitUsername: '',
      gitEmail: '',
      defaultBranch: 'main',
      gitHubUrl: '',
      gitHubToken: '',
      tags: []
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="p-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter project name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="border-t">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Repository Details</h3>
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gitProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Git Provider <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="gitlab">GitLab</SelectItem>
                          <SelectItem value="bitbucket">Bitbucket</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gitUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Git Username <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gitEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Git Email <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="user@github.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultBranch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Branch</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. main" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="gitHubUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/username/repository" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gitHubToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Token <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="border-t">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Tags</h3>
              <Button type="button" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">Add tags to identify compute instances.</p>
            <div className="mt-4 p-4 border rounded-md bg-muted/50">
              <p className="text-muted-foreground text-sm">No tags added yet</p>
            </div>
          </div>
        </div>

        <div className="border-t p-6">
          <div className="flex justify-end">
            <Button type="submit">
              {mode === 'create' ? 'Create Project' : 'Update Project'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
