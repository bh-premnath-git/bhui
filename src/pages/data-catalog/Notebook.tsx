import NoteHeader from "@/features/data-catalog/NoteHeader";
import { NoteProvider } from '@/context/datacatalog/NotebookContext';
import NoteEditor from "@/features/data-catalog/NotebookEditor";

const Notebook = () => {
  return (
    <NoteProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-50">
        <NoteHeader />
        <main className="flex-1 flex flex-col overflow-hidden">
          <NoteEditor />
        </main>
      </div>
    </NoteProvider>
  );
};

export default Notebook
