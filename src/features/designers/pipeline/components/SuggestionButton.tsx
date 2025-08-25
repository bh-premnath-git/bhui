import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface SuggestionButtonProps {
  text: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
  assistantColor?: string;
  index?: number;
}

const SuggestionButton = ({
  text,
  icon,
  onClick,
  variant = 'outline',
  className = '',
  assistantColor = "#009459", // Default color if not provided
  index = 0
}: SuggestionButtonProps) => {
  // Create a handler that directly executes the action without setting input
  const handleClick = () => {
    // Call the onClick handler directly
    onClick();
  };

  return (
    <motion.div
      className="mb-1 inline-flex"
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.05 }}
    >
      <div
        onClick={handleClick}
        className={`flex-shrink-0 flex items-center rounded-lg bg-gray-100 border border-border/40 px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-all duration-200 hover:shadow-md ${className}`}
        style={{ color: assistantColor }}
      >
        {icon ? (
          <span className="w-4 h-4 mr-1.5 flex-shrink-0">{icon}</span>
        ) : (
          <Zap className="w-4 h-4 mr-1.5 flex-shrink-0 transform rotate-12" style={{ color: "#E6B800", fill: "#E6B800" }} />
        )}
        <span className="truncate font-medium text-sm italic">{text}</span>
      </div>
    </motion.div>
  );
};

export default SuggestionButton;