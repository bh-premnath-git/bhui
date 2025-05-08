import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NameEditorProps {
  initialName: string;
  onSave: (newName: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export const NameEditor: React.FC<NameEditorProps> = ({
  initialName,
  onSave,
  placeholder = 'Name...',
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(initialName);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setTempName(initialName);
  }, [initialName]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(e.target.value);
    setErrorMessage('');
  };

  const handleRename = async () => {
    try {
      if (tempName !== initialName) {
        await onSave(tempName);
      }
      setIsEditing(false);
    } catch (error) {
      setErrorMessage('Failed to update name');
      console.error('Error updating name:', error);
    }
  };

  return (
    <div className={cn("relative flex-grow sm:w-40", className)}>
      {isEditing ? (
        <>
          <Input
            type="text"
            value={tempName}
            onChange={handleNameChange}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRename();
              }
            }}
            className={cn(
              "pr-12 h-9",
              !isEditing && "border-transparent bg-transparent hover:border-input focus:border-input",
              isEditing && "outline-none focus:ring-2 focus:ring-offset-0 focus:ring-black/80 border-gray-300"
            )}
            autoFocus
            aria-label="Edit name"
          />
          {errorMessage && (
            <div className="text-red-500 text-sm mt-1">
              {errorMessage}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center">
          <span className="flex-grow truncate pr-8">{initialName || placeholder}</span>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-full h-7 w-7 p-1.5"
            onClick={() => setIsEditing(true)}
            aria-label="Edit name"
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}
    </div>
  );
};