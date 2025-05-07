import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Tag {
  tagList: { key: string; value: string }[];
}

interface TagInputProps {
  tags: Tag;
  setTags: React.Dispatch<React.SetStateAction<Tag>>;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    if (inputValue.trim()) {
      // Split by : to get key-value pair, default to the input as both key and value if no : is present
      const [key, value] = inputValue.includes(':') 
        ? inputValue.split(':', 2) 
        : [inputValue, inputValue];
      
      setTags(prev => ({
        tagList: [...prev.tagList, { key: key.trim(), value: value.trim() }]
      }));
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (index: number) => {
    setTags(prev => ({
      tagList: prev.tagList.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Tags</label>
        <span className="text-xs text-gray-500">(Optional)</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.tagList.map((tag, index) => (
          <div 
            key={index} 
            className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm"
          >
            <span>{tag.key}{tag.value !== tag.key ? `:${tag.value}` : ''}</span>
            <button 
              onClick={() => removeTag(index)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tag (e.g. category:analytics)"
          className="flex-1"
        />
        <Button 
          onClick={handleAddTag}
          variant="outline"
          size="icon"
          className="h-10 w-10"
          disabled={!inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
