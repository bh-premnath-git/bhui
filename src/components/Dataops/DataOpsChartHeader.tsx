import { Divider, Stack } from '@mui/material'
import React from 'react'
import { PieChart } from '@mui/x-charts/PieChart';
import { JSXElementConstructor, ReactElement, ReactNode, useEffect, useState } from 'react';
import { Label } from '../ui/label';
import { COLORS } from '@/Utils/constants';

export default function DataOpsChartHeader({ selectedRowData }:any) {

    const size = {
        width: 180,
        height: 150,
    };
    const pieChartData = {
        freshness: [
            { value: 10, label: 'Success', color: '#e7e5eb' },
            { value: selectedRowData?.job_statistics?.records_passed, label: '', color: '#69be70' }
        ],
        volume: [
            { value: 10, label: 'Failed', color: '#e7e5eb' },
            { value: selectedRowData?.job_statistics?.record_failed, label: '', color: COLORS.red }
        ],
        health: [
            { value: 10, label: 'In Progress', color: '#e7e5eb' },
            { value: selectedRowData?.job_statistics?.record_discarded, label: '', color: '#ffa500' }
        ]
    };

    const renderPieChartWithLabels = (title: string, data: any[]) => (
        <Stack direction="row" alignItems="center" spacing={1}>
            <Stack sx={{ width: 100, height: 100 }}>
                <PieChart
                    width={size.width}
                    height={size.height}
                    series={[{ data, innerRadius: 20 }]}
                    slotProps={{
                        legend: { hidden: true },
                    }}
                />
            </Stack>
            <Stack sx={{ ml: 1, mt: 1 }}>
                {data.map((item, index) => (
                    <Stack direction="row" spacing={0.5} key={index} alignItems="center">
                        {item.label ? (<Label>{item.label}</Label>) : (
                            <Label className="font-bold">{item?.value}</Label>
                        )}
                    </Stack>
                ))}
            </Stack>
        </Stack>
    );
    return (
        <Stack direction="row" spacing={4}>
            {renderPieChartWithLabels('Freshness', pieChartData.freshness)}
            <Divider orientation="vertical" flexItem />
            {renderPieChartWithLabels('Volume', pieChartData.volume)}
            <Divider orientation="vertical" flexItem />
            {renderPieChartWithLabels('Health', pieChartData.health)}
        </Stack>
    )
}
