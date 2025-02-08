interface ErrorStateProps {
  message: string;
}

export const ErrorState = ({ message }: ErrorStateProps) => {
  return (
    <div className="flex items-center justify-center h-24">
      <div className="text-red-500">{message}</div>
    </div>
  );
};