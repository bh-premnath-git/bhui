import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ITagManagerProps {
  tags: { tagKey: string; tagValue: string }[];
  setTags: React.Dispatch<React.SetStateAction<{ tagKey: string; tagValue: string }[]>>;
}

export function TagManager({ tags, setTags }: ITagManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');

  // Add new tag
  const addTag = () => {
    if (tagKey && tagValue) {
      setTags([...tags, { tagKey, tagValue }]);
      setTagKey('');
      setTagValue('');
      setIsModalOpen(false);
    }
  };

  // Remove tag
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="p-3 rounded bg-inherit border space-y-2">
      <div className="flex justify-between items-center mb-1">
        <div>
          <Label className="text-base font-medium">Tags</Label>
          <p className="text-xs text-gray-700 mt-1">
            Add tags to identify compute instances.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center text-xs font-medium px-2 py-1">
              <PlusCircle className="mr-1 h-3 w-3" />
              Add Tag
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[300px] rounded-md bg-inherit text-inherit border border-gray-300 p-3">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Add a New Tag</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="tagKey" className="text-sm font-medium">
                  Tag Key
                </Label>
                <Input
                  id="tagKey"
                  value={tagKey}
                  onChange={(e) => setTagKey(e.target.value)}
                  className="border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400 h-8"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <Label htmlFor="tagValue" className="text-sm font-medium">
                  Tag Value
                </Label>
                <Input
                  id="tagValue"
                  value={tagValue}
                  onChange={(e) => setTagValue(e.target.value)}
                  className="border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400 h-8"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                onClick={addTag}
                className="w-full bg-black text-white hover:bg-gray-800 h-8 text-sm"
              >
                Add Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-1 min-h-[40px] bg-gray-50 p-1 rounded border border-gray-200">
        {tags.length === 0 ? (
          <p className="text-gray-400 text-xs">No tags added yet</p>
        ) : (
          tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-2 py-1 text-xs bg-gray-100 text-black border border-gray-300 flex items-center"
            >
              {`${tag.tagKey}: ${tag.tagValue}`}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                onClick={() => removeTag(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}