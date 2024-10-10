import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

const ChartComponent = () => {
  const [chartData, setChartData]:any = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://54.157.234.126:8000/superset-chart/1');
      const result = await response.json();
      console.log(result)
      setChartData(result.result);
    };
    fetchData();
  }, []);

  if (!chartData) {
    return <div>Loading...</div>;
  }

  // Extract data for the chart
  const { metrics, groupby, data } = chartData.query_context.form_data;

  const labels = data.map(item => item[groupby[0]]);
  const values = data.map(item => item.metrics[0].value);

  const chartOptions = {
    labels,
    datasets: [
      {
        label: metrics[0].label,
        data: values,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h1>{chartData.slice_name}</h1>
      <Bar data={chartOptions} />
    </div>
  );
};

export default ChartComponent;
