import ReactECharts from 'echarts-for-react';

const MyChartComponent = ({ selectedRowData }: any) => {
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
        top: 0,    // Remove top space
        bottom: 0, // Remove bottom space
        left: '3%', // Optional: Adjust left space as needed
        right: '3%', // Optional: Adjust right space as needed
        containLabel: true // Ensure labels are contained within the grid
      },
      xAxis: {
        type: 'value',
        show: false,
      },
      yAxis: {
        type: 'category',
        data: ['Discarded ', 'Failed ', 'Success ', 'Read '],
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
            show: true,
            position: 'insideRight', // Position label inside the bar
            color: '#fff' // Change label color for better visibility
          },
          emphasis: {
            focus: 'series'
          },
          barWidth: '75%', // Adjust bar width as needed
          itemStyle: {
            borderRadius: [5, 5, 5, 5] // Set border radius for all corners
          },
          data: [
            { value: selectedRowData?.job_statistics?.record_discarded, itemStyle: { color: '#ffa500' } },
            { value: selectedRowData?.job_statistics?.record_failed, itemStyle: { color: '#d10e00' } },
            { value: selectedRowData?.job_statistics?.records_passed, itemStyle: { color: '#00b060'} },
            { value: selectedRowData?.job_statistics?.records_read, itemStyle: { color: '#2dcd6f' } },
          ],
        }
      ]
    };
    return option;
  };

  return <ReactECharts option={getChartOption()} style={{ height: '250px', width: '100%' }} />;
};

export default MyChartComponent;