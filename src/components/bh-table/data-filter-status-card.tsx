
import { Card } from "@/components/ui/card"
import { Check, XCircle, Clock } from 'lucide-react'
import { cn } from "@/lib/utils"
import { StatsCardsProps } from "@/types/data-table.types"

const hexToRGBA = (hex: string, alpha: number): string => {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function DataTableStatusFilter({ data, selectedStatuses, onStatusSelect }: StatsCardsProps) {
  const total = data.success + data.failed + data.inProgress

  const stats = [
    {
      title: "Success",
      value: data.success,
      percentage: ((data.success / total) * 100).toFixed(1),
      color: "rgb(132, 204, 162)",
      background: hexToRGBA("#84cca2", 0.2),
      icon: Check,
      status: "success"
    },
    {
      title: "Failed",
      value: data.failed,
      percentage: ((data.failed / total) * 100).toFixed(1),
      color: "rgb(255, 178, 178)",
      background: hexToRGBA("#ffb2b2", 0.2),
      icon: XCircle,
      status: "failed"
    },
    {
      title: "In Progress",
      value: data.inProgress,
      percentage: ((data.inProgress / total) * 100).toFixed(1),
      color: "rgb(255, 207, 169)",
      background: hexToRGBA("#ffcfa9", 0.2),
      icon: Clock,
      status: "in progress"
    },
  ]

  return (
    <div className="flex gap-4">
      {stats.map((stat) => {
        const isSelected = selectedStatuses.includes(stat.status);
        const strokeDashoffset = 100 - parseFloat(stat.percentage);

        return (
          <Card 
            key={stat.title} 
            className={cn(
              "p-4 cursor-pointer transition-all duration-200 flex items-center gap-3 relative w-[200px]",
              isSelected 
                ? "ring-2 ring-primary shadow-lg"
                : "shadow-none"
            )}
            onClick={() => {
              onStatusSelect(stat.status)
            }}
          >
            <div className="relative h-16 w-16 flex-shrink-0">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={stat.background}
                  strokeWidth="4"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={stat.color}
                  strokeWidth="4"
                  strokeDasharray="100"
                  strokeDashoffset={strokeDashoffset.toString()}
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">{stat.title}</p>
              <p className="text-lg font-bold truncate">{stat.value}</p>
              <p className="text-xs text-muted-foreground truncate">{stat.percentage}%</p>
            </div>
            {isSelected && (
              <XCircle
                className="absolute top-1 right-1 cursor-pointer h-3 w-3 text-gray-700 hover:text-red-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusSelect(stat.status);
                }}
              />
            )}
          </Card>
        );
      })}
    </div>
  )
}
