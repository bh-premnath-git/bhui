
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { EnvironmentMutationData } from '../types/environment.types';

interface EnvironmentFormProps {
  initialData?: EnvironmentMutationData;
  onSubmit: (data: EnvironmentMutationData) => void;
  onCancel: () => void;
}

export function EnvironmentForm({ initialData, onSubmit, onCancel }: EnvironmentFormProps) {
  const form = useForm<EnvironmentMutationData>({
    defaultValues: initialData || {
      name: '',
      description: '',
      status: 'active',
      type: 'development'
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-card border rounded-lg divide-y">
          {/* Environment Details Section */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-blue-600 mb-4">Environment Details</h3>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. My Dev Env" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment Type <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your environment"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Platform Selection */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-green-600 mb-4">Select Platform</h3>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-muted-foreground text-sm">No platform selected</p>
            </div>
          </div>

          {/* Credentials Section */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-orange-600 mb-4">Credentials</h3>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-muted-foreground text-sm">No credentials configured</p>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-purple-600 mb-4">Advanced Settings</h3>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-muted-foreground text-sm">No advanced settings configured</p>
            </div>
          </div>

          {/* Tags Section */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-pink-600 mb-4">Tags</h3>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-muted-foreground text-sm">No tags added</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Environment
          </Button>
        </div>
      </form>
    </Form>
  );
}
