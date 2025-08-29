import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Note, ProcessedNote } from '@/types/data-catalog/notebook/note';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

interface NoteContextType {
    notes: Note[];
    currentNote: Note | null;
    processedNote: ProcessedNote | null;
    createNote: () => void;
    updateNote: (id: string, data: Partial<Note>) => void;
    processNote: (note: Note) => ProcessedNote;
    deleteNote: (id: string) => void;
    setCurrentNote: (note: Note | null) => void;
    saveProcessedNote: (note: ProcessedNote) => void;
    setProcessedNote: (note: ProcessedNote | null) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

const calculateReadingTime = (text: string): string => {
    const words = text.trim().split(/\s+/).length;
    const wordsPerMinute = 200;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
};

export const NoteProvider = ({ children }: { children: ReactNode }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [processedNote, setProcessedNote] = useState<ProcessedNote | null>(null);

    // Load notes from localStorage on mount
    useEffect(() => {
        try {
            const savedNotes = localStorage.getItem('notes');
            if (savedNotes) {
                const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
                    ...note,
                    createdAt: new Date(note.createdAt),
                    updatedAt: new Date(note.updatedAt)
                }));
                setNotes(parsedNotes);
            }
        } catch (error) {
            console.error('Failed to load notes:', error);
            toast.error('Failed to load saved notes');
        }
    }, []);

    // Save notes to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('notes', JSON.stringify(notes));
    }, [notes]);

    const createNote = () => {
        const newNote: Note = {
            id: uuidv4(),
            title: 'Untitled Note',
            content: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: []
        };

        setNotes([newNote, ...notes]);
        setCurrentNote(newNote);
        setProcessedNote(null);
        toast.success('New note created');
    };

    const updateNote = (id: string, data: Partial<Note>) => {
        const updatedNotes = notes.map(note =>
            note.id === id
                ? { ...note, ...data, updatedAt: new Date() }
                : note
        );

        setNotes(updatedNotes);

        if (currentNote && currentNote.id === id) {
            setCurrentNote({ ...currentNote, ...data, updatedAt: new Date() });
        }

        toast.success('Note updated');
    };

    const processNote = (note: Note): ProcessedNote => {
        // Basic processing
        const wordCount = note.content.trim().split(/\s+/).length;
        const readingTime = calculateReadingTime(note.content);

        // Extract title from first line if not set explicitly
        let title = note.title;
        if (title === 'Untitled Note' && note.content.trim()) {
            const firstLine = note.content.trim().split('\n')[0];
            title = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
        }

        // Extract tags from content (words prefixed with #)
        const tags = [...new Set([
            ...note.tags,
            ...(note.content.match(/#[a-zA-Z0-9_]+/g) || []).map(tag => tag.substring(1))
        ])];

        const processedNote: ProcessedNote = {
            id: note.id,
            title,
            content: note.content,
            createdAt: note.createdAt.toISOString(),
            updatedAt: new Date().toISOString(),
            tags,
            wordCount,
            readingTime,
            // Generate a simple summary (first 100 characters)
            summary: note.content.length > 100
                ? note.content.substring(0, 100) + '...'
                : note.content
        };

        setProcessedNote(processedNote);
        toast.success('Note processed');
        return processedNote;
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter(note => note.id !== id));
        if (currentNote && currentNote.id === id) {
            setCurrentNote(null);
            setProcessedNote(null);
        }
        toast.success('Note deleted');
    };

    const saveProcessedNote = (note: ProcessedNote) => {
        // Convert the processed note back to a regular note
        const updatedNote: Note = {
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(),
            tags: note.tags
        };

        // Update in the notes array
        const noteIndex = notes.findIndex(n => n.id === note.id);
        if (noteIndex >= 0) {
            const updatedNotes = [...notes];
            updatedNotes[noteIndex] = updatedNote;
            setNotes(updatedNotes);
        } else {
            setNotes([updatedNote, ...notes]);
        }

        setCurrentNote(updatedNote);
        setProcessedNote(null);
        toast.success('Note saved');
    };

    const value = {
        notes,
        currentNote,
        processedNote,
        createNote,
        updateNote,
        processNote,
        deleteNote,
        setCurrentNote,
        saveProcessedNote,
        setProcessedNote
    };

    return (
        <NoteContext.Provider value={value}>
            {children}
        </NoteContext.Provider>
    );
};

export const useNotes = () => {
    const context = useContext(NoteContext);
    if (context === undefined) {
        throw new Error('useNotes must be used within a NoteProvider');
    }
    return context;
};
