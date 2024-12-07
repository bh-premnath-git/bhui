import { cn } from '@/lib/utils';

interface ModuleButtonProps {
  color: string;
  icon: string;
  label: string;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function ModuleButton({
  color,
  icon,
  label,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ModuleButtonProps) {
  return (
    <button
      className={cn(
        "group flex items-center rounded-lg transition-all duration-300 overflow-hidden",
        "hover:filter hover:brightness-110"
      )}
      style={{
        backgroundColor: color,
        width:  isHovered ? "auto" : "40px",
        padding: "8px",
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <img src={icon} alt={label} className="h-6 w-6 text-white shrink-0" />
      <span
        className={cn(
          "text-white ml-2 whitespace-nowrap transition-all duration-300",
           isHovered ? "opacity-100 max-w-[100px]" : "opacity-0 max-w-0"
        )}
      >
        {label}
      </span>
    </button>
  );
}