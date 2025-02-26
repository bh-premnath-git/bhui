import { useParams } from 'react-router-dom';

export function BuildPlaygroundHeader() {
  const { id } = useParams();

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Build Playground</h2>
        <span className="text-muted-foreground">ID: {id}</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Add your playground-specific controls here */}
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Save
        </button>
        <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
          Deploy
        </button>
      </div>
    </div>
  );
}
