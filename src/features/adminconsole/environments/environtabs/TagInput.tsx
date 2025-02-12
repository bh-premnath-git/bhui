/**
 * @file TagInput.tsx
 *
 * A component to let the user add/remove key/value tags.
 */
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, X } from "lucide-react";
import { Tag } from "@/types/features/environment/types";

interface TagInputProps {
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagKey, setTagKey] = useState("");
  const [tagValue, setTagValue] = useState("");

  // Remove a single tag from a group
  const removeTag = (tagIndex: number, itemIndex: number) => {
    setTags((prevTags) => {
      return prevTags
        .map((tag, i) => {
          if (i === tagIndex && tag && tag.tagList.length > 1) {
            return {
              tagList: tag.tagList.filter((_, j) => j !== itemIndex),
            };
          }
          // If the tag only had one item, removing it becomes null.
          return i === tagIndex ? null : tag;
        })
        .filter(Boolean);
    });
  };

  // Add a new tag group with one key/value pair
  const addTag = () => {
    if (tagKey && tagValue) {
      setTags((prevTags) => [
        ...prevTags,
        { tagList: [{ key: tagKey, value: tagValue }] },
      ]);
      setTagKey("");
      setTagValue("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-700">
        Add tags to help identify compute instances in your cloud account.
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) =>
          tag !== null
            ? tag.tagList.map((item, itemIndex) => (
                <Badge
                  key={`${index}-${itemIndex}`}
                  variant="secondary"
                  className="px-2 py-1 flex items-center bg-gray-100 text-gray-800 border border-gray-300 rounded-md shadow-sm"
                >
                  {`${item.key}: ${item.value}`}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-4 w-4 p-0"
                    onClick={() => removeTag(index, itemIndex)}
                  >
                    <X className="h-3 w-3 text-gray-600" />
                  </Button>
                </Badge>
              ))
            : null
        )}
      </div>

      {/* Modal Dialog to add a new tag */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center space-x-2 text-emerald-600 border-emerald-500 hover:bg-emerald-50"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Tag</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[385px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add New Tag
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="tagKey" className="text-sm font-medium text-gray-800">
                Key
              </Label>
              <Input
                id="tagKey"
                value={tagKey}
                onChange={(e) => setTagKey(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="e.g. environment"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="tagValue" className="text-sm font-medium text-gray-800">
                Value
              </Label>
              <Input
                id="tagValue"
                value={tagValue}
                onChange={(e) => setTagValue(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="e.g. production"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              onClick={addTag}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
