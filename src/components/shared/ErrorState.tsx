interface ErrorStateProps {
  title?: string;
  description?: string;
  message?: string;
}

export const ErrorState = ({ title, description, message }: ErrorStateProps) => {
  // If message is provided, use it as both title and description
  const displayTitle = title || message || "Error";
  const displayDescription = description || (title ? message : undefined);

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
      <div className="text-lg font-semibold text-destructive">{displayTitle}</div>
      {displayDescription && (
        <div className="text-sm text-muted-foreground">{displayDescription}</div>
      )}
    </div>
  );
};