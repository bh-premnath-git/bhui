import {  Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/context/datacatalog/NotebookContext';

const NoteHeader = () => {
    const { createNote } = useNotes();

    return (
      <header className="border-b glassmorphism backdrop-blur-md sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={createNote} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Notebook
            </Button>
          </div>
        </div>
      </header>
    );
  };

export default NoteHeader
