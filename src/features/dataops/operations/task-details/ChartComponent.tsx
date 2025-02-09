import { BarChart } from '@/components/bh-charts';

const TaskChartComponent = ({ selectedRowData }: any) => {
  const COLORS = [
    getComputedStyle(document.documentElement).getPropertyValue('--chart-1-color').trim(),
    getComputedStyle(document.documentElement).getPropertyValue('--chart-2-color').trim(),
    getComputedStyle(document.documentElement).getPropertyValue('--chart-5-color').trim(),
    getComputedStyle(document.documentElement).getPropertyValue('--chart-4-color').trim(),
  ];

  const chartData = [
    {
      name: 'Discarded',
      value: selectedRowData?.job_statistics?.records_discarded || 0,
      fill: COLORS[1],
    },
    {
      name: 'Failed',
      value: selectedRowData?.job_statistics?.records_failed || 0,
      fill: COLORS[2],
    },
    {
      name: 'Success',
      value: selectedRowData?.job_statistics?.records_passed || 0,
      fill: COLORS[0],
    },
    {
      name: 'Read',
      value: selectedRowData?.job_statistics?.records_read || 0,
      fill: COLORS[3],
    },
  ];

  return (
    <BarChart data={chartData} xAxisDataKey="name" bars={['value']} />
  );
};

export default TaskChartComponent;
