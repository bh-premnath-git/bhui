import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RequirementStatus } from '@/utils/mockData';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: RequirementStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    [RequirementStatus.COMPLETED]: {
      label: 'Completed',
      variant: 'default' as const,
      className: 'bg-green-500 hover:bg-green-600 text-white',
      icon: CheckCircle,
    },
    [RequirementStatus.IN_PROGRESS]: {
      label: 'In Progress',
      variant: 'default' as const,
      className: '',
      icon: Clock,
    },
    [RequirementStatus.PENDING]: {
      label: 'Pending User Input',
      variant: 'outline' as const,
      className: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200',
      icon: AlertCircle,
    },
  };

  const { label, variant, className, icon: Icon } = config[status];

  return (
    <Badge 
      variant={variant} 
      className={cn(
        "gap-1 font-normal",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default StatusBadge;