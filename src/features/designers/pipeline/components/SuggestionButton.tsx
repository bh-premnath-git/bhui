import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface SuggestionButtonProps {
  text: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
}

const SuggestionButton = ({
  text,
  icon,
  onClick,
  variant = 'outline',
  className = ''
}: SuggestionButtonProps) => {
  // Create a handler that directly executes the action without setting input
  const handleClick = () => {
    // Call the onClick handler directly
    onClick();
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleClick}
      className={`mr-2 mb-2 flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate font-medium">{text}</span>
    </Button>
  );
};

export default SuggestionButton;