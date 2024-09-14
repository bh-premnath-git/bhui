import React from 'react';
import ReactECharts from 'echarts-for-react';

const CostTrendChart = () => {
    const option = {
        title: {
            text: 'Cost Trend'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['Project 1', 'Project 2', 'Project 3', 'Project 4']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['Jan 23', 'Feb 23', 'Mar 23', 'Apr 23', 'May 23']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Project 1',
                type: 'line',
                stack: 'Total',
                areaStyle: {},
                data: [120, 132, 101, 134, 90]
            },
            {
                name: 'Project 2',
                type: 'line',
                stack: 'Total',
                areaStyle: {},
                data: [220, 182, 191, 234, 290]
            },
            {
                name: 'Project 3',
                type: 'line',
                stack: 'Total',
                areaStyle: {},
                data: [150, 232, 201, 154, 190]
            },
            {
                name: 'Project 4',
                type: 'line',
                stack: 'Total',
                areaStyle: {normal: {}},
                data: [320, 332, 301, 334, 390]
            }
        ]
    };

    return (
        <div>
            <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />
        </div>
    );
};

export default CostTrendChart;
