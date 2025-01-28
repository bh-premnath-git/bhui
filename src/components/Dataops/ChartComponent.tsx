import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const MyChartComponent = ({ selectedRowData }: any) => {
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
    <BarChart
      width={400}
      height={250}
      data={chartData}
      layout="vertical"
      margin={{
        top: 10,
        right: 30,
        left: 30,
        bottom: 10,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" hide />
      <YAxis type="category" dataKey="name" />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" radius={[5, 5, 5, 5]} />
    </BarChart>
  );
};

export default MyChartComponent;
