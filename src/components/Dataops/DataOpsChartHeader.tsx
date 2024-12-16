import { Divider, Stack } from '@mui/material';
import React from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { CircleCheckBig } from 'lucide-react';
const rootStyle = getComputedStyle(document.documentElement);

const COLORS = [
    rootStyle.getPropertyValue('--chart-1-color').trim(),
    rootStyle.getPropertyValue('--chart-2-color').trim(),
    rootStyle.getPropertyValue('--chart-5-color').trim(),
];

export default function DataOpsChartHeader({ row }: any) {

    const successCount = row?.pipeline_status["Success"] || 0;
    const failedCount = row?.pipeline_status["Failed"] || 0;
    const inProgressCount = row?.pipeline_status["InProgress"] || 0;

    console.log("success count", successCount)
    console.log("failed count")

    const totalCount = successCount + failedCount + inProgressCount;

    const pieChartData = {
        freshness: {
            label: 'Successful',
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

    const renderCard = (data: any) => (
        <div className="p-6 border rounded-md shadow-sm flex items-center gap-4">
            <div className="relative h-24 w-24">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke={`${data.background}`} // Background color
                        strokeWidth="4"
                    />
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke={`${data.color}`} // Stroke color
                        strokeWidth="4"
                        strokeDasharray="100"
                        strokeDashoffset={(100 - data.percentage).toString()}
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
        </div>
    );

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {renderCard(pieChartData.freshness)}
            {renderCard(pieChartData.volume)}
            {renderCard(pieChartData.health)}
        </div>
    );
}
