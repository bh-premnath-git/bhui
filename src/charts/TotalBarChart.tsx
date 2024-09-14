import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

const rawData = [
    [150, 212, 201, 154, 190, 330, 410],
    [820, 832, 901, 934, 1290, 1330, 1320]
];

const TotalBarChart: React.FC = () => {
    const totalData: any = [];
    for (let i = 0; i < rawData[0].length; ++i) {
        let sum = 0;
        for (let j = 0; j < rawData.length; ++j) {
            sum += rawData[j][i];
        }
        totalData.push(sum);
    }

    const grid = {
        left: 100,
        right: 100,
        top: 50,
        bottom: 50,
        containLabel: false,
        show: false,


    };

    const series = [
        { name: 'Failed Health', color: '#c23516' },
        { name: 'Success Health', color: '#07A260' },

    ].map((item, sid) => ({
        name: item.name,
        type: 'bar',
        stack: 'total',
        barWidth: '60%',
        itemStyle: {
            color: item.color // Set custom color for each series
        },
        label: {
            show: false,
            formatter: (params: any) => Math.round(params.value * 1000) / 10 + '%'
        },
        data: rawData[sid]?.map((d, did) =>
            totalData[did] <= 0 ? 0 : d / totalData[did]
        )
    }));

    const option = {
        legend: {
            selectedMode: false
        },
        grid,
        yAxis: {
            type: 'value',
            splitLine: {
                show: false
            }
        },
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            axisTick: { // Hide x-axis ticks
                show: false
            }
        },
        series
    };

    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chartRef.current) {
            const chart = echarts.init(chartRef.current);
            chart.setOption(option);
            return () => {
                chart.dispose();
            };
        }
    }, [option]);

    return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default TotalBarChart;
