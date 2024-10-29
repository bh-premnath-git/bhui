import ReactECharts from 'echarts-for-react';
const MyChartComponent = ({ selectedRowData }:any) => {
// Define the option object outside the component
const getChartOption = () => {
  if (!selectedRowData) {
    return {}; // Return an empty option if no row is selected
  }

  // Generate your chart option based on selectedRowData
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {},
    grid: {
      containLabel: false
    },
    xAxis: {
      type: 'value',
      show: false,
    },
    yAxis: {
      type: 'category',
      data: ['Discarded Records', 'Failed Records', 'Success Records', 'Read Records'],
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        type: 'bar',
        stack: 'total',
        label: {
          show: true
        },
        emphasis: {
          focus: 'series'
        },
        data: [
          { value: selectedRowData?.job_statistics?.record_discarded, itemStyle: { color: '#ffa500' } },
          { value: selectedRowData?.job_statistics?.record_failed, itemStyle: { color: '#d10e00' } },
          { value: selectedRowData?.job_statistics?.records_passed, itemStyle: { color: '#00b060'} },
          { value: selectedRowData?.job_statistics?.records_read, itemStyle: { color: '#2dcd6f' } },
        ],
        // You can add more properties as needed
      }
    ]
  };
  return option;
};

// const MyChartComponent = (jobDetailList) => {
  return <ReactECharts option={getChartOption()} />;
};

export default MyChartComponent;
