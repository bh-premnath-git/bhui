import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

const names = [
  'Orange',
  'Tomato',
  'Apple',
  'Pasta'
];
const years = ['2001', '2002', '2003', '2004', '2005', '2006'];

const shuffle = (array) => {
  let currentIndex = array.length;
  let randomIndex = 0;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ];
  }
  return array;
};

const generateRankingData = () => {
  const map = new Map();
  const defaultRanking = Array.from({ length: names.length }, (_, i) => i + 1);
  for (const _ of years) {
    const shuffleArray = shuffle(defaultRanking);
    names.forEach((name, i) => {
      map.set(name, (map.get(name) || []).concat(shuffleArray[i]));
    });
  }
  return map;
};

const generateSeriesList = () => {
  const seriesList:any = [];
  const rankingMap = generateRankingData();
  rankingMap.forEach((data, name) => {
    const series = {
      name,
      symbolSize: 10,
      type: 'line',
      smooth: true,
      emphasis: {
        focus: 'series'
      },
      endLabel: {
        show: true,
        formatter: '{a}',
        distance: 25
      },
      lineStyle: {
        width: 2
      },
      data
    };
    seriesList.push(series);
  });
  return seriesList;
};

const BumpChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);
      const option = {
        title: {
          text: 'Bump Chart (Ranking)'
        },
        tooltip: {
          trigger: 'item'
        },
        grid: {
          left: 30,
          right: 110,
          bottom: 30,
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          splitLine: {
            show: true
          },
          axisLabel: {
            margin: 30,
            fontSize: 16
          },
          boundaryGap: false,
          data: years
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            margin: 30,
            fontSize: 16,
            formatter: '#{value}'
          },
          inverse: true,
          interval: 1,
          min: 1,
          max: names.length
        },
        series: generateSeriesList()
      };

      chart.setOption(option);

      return () => {
        chart.dispose();
      };
    }
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default BumpChart;
