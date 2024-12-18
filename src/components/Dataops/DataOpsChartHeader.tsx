import { useState } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { CircleCheckBig } from 'lucide-react';

const rootStyle = getComputedStyle(document.documentElement);

const COLORS = [
    rootStyle.getPropertyValue('--chart-1-color').trim(),
    rootStyle.getPropertyValue('--chart-2-color').trim(),
    rootStyle.getPropertyValue('--chart-5-color').trim(),
];

const STATUS_MAP = {
    'Success': 'Success',
    'Failed': 'Failed',
    'In Progress': 'In Progress'
};

export default function DataOpsChartHeader({ selectedRowData, clickstatusType }) {
    const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
    
    const successCount = selectedRowData["Success"] || 0;
    const failedCount = selectedRowData["Failed"] || 0;
    const inProgressCount = selectedRowData["InProgress"] || 0;

    const totalCount = successCount + failedCount + inProgressCount;

    const pieChartData = {
        freshness: {
            label: 'Success',
            value: successCount,
            percentage: ((successCount / totalCount) * 100).toFixed(1),
            color: COLORS[0],
            background: `${COLORS[0]}33`,
            icon: <CircleCheckBig style={{ color: COLORS[0] }} className="h-6 w-6" />,
        },
        volume: {
            label: 'Failed',
            value: failedCount,
            percentage: ((failedCount / totalCount) * 100).toFixed(1),
            color: COLORS[2],
            background: `${COLORS[2]}33`,
            icon: <CancelIcon style={{ color: COLORS[2] }} className="h-6 w-6" />,
        },
        health: {
            label: 'In Progress',
            value: inProgressCount,
            percentage: ((inProgressCount / totalCount) * 100).toFixed(1),
            color: COLORS[1],
            background: `${COLORS[1]}33`,
            icon: <HourglassBottomIcon style={{ color: COLORS[1] }} className="h-6 w-6" />,
        },
    };

    const handleCardClick = (label: string) => {
        setSelectedCards((prevSelectedCards) => {
            const newSelectedCards = new Set(prevSelectedCards);
            
            if (newSelectedCards.has(label)) {
                newSelectedCards.delete(label);
            } else {
                newSelectedCards.add(label);
            }

            clickstatusType(Array.from(newSelectedCards).map(card => STATUS_MAP[card as keyof typeof STATUS_MAP]));

            return newSelectedCards;
        });
    };

    const renderCard = (data: any) => (
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
                        strokeDashoffset={(100 - parseFloat(data.percentage)).toString()}
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
}
