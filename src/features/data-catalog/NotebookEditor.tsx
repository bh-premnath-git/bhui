import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import CommandPalette from './components/CommandPalette';
import {  ProcessedNote } from '@/types/data-catalog/notebook/note';
import { FilePlus2, ChevronLeft, GitBranch, Share2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNotes } from '@/context/datacatalog/NotebookContext';
import EditorToolbar from './components/EditorToolbar';

const NoteEditor: React.FC = () => {
  const { 
    currentNote, 
    updateNote, 
    processedNote,
    createNote, 
    deleteNote,
    saveProcessedNote,
    setProcessedNote,
    setCurrentNote,
    notes 
  } = useNotes();
  
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(true);

  // Update local state when currentNote changes
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setIsEditing(true);
    } else {
      setTitle('');
      setContent('');
    }
  }, [currentNote]);

  // Auto-focus the content area
  useEffect(() => {
    if (isEditing && contentRef.current && !processedNote) {
      contentRef.current.focus();
    }
  }, [isEditing, currentNote, processedNote]);

  const handleSave = () => {
    if (!currentNote) return;
    
    updateNote(currentNote.id, {
      title,
      content
    });
    
    toast.success('Note saved');
  };

  const handleProcess = () => {
    if (!currentNote) return;
    
    // First save any changes
    updateNote(currentNote.id, {
      title,
      content
    });
    
    setShowCommandPalette(true);
  };

  const handleProcessedNote = (processed: ProcessedNote) => {
    setProcessedNote(processed);
    setIsEditing(false);
  };

  const handleSaveProcessed = () => {
    if (!processedNote) return;
    saveProcessedNote(processedNote);
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (!currentNote) return;
    deleteNote(currentNote.id);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for '/' at the beginning of the line to trigger command palette
    if (e.key === '/' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const cursorPosition = e.currentTarget.selectionStart;
      const textBeforeCursor = content.substring(0, cursorPosition);
      
      // Check if the cursor is at the start of a line (either at the beginning of the text or after a newline)
      if (cursorPosition === 0 || textBeforeCursor.endsWith('\n')) {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    }
  };

  const handleAddBullets = () => {
    if (!contentRef.current) return;

    // Get the current selection
    const selectionStart = contentRef.current.selectionStart;
    const selectionEnd = contentRef.current.selectionEnd;
    
    // If there's selected text, convert each line to a bullet point
    if (selectionStart !== selectionEnd) {
      // Get the selected text
      const selectedText = content.substring(selectionStart, selectionEnd);
      
      // Split into lines and add bullets
      const bulletedText = selectedText
        .split('\n')
        .map(line => line.trim() ? `• ${line}` : line)
        .join('\n');
      
      // Replace the selected text with the bulleted text
      const newContent = 
        content.substring(0, selectionStart) + 
        bulletedText + 
        content.substring(selectionEnd);
      
      setContent(newContent);
      
      // Set cursor position after the modification
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.selectionStart = selectionStart;
          contentRef.current.selectionEnd = selectionStart + bulletedText.length;
          contentRef.current.focus();
        }
      }, 0);
      
      toast.success('Text converted to bullet points');
    } else {
      // If no text is selected, insert a bullet point at the cursor position
      const cursorPosition = selectionStart;
      const newContent = 
        content.substring(0, cursorPosition) + 
        '• ' + 
        content.substring(cursorPosition);
      
      setContent(newContent);
      
      // Position cursor after the bullet point
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.selectionStart = cursorPosition + 2;
          contentRef.current.selectionEnd = cursorPosition + 2;
          contentRef.current.focus();
        }
      }, 0);
    }
  };

  const renderEditor = () => (
    <Card className="w-full h-full flex flex-col overflow-hidden animate-fade-in bg-white/95 shadow-sm glassmorphism">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="text-lg font-medium border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto pb-0">
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          placeholder="Start typing... (Use '/' at the beginning of a line to open command palette)"
          className="note-editor w-full h-full min-h-[300px] resize-none border-none bg-transparent focus:outline-none text-base"
        />
      </CardContent>
      <CardFooter className="flex-shrink-0">
        <EditorToolbar
          onBack={() => setCurrentNote(null)}
          onSave={handleSave}
          onProcess={handleProcess}
          onDelete={handleDelete}
          onAddBullets={handleAddBullets}
          hasContent={!!content.trim()}
        />
      </CardFooter>
    </Card>
  );

  const renderProcessedView = () => {
    if (!processedNote) return null;
    
    return (
      <Card className="w-full h-full overflow-hidden flex flex-col animate-fade-in glassmorphism">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">{processedNote.title}</h2>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="mr-2">{processedNote.wordCount} words</span>
              <span>{processedNote.readingTime}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto pb-0">
          <div className="space-y-6">
            {processedNote.summary && (
              <div className="bg-secondary/50 p-3 rounded-md">
                <p className="text-sm font-medium">Summary</p>
                <p className="text-sm">{processedNote.summary}</p>
              </div>
            )}
            
            {processedNote.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {processedNote.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {processedNote.pipeline && (
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="h-4 w-4" />
                  <p className="text-sm font-medium">Pipeline</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{processedNote.pipeline.description}</p>
                <ol className="space-y-2 pl-5">
                  {processedNote.pipeline.steps.map((step, index) => (
                    <li key={index} className="text-sm">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            
            {processedNote.flow && (
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Share2 className="h-4 w-4" />
                  <p className="text-sm font-medium">Flow</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <p className="text-xs font-medium mb-1">Nodes</p>
                    <ul className="text-xs space-y-1 pl-4">
                      {processedNote.flow.nodes.map((node, i) => (
                        <li key={i}>{node.label}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {processedNote.flow.edges.length > 0 && (
                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="text-xs font-medium mb-1">Connections</p>
                      <ul className="text-xs space-y-1 pl-4">
                        {processedNote.flow.edges.map((edge, i) => {
                          const sourceNode = processedNote.flow?.nodes.find(n => n.id === edge.source);
                          const targetNode = processedNote.flow?.nodes.find(n => n.id === edge.target);
                          return (
                            <li key={i}>
                              {sourceNode?.label || edge.source} → {targetNode?.label || edge.target}
                              {edge.label && ` (${edge.label})`}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium mb-2">Content</p>
              <div className="whitespace-pre-wrap">{processedNote.content}</div>
            </div>
            
            <div className="border rounded-md p-4 bg-muted/30">
              <p className="text-sm font-medium mb-2">JSON Preview</p>
              <pre className="text-xs overflow-auto p-2 bg-muted rounded-md">
                {JSON.stringify(processedNote, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-white/50 backdrop-blur-sm p-2">
          <Button variant="ghost" size="sm" onClick={() => { setProcessedNote(null); setIsEditing(true); }}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to editing
          </Button>
          <Button variant="default" size="sm" onClick={handleSaveProcessed}>
            <Save className="h-4 w-4 mr-1" />
            Create Note
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
      <div className="text-center space-y-4 max-w-md mx-auto p-8 rounded-lg glassmorphism">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome to Notes</h2>
        <p className="text-muted-foreground">
          Create beautiful notes, process them with powerful commands, and preview the structured data.
        </p>
        <Button onClick={createNote} className="mt-4">
          <FilePlus2 className="h-4 w-4 mr-2" />
          Create a new note
        </Button>
        
        {notes.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-medium mb-2">Recent notes</p>
            <div className="space-y-2">
              {notes.slice(0, 3).map(note => (
                <div 
                  key={note.id}
                  onClick={() => setCurrentNote(note)}
                  className="p-3 rounded-md bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                >
                  <p className="font-medium truncate">{note.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {note.content.substring(0, 60)}{note.content.length > 60 ? '...' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn(
      "flex-1 overflow-hidden p-4 transition-all duration-300",
      currentNote ? "h-full" : "h-full"
    )}>
      {!currentNote && renderEmptyState()}
      {currentNote && isEditing && renderEditor()}
      {currentNote && !isEditing && processedNote && renderProcessedView()}
      
      {showCommandPalette && currentNote && (
        <CommandPalette
          note={currentNote}
          onProcess={handleProcessedNote}
          onClose={() => setShowCommandPalette(false)}
        />
      )}
    </div>
  );
};

export default NoteEditor;
