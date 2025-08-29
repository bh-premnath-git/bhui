interface SqlViewerProps {
  query: string;
}

export const SqlViewer = ({ query }: SqlViewerProps) => {
  return (
    <div className="h-full flex flex-col">
      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">SQL Query</h4>
      <div className="bg-accent/50 rounded-md p-2 flex-1 overflow-auto">
        <pre className="text-xs font-mono text-accent-foreground whitespace-pre-wrap">
          {query}
        </pre>
      </div>
    </div>
  );
};