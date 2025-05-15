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
      className="mb-2 flex flex-row justify-end align-middle items-center"
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 + index * 0.1 }}
    >
      <div
        onClick={handleClick}
        className={`w-80 flex flex-row justify-start align-middle items-center rounded-xl bg-gray-100 border border-border/40 px-4 py-2 cursor-pointer hover:bg-gray-200 transition-all duration-300 hover:shadow-md ${className}`}
        style={{ color: assistantColor }}
      >
        <Zap className="w-6 h-6 mr-2 flex-shrink-0 transform rotate-12" style={{ color: "#E6B800", fill: "#E6B800" }} />
        <span className="truncate font-medium">{text}</span>
      </div>
    </motion.div>
  );
};

export default SuggestionButton;