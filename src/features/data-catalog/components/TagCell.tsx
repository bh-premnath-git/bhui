import { useState, useCallback } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagCellProps {
  tags: Record<string, string>;
  onAddTag: (key: string, value: string) => void;
  onRemoveTag: (key: string) => void;
}

export function TagCell({ tags, onAddTag, onRemoveTag }: TagCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTagKey, setNewTagKey] = useState('');
  const [newTagValue, setNewTagValue] = useState('');

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && newTagKey.trim() !== '' && newTagValue.trim() !== '') {
        onAddTag(newTagKey.trim(), newTagValue.trim());
        setNewTagKey('');
        setNewTagValue('');
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        setNewTagKey('');
        setNewTagValue('');
      }
    },
    [newTagKey, newTagValue, onAddTag]
  );

  const handleStartEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewTagKey('');
    setNewTagValue('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {Object.entries(tags).map(([key, value]) => (
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
            onClick={() => onRemoveTag(key)}
          >
            <X className="h-3 w-3" />
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
            <X className="h-4 w-4" />
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
