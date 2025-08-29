import React from 'react';
import { CheckCircle, Clock, Hourglass } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Completed' | 'In Progress' | 'Pending for User Inputs';
}

const statusMap = {
  'Completed': {
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="w-4 h-4 mr-1 text-green-500" />,
    label: 'Completed',
  },
  'In Progress': {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Clock className="w-4 h-4 mr-1 text-yellow-500" />,
    label: 'In Progress',
  },
  'Pending for User Inputs': {
    color: 'bg-blue-100 text-blue-800',
    icon: <Hourglass className="w-4 h-4 mr-1 text-blue-500" />,
    label: 'Pending for User Inputs',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { color, icon, label } = statusMap[status];
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {icon}
      {label}
    </span>
  );
};

export default StatusBadge; 