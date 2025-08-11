import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface KeyValueEditorProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  placeholder?: string;
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  value,
  onChange,
  placeholder = "Add item"
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');



  const addKeyValue = () => {
    if (newKey.trim() && newValue.trim()) {
      const updatedValue = {
        ...value,
        [newKey.trim()]: newValue.trim()
      };

      onChange(updatedValue);
      setNewKey('');
      setNewValue('');
    }
  };

  const removeKeyValue = (keyToRemove: string) => {
    const updatedValue = { ...value };
    delete updatedValue[keyToRemove];
    onChange(updatedValue);
  };

  const updateKeyValue = (oldKey: string, newKey: string, newValue: string) => {
    const updatedValue = { ...value };
    
    // If key changed, remove old key and add new one
    if (oldKey !== newKey) {
      delete updatedValue[oldKey];
    }
    
    updatedValue[newKey] = newValue;

    onChange(updatedValue);
  };

  const entries = Object.entries(value || {});

  return (
    <div className="space-y-2">
      {/* Existing key-value pairs */}
      {entries.map(([key, val], index) => (
        <div key={`${key}-${index}`} className="flex gap-2 items-center p-2 bg-muted/50 rounded border">
          <Input
            placeholder="Key"
            value={key}
            onChange={(e) => updateKeyValue(key, e.target.value, val)}
            className="flex-1 h-8 text-xs"
          />
          <Input
            placeholder="Value"
            value={val?.toString() || ''}
            onChange={(e) => updateKeyValue(key, key, e.target.value)}
            className="flex-1 h-8 text-xs"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeKeyValue(key)}
            className="text-destructive hover:text-destructive h-8 w-8 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ))}

      {/* Add new key-value pair */}
      <div className="flex gap-2 items-center p-2 border border-dashed rounded bg-background">
        <Input
          placeholder="Parameter name"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="flex-1 h-8 text-xs"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addKeyValue();
            }
          }}
        />
        <Input
          placeholder="Parameter value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1 h-8 text-xs"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addKeyValue();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addKeyValue}
          disabled={!newKey.trim() || !newValue.trim()}
          className="h-8 w-8 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {entries.length === 0 && !newKey && !newValue && (
        <div className="text-center py-3 text-muted-foreground text-xs">
          No parameters added yet
        </div>
      )}
    </div>
  );
};