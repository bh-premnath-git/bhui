
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChipColor = "error" | "success" | "warning" | "default";
export type ChipSize = "small" | "medium";

export interface ChipProps {
  label: string;
  /** Determines the background/text color styling */
  color?: ChipColor;
  /** Sets the chip’s size */
  size?: ChipSize;
  /** Optional delete action */
  onDelete?: () => void;
}

export function Chip({
  label,
  color = "default",
  size = "medium",
  onDelete,
}: ChipProps) {
  // Define Tailwind classes for each color variant for light and dark themes.
  const colorClasses: Record<ChipColor, string> = {
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    default:
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  // Define padding/font-size for each size option.
  const sizeClasses: Record<ChipSize, string> = {
    small: "px-2 py-0.5 text-xs",
    medium: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors",
        colorClasses[color],
        sizeClasses[size]
      )}
    >
      {label}
      {onDelete && (
        <button
          onClick={onDelete}
          className="ml-2 inline-flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
