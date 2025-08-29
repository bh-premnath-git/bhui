import { cn } from "@/lib/utils";

interface PanelLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PanelLayout({ children, className, ...props }: PanelLayoutProps) {
  return (
    <div 
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}