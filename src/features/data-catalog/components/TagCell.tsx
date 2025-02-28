import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutFieldTags } from "@/types/data-catalog/dataCatalog";

interface Tag {
  key: string;
  value: string;
}

interface TagCellProps {
  tags?: LayoutFieldTags;
  fieldId: string | number;
}

export interface TagCellRef {
  addTag: (key: string, value: string) => void;
  removeTag: (key: string) => void;
}

export const TagCell = forwardRef<TagCellRef, TagCellProps>(
  function TagCell({ tags, fieldId }, ref) {
    const [isEditing, setIsEditing] = useState(false);
    const [newTagKey, setNewTagKey] = useState('');
    const [newTagValue, setNewTagValue] = useState('');
    const [localTags, setLocalTags] = useState<Tag[]>(
      tags?.tagList && tags.tagList.key ? [{ key: tags.tagList.key, value: tags.tagList.value }] : []
    );

    // Function to add a tag
    const addTag = useCallback((key: string, value: string) => {
      if (key.trim() === '') return;
      
      setLocalTags(prev => [...prev.filter(t => t.key !== key), { key, value }]);
      setIsEditing(false);
    }, []);

    // Function to remove a tag
    const removeTag = useCallback((key: string) => {
      setLocalTags(prev => prev.filter(t => t.key !== key));
    }, []);

    // Expose functions via ref
    useImperativeHandle(ref, () => ({
      addTag,
      removeTag
    }), [addTag, removeTag]);

    const handleTagKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newTagKey.trim() !== '' && newTagValue.trim() !== '') {
          addTag(newTagKey.trim(), newTagValue.trim());
          setNewTagKey('');
          setNewTagValue('');
        } else if (e.key === 'Escape') {
          setIsEditing(false);
          setNewTagKey('');
          setNewTagValue('');
        }
      },
      [newTagKey, newTagValue, addTag]
    );

    const handleStartEdit = () => setIsEditing(true);
    const handleCancelEdit = () => {
      setIsEditing(false);
      setNewTagKey('');
      setNewTagValue('');
    };

    // Only show tags that have non-empty keys
    const validTags = localTags.filter(tag => tag.key.trim() !== '');

    return (
      <div className="flex flex-wrap items-center gap-2">
        {validTags.map(({ key, value }) => (
          <Badge
            key={key}
            variant="secondary"
            className="h-6 rounded-sm bg-primary-lighter text-primary-dark text-xs flex items-center gap-1"
          >
            {key}: {value}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
              onClick={() => removeTag(key)}
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </Badge>
        ))}

        {isEditing ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Input
                value={newTagKey}
                placeholder="Key"
                className="h-8 w-20 border-b-2 border-primary bg-transparent text-sm focus-visible:ring-0"
                onChange={(e) => setNewTagKey(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <span className="text-muted-foreground">:</span>
              <Input
                value={newTagValue}
                placeholder="Value"
                className="h-8 w-20 border-b-2 border-primary bg-transparent text-sm focus-visible:ring-0"
                onChange={(e) => setNewTagValue(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleCancelEdit}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleStartEdit}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);
