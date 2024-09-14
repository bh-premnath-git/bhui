import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

const BarChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
          }
        },
        legend: {},
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu']
        },
        series: [
          {
            name: 'Direct',
            type: 'bar',
            stack: 'total',
            label: {
              show: true
            },
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              borderRadius: [0, 0, 0, 0], // Top-left and top-right corners rounded
              color: '#07A260' // Custom color for bars
            },
            data: [100, 150, 50, 200]
          },
          {
            name: 'Mail Ad',
            type: 'bar',
            stack: 'total',
            label: {
              show: true
            },
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              borderRadius: [0, 5, 5, 0], // Top-left and top-right corners rounded
              color: '#F0A71F' // Custom color for bars
            },
            data: [250, 200, 300, 150]
          },
          // Add more series as needed
        ]
      };

      chart.setOption(option);

      return () => {
        chart.dispose();
      };
    }
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default BarChart;
