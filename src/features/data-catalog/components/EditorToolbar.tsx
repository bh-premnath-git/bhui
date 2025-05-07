
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Trash, ChevronLeft, Command, ListPlus } from 'lucide-react';

interface EditorToolbarProps {
  onBack: () => void;
  onSave: () => void;
  onProcess: () => void;
  onDelete: () => void;
  onAddBullets: () => void;
  hasContent: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onBack,
  onSave,
  onProcess,
  onDelete,
  onAddBullets,
  hasContent
}) => {
  return (
    <div className="flex justify-between border-t bg-white/50 backdrop-blur-sm p-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddBullets}
          title="Convert text to bullet points"
        >
          <ListPlus className="h-4 w-4 mr-1" />
          Bulletize
        </Button>
        <Button variant="outline" size="sm" onClick={onProcess} disabled={!hasContent}>
          <Command className="h-4 w-4 mr-1" />
          Process
        </Button>
        <Button variant="outline" size="sm" onClick={onSave} disabled={!hasContent}>
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default EditorToolbar;
