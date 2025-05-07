
import React, { useState, useRef, useEffect } from 'react';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { 
  Share2,
  GitBranch,
  Zap
} from 'lucide-react';
import { Note, ProcessedNote, CommandOption } from '@/types/data-catalog/notebook/note';
import { toast } from 'sonner';

interface CommandPaletteProps {
  note: Note;
  onProcess: (processedNote: ProcessedNote) => void;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  note, 
  onProcess,
  onClose 
}) => {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const calculateReadingTime = (text: string): string => {
    const words = text.trim().split(/\s+/).length;
    const wordsPerMinute = 200;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  const processOptions: CommandOption[] = [
    {
      id: 'create-pipeline',
      label: 'Create Pipeline',
      icon: GitBranch,
      description: 'Create a pipeline with the provided notes',
      action: (note: Note): ProcessedNote => {
        const contentLines = note.content.split('\n').filter(line => line.trim().length > 0);
        const steps = contentLines.map(line => line.trim().replace(/^\d+\.\s*/, ''));
        
        const wordCount = note.content.split(/\s+/).length;
        
        return {
          id: note.id,
          title: note.title,
          content: note.content,
          createdAt: note.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [...note.tags, 'pipeline'],
          summary: `Pipeline created with ${steps.length} steps`,
          wordCount,
          readingTime: calculateReadingTime(note.content),
          pipeline: {
            steps,
            description: `This pipeline was created from "${note.title}" and contains ${steps.length} steps.`
          }
        };
      }
    },
    {
      id: 'create-flow',
      label: 'Create Flow',
      icon: Share2,
      description: 'Create a flow diagram with the provided notes',
      action: (note: Note): ProcessedNote => {
        const contentLines = note.content.split('\n').filter(line => line.trim().length > 0);
        
        const nodes = contentLines
          .filter(line => !line.includes('->'))
          .map((line, index) => ({
            id: `node-${index}`,
            label: line.trim(),
            type: 'default'
          }));
        
        const edges = contentLines
          .filter(line => line.includes('->'))
          .map((line, index) => {
            const parts = line.split('->').map(part => part.trim());
            const sourceIndex = contentLines.findIndex(l => l.trim() === parts[0]);
            const targetIndex = contentLines.findIndex(l => l.trim() === parts[1]);
            
            return {
              source: `node-${sourceIndex !== -1 ? sourceIndex : 0}`,
              target: `node-${targetIndex !== -1 ? targetIndex : 1}`,
              label: parts.length > 2 ? parts[2] : ''
            };
          });
        
        const wordCount = note.content.split(/\s+/).length;
        
        return {
          id: note.id,
          title: note.title,
          content: note.content,
          createdAt: note.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [...note.tags, 'flow'],
          summary: `Flow created with ${nodes.length} nodes and ${edges.length} connections`,
          wordCount,
          readingTime: calculateReadingTime(note.content),
          flow: {
            nodes,
            edges
          }
        };
      }
    },
    {
      id: 'process-all',
      label: 'Process All',
      icon: Zap,
      description: 'Run all processing options at once',
      action: (note: Note): ProcessedNote => {
        // Define all the variables used in the return value
        const contentLines = note.content.split('\n').filter(line => line.trim().length > 0);
        const steps = contentLines.map(line => line.trim().replace(/^\d+\.\s*/, ''));
        
        const nodes = contentLines
          .filter(line => !line.includes('->'))
          .map((line, index) => ({
            id: `node-${index}`,
            label: line.trim(),
            type: 'default'
          }));
        
        const edges = contentLines
          .filter(line => line.includes('->'))
          .map((line, index) => {
            const parts = line.split('->').map(part => part.trim());
            const sourceIndex = contentLines.findIndex(l => l.trim() === parts[0]);
            const targetIndex = contentLines.findIndex(l => l.trim() === parts[1]);
            
            return {
              source: `node-${sourceIndex !== -1 ? sourceIndex : 0}`,
              target: `node-${targetIndex !== -1 ? targetIndex : 1}`,
              label: parts.length > 2 ? parts[2] : ''
            };
          });
        
        // Calculate word count and reading time
        const wordCount = note.content.split(/\s+/).length;
        const readingTime = calculateReadingTime(note.content);
        
        // Create minimal set of tags
        const uniqueTags = [...new Set([...note.tags, 'pipeline', 'flow'])];
        
        // Create generic summary
        const firstSentences = `Combined pipeline and flow processing for "${note.title}"`;
        
        return {
          id: note.id,
          title: note.title,
          content: note.content,
          createdAt: note.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
          tags: uniqueTags,
          summary: firstSentences,
          wordCount,
          readingTime,
          pipeline: {
            steps,
            description: `This pipeline was created from "${note.title}" and contains ${steps.length} steps.`
          },
          flow: {
            nodes,
            edges
          }
        };
      }
    }
  ];

  const filteredOptions = search
    ? processOptions.filter(option => 
        option.label.toLowerCase().includes(search.toLowerCase()) ||
        option.description.toLowerCase().includes(search.toLowerCase())
      )
    : processOptions;

  const handleSelect = (optionId: string) => {
    const option = processOptions.find(opt => opt.id === optionId);
    if (option) {
      try {
        const processed = option.action(note);
        onProcess(processed);
        toast.success(`Applied: ${option.label}`);
      } catch (error) {
        console.error('Processing error:', error);
        toast.error('Failed to process note');
      }
    }
    setOpen(false);
    onClose();
  };

  return (
    <div className="command-palette-overlay fixed inset-0 bg-background/80 backdrop-blur-sm animate-fade-in flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md mx-auto animate-slide-in">
        <Command className="rounded-lg border shadow-lg glassmorphism">
          <CommandInput 
            ref={inputRef}
            placeholder="Type a command..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Processing Options">
              {filteredOptions.map(option => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={handleSelect}
                  className="flex items-center gap-2 py-2"
                >
                  <option.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  );
};

export default CommandPalette;
