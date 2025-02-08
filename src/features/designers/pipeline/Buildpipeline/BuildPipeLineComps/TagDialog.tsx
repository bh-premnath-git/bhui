import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface Tag {
  tagKey: string;
  tagValue: string;
}

interface TagDialogProps {
  isOpen: boolean;
  closeDialog: () => void;
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
}

// Validation schema for the form
const tagSchema = z.object({
  tagKey: z.string().nonempty('Tag Key is required'),
  tagValue: z.string().nonempty('Tag Value is required'),
});

const TagDialog: React.FC<TagDialogProps> = ({ isOpen, closeDialog, tags, setTags }) => {
  const form = useForm<Tag>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      tagKey: '',
      tagValue: '',
    },
  });

  const onSubmit = (values: Tag) => {
    setTags([...tags, values]);
    form.reset();
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tags</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tagKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Tag Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tagValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag Value</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Tag Value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Close
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Add
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TagDialog;
