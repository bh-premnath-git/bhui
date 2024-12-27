import React, { useEffect, useState } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { CircleCheckBig } from 'lucide-react';
import { PipelineStatusCounts } from '@/types/dataops';

interface DataOpsChartHeaderProps {
  selectedRowData: PipelineStatusCounts;
  clickstatusType: (statuses: string[]) => void;
}

const rootStyle = getComputedStyle(document.documentElement);

const COLORS = [
  rootStyle.getPropertyValue('--chart-1-color').trim(),
  rootStyle.getPropertyValue('--chart-2-color').trim(),
  rootStyle.getPropertyValue('--chart-5-color').trim(),
];

const STATUS_MAP: Record<string, string> = {
  'Success': 'Success',
  'Failed': 'Failed',
  'In Progress': 'In Progress'
};

const DataOpsChartHeader: React.FC<DataOpsChartHeaderProps> = ({ selectedRowData, clickstatusType }) => {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

  // Ensure counts are non-negative integers
  const successCount = Math.max(0, Math.floor(selectedRowData.Success || 0));
  const failedCount = Math.max(0, Math.floor(selectedRowData.Failed || 0));
  const inProgressCount = Math.max(0, Math.floor(selectedRowData.InProgress || 0));

  const totalCount = successCount + failedCount + inProgressCount;

  const safeDivide = (count: number, total: number): string => {
    // Prevent division by zero and ensure positive values
    if (total <= 0 || count < 0) return '0.0';
    const percentage = (count / total) * 100;
    // Ensure percentage is between 0 and 100
    return Math.min(100, Math.max(0, percentage)).toFixed(1);
  };

  const handleCardClick = (label: string) => {
    try {
      setSelectedCards(prevSelectedCards => {
        const newSelectedCards = new Set(prevSelectedCards);
        if (newSelectedCards.has(label)) {
          newSelectedCards.delete(label);
        } else {
          newSelectedCards.add(label);
        }
        return newSelectedCards;
      });
    } catch (error) {
      console.error('Error in handleCardClick:', error);
      setSelectedCards(new Set());
    }
  };

  useEffect(() => {
    try {
      clickstatusType(Array.from(selectedCards).map(card => STATUS_MAP[card]));
    } catch (error) {
      console.error('Error in clickstatusType:', error);
      clickstatusType([]);
    }
  }, [selectedCards, clickstatusType]);

  const pieChartData = {
    freshness: {
      label: 'Success',
      value: successCount,
      percentage: safeDivide(successCount, totalCount),
      color: COLORS[0],
      background: `${COLORS[0]}33`,
      icon: <CircleCheckBig style={{ color: COLORS[0] }} className="h-6 w-6" />,
    },
    volume: {
      label: 'Failed',
      value: failedCount,
      percentage: safeDivide(failedCount, totalCount),
      color: COLORS[2],
      background: `${COLORS[2]}33`,
      icon: <CancelIcon style={{ color: COLORS[2] }} className="h-6 w-6" />,
    },
    health: {
      label: 'In Progress',
      value: inProgressCount,
      percentage: safeDivide(inProgressCount, totalCount),
      color: COLORS[1],
      background: `${COLORS[1]}33`,
      icon: <HourglassBottomIcon style={{ color: COLORS[1] }} className="h-6 w-6" />,
    },
  };

  const renderCard = (data: any) => {
    const strokeDashoffset = Math.min(100, Math.max(0, 100 - parseFloat(data.percentage)));
    
    return (
      <div
        className={`p-6 border rounded-md shadow-sm flex items-center gap-4 relative cursor-pointer ${
          selectedCards.has(data.label) ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => handleCardClick(data.label)}
      >
        <div className="relative h-24 w-24">
          <svg className="h-full w-full" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke={`${data.background}`}
              strokeWidth="4"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke={`${data.color}`}
              strokeWidth="4"
              strokeDasharray="100"
              strokeDashoffset={strokeDashoffset.toString()}
              transform="rotate(-90 18 18)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {data.icon}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{data.label}</p>
          <p className="text-2xl font-bold">{data.value}</p>
          <p className="text-sm text-muted-foreground">{data.percentage}%</p>
        </div>
        {selectedCards.has(data.label) && (
          <CancelIcon
            className="absolute top-2 right-2 cursor-pointer h-4 w-4 text-gray-700 hover:text-red-800"
            style={{ fontSize: '16px' }}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick(data.label);
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {Object.values(pieChartData).map((data: any) => (
          <div key={data.label}>
            {renderCard(data)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataOpsChartHeader;