import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TagInputProps } from './types';

export const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagKey, setTagKey] = useState("");
  const [tagValue, setTagValue] = useState("");

  const removeTag = (itemIndex: number) => {
    setTags(prevTags => ({
      tagList: prevTags.tagList.filter((_, index) => index !== itemIndex)
    }));
  };

  const addTag = () => {
    if (tagKey && tagValue) {
      setTags(prevTags => ({
        tagList: [...prevTags.tagList, { key: tagKey, value: tagValue }]
      }));
      setTagKey("");
      setTagValue("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Add tags to help organize and identify your flows
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.tagList.map((item, index) => (
          <Badge key={index} variant="secondary" className="px-2 py-1 text-white">
            {`${item.key} >> ${item.value}`}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0"
              onClick={() => removeTag(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center text-emerald-500 hover:text-emerald-600 transition-colors duration-200"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            ADD TAG
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[385px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Tag</DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="tagKey" className="text-sm font-medium">
                Key
              </Label>
              <Input
                id="tagKey"
                value={tagKey}
                onChange={(e) => setTagKey(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="tagValue" className="text-sm font-medium">
                Value
              </Label>
              <Input
                id="tagValue"
                value={tagValue}
                onChange={(e) => setTagValue(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={addTag} className="w-full bg-black text-white hover:bg-gray-800">
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};