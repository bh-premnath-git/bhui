export interface ChartStyles {
    height: number;
    colorScheme: 'monochrome' | 'default' | 'colorful';
    orientation: 'vertical' | 'horizontal';
    type: 'grouped' | 'stacked' | 'stack100';
    enableStyle: boolean;
    showDataLabels: boolean;
    showLegend: boolean;
    chartType: 'bar' | 'line' | 'pie';
  }