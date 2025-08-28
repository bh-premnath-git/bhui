import { IChartRenderer, IDataAggregator, ChartRenderData, ChartConfig, ChartType } from "@/types/plotly/systemtype";
import Plotly from 'plotly.js';

interface ChartBuildResult {
  traces: any[];
  layout: any;
  customHtml?: string;
}

export class PlotlyChartRenderer implements IChartRenderer {
    constructor(private aggregator: IDataAggregator) {}
    
    render(container: HTMLElement, { config, data, colors }: ChartRenderData): void {
      if (!data.length) {
        this.renderEmptyState(container, 'No data available');
        return;
      }
      
      try {
        const result = this.buildChart(config, data, colors);
        
        // Handle number chart with custom HTML
        if (result.customHtml) {
          container.innerHTML = result.customHtml;
          return;
        }
        
        Plotly.newPlot(container, result.traces, result.layout, {
          responsive: true,
          displayModeBar: false,
        });
      } catch (error) {
        this.renderErrorState(container, error);
      }
    }
    
    download(container: HTMLElement, filename: string): void {
      Plotly.downloadImage(container, {
        format: 'png',
        filename,
        width: 1200,
        height: 800
      });
    }

    private calculateDynamicMargins(data: any[], config: ChartConfig, chartType: ChartType) {
      const baseMargins = { t: 0, l: 0, r: 0, b: 0 };
      
      // Calculate maximum label lengths
      let maxYLabelLength = 0;
      let maxXLabelLength = 0;
      
      if (chartType === 'bar') {
        // For horizontal bars, y-axis shows categories
        const categories = [...new Set(data.map(r => String(r[config.xField])))];
        maxYLabelLength = Math.max(...categories.map(cat => cat.length));
        maxXLabelLength = config.yField.length;
      } else if (chartType === 'heatmap' && config.seriesField) {
        const yCategories = [...new Set(data.map(r => String(r[config.seriesField])))];
        const xCategories = [...new Set(data.map(r => String(r[config.xField])))];
        maxYLabelLength = Math.max(...yCategories.map(cat => cat.length));
        maxXLabelLength = Math.max(...xCategories.map(cat => cat.length));
      } else {
        // For vertical charts, x-axis shows categories
        const categories = [...new Set(data.map(r => String(r[config.xField])))];
        maxXLabelLength = Math.max(...categories.map(cat => cat.length));
        maxYLabelLength = config.yField.length;
      }
      
      // Dynamic margin calculation
      const leftMargin = Math.max(baseMargins.l, Math.min(maxYLabelLength * 8 + 40, 200));
      const bottomMargin = Math.max(baseMargins.b, Math.min(maxXLabelLength * 6 + 40, 120));
      
      return {
        t: baseMargins.t,
        l: leftMargin,
        r: baseMargins.r,
        b: bottomMargin,
        pad: {
          t: 0,
          l: 0,
          r: 0,
          b: 0
        }
      };
    }

    private getEnterpriseLayoutDefaults(margins: any) {
      return {
        font: { 
          family: 'Inter, system-ui, sans-serif',
          size: 12,
          color: '#374151'
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: margins,
        showlegend: false,
        hoverlabel: {
          bgcolor: '#1f2937',
          bordercolor: '#374151',
          font: { color: 'white', family: 'Inter, system-ui, sans-serif' }
        }
      };
    }

    private getAxisDefaults(title: string, isCategory: boolean = false) {
      const baseConfig = {
        title: {
          text: title,
          font: { size: 14, family: 'Inter, system-ui, sans-serif', weight: 500 },
          standoff: 20
        },
        tickfont: { 
          size: 11, 
          family: 'Inter, system-ui, sans-serif',
          color: '#6b7280'
        },
        gridcolor: '#f3f4f6',
        gridwidth: 1,
        zeroline: false,
        linecolor: '#d1d5db',
        linewidth: 1
      };

      if (isCategory) {
        return {
          ...baseConfig,
          tickmode: 'array',
          automargin: true,
          tickangle: -45,
          ticklen: 8
        };
      }

      return baseConfig;
    }
    
    private buildChart(config: ChartConfig, data: any[], colors: string[]): ChartBuildResult {
      const builder = this.getChartBuilder(config.type);
      return builder(config, data, colors, this.aggregator);
    }
    
    private getChartBuilder(type: ChartType) {
      const builders = {
        bar: this.buildBarChart.bind(this),
        column: this.buildColumnChart.bind(this),
        line: this.buildLineChart.bind(this),
        scatter: this.buildScatterChart.bind(this),
        pie: this.buildPieChart.bind(this),
        histogram: this.buildHistogram.bind(this),
        box: this.buildBoxChart.bind(this),
        heatmap: this.buildHeatmap.bind(this),
        number: this.buildNumberChart.bind(this)
      };
      
      return builders[type] || builders.bar;
    }
    
    private buildBarChart(config: ChartConfig, data: any[], colors: string[], aggregator: IDataAggregator): ChartBuildResult {
      const grouped = aggregator.groupBy(data, [config.xField]);
      const margins = this.calculateDynamicMargins(data, config, 'bar');
      
      const traces = [{
        x: grouped.entries.map(entry => {
          const values = entry.rows.map(r => Number(r[config.yField])).filter(v => Number.isFinite(v));
          return aggregator.aggregate(values, config.aggregation);
        }),
        y: grouped.entries.map(entry => entry.key[0]),
        type: 'bar',
        orientation: 'h',
        marker: { 
          color: colors[0],
          line: { color: 'rgba(0,0,0,0.1)', width: 1 }
        },
        hovertemplate: '<b>%{y}</b><br>%{x}<extra></extra>'
      }];
      
      const layout = {
        ...this.getEnterpriseLayoutDefaults(margins),
        xaxis: this.getAxisDefaults(config.yField),
        yaxis: this.getAxisDefaults(config.xField, true)
      };
      
      return { traces, layout };
    }
    
    private buildColumnChart(config: ChartConfig, data: any[], colors: string[], aggregator: IDataAggregator): ChartBuildResult {
      const grouped = aggregator.groupBy(data, [config.xField]);
      const margins = this.calculateDynamicMargins(data, config, 'column');
      
      const traces = [{
        x: grouped.entries.map(entry => entry.key[0]),
        y: grouped.entries.map(entry => {
          const values = entry.rows.map(r => Number(r[config.yField])).filter(v => Number.isFinite(v));
          return aggregator.aggregate(values, config.aggregation);
        }),
        type: 'bar',
        marker: { 
          color: colors[0],
          line: { color: 'rgba(0,0,0,0.1)', width: 1 }
        },
        hovertemplate: '<b>%{x}</b><br>%{y}<extra></extra>'
      }];
      
      const layout = {
        ...this.getEnterpriseLayoutDefaults(margins),
        xaxis: this.getAxisDefaults(config.xField, true),
        yaxis: this.getAxisDefaults(config.yField)
      };
      
      return { traces, layout };
    }
    
    private buildLineChart(config: ChartConfig, data: any[], colors: string[], aggregator: IDataAggregator): ChartBuildResult {
      const grouped = aggregator.groupBy(data, [config.xField]);
      const margins = this.calculateDynamicMargins(data, config, 'line');
      
      const traces = [{
        x: grouped.entries.map(entry => entry.key[0]),
        y: grouped.entries.map(entry => {
          const values = entry.rows.map(r => Number(r[config.yField])).filter(v => Number.isFinite(v));
          return aggregator.aggregate(values, config.aggregation);
        }),
        type: 'scatter',
        mode: 'lines+markers',
        line: { 
          color: colors[0], 
          width: 3,
          shape: 'spline'
        },
        marker: { 
          color: colors[0], 
          size: 6,
          line: { color: 'white', width: 2 }
        },
        hovertemplate: '<b>%{x}</b><br>%{y}<extra></extra>'
      }];
      
      const layout = {
        ...this.getEnterpriseLayoutDefaults(margins),
        xaxis: this.getAxisDefaults(config.xField, true),
        yaxis: this.getAxisDefaults(config.yField)
      };
      
      return { traces, layout };
    }
    
    private buildScatterChart(config: ChartConfig, data: any[], colors: string[]): ChartBuildResult {
      const margins = this.calculateDynamicMargins(data, config, 'scatter');
      
      const traces = [{
        x: data.map(r => r[config.xField]),
        y: data.map(r => Number(r[config.yField])),
        type: 'scatter',
        mode: 'markers',
        marker: { 
          color: colors[0],
          size: 8,
          opacity: 0.7,
          line: { color: 'rgba(0,0,0,0.2)', width: 1 }
        },
        hovertemplate: '<b>%{x}</b><br>%{y}<extra></extra>'
      }];
      
      const layout = {
        ...this.getEnterpriseLayoutDefaults(margins),
        xaxis: this.getAxisDefaults(config.xField, true),
        yaxis: this.getAxisDefaults(config.yField)
      };
      
      return { traces, layout };
    }
    
    private buildPieChart(config: ChartConfig, data: any[], colors: string[], aggregator: IDataAggregator): ChartBuildResult {
      const grouped = aggregator.groupBy(data, [config.xField]);
      
      const traces = [{
        labels: grouped.entries.map(entry => entry.key[0]),
        values: grouped.entries.map(entry => {
          const values = entry.rows.map(r => Number(r[config.yField])).filter(v => Number.isFinite(v));
          return aggregator.aggregate(values, config.aggregation);
        }),
        type: 'pie',
        marker: { 
          colors,
          line: { color: 'white', width: 2 }
        },
        textinfo: 'label+percent',
        textfont: { 
          family: 'Inter, system-ui, sans-serif',
          size: 12
        },
        hovertemplate: '<b>%{label}</b><br>%{value}<br>%{percent}<extra></extra>'
      }];
      
      const layout = {
        ...this.getEnterpriseLayoutDefaults({ t: 60, l: 50, r: 50, b: 50 }),
        showlegend: true,
        legend: {
          orientation: 'v',
          x: 1.02,
          y: 0.5,
          font: { family: 'Inter, system-ui, sans-serif', size: 11 }
        }
      };
      
      return { traces, layout };
    }
    
    private buildHistogram(config: ChartConfig, data: any[], colors: string[]): ChartBuildResult {
      const margins = this.calculateDynamicMargins(data, config, 'histogram');
      
      const traces = [{
        x: data.map(r => Number(r[config.yField])).filter(v => Number.isFinite(v)),
        type: 'histogram',
        marker: { 
          color: colors[0],
          opacity: 0.8,
          line: { color: 'rgba(0,0,0,0.1)', width: 1 }
        },
        hovertemplate: 'Range: %{x}<br>Count: %{y}<extra></extra>'
      }];
      
      const layout = {
        ...this.getEnterpriseLayoutDefaults(margins),
        xaxis: this.getAxisDefaults(config.yField),
        yaxis: this.getAxisDefaults('Frequency'),
        bargap: 0.05
      };
      
      return { traces, layout };
    }
    
    private buildBoxChart(config: ChartConfig, data: any[], colors: string[]): ChartBuildResult {
      const margins = this.calculateDynamicMargins(data, config, 'box');
      
      const traces = [{
        y: data.map(r => Number(r[config.yField])),
        type: 'box',
        name: config.yField,
        marker: { color: colors[0] },
        line: { color: colors[0] },
        fillcolor: colors[0] + '40',
        hovertemplate: '%{y}<extra></extra>'
      }];
      
      const layout = {
        ...this.getEnterpriseLayoutDefaults(margins),
        yaxis: this.getAxisDefaults(config.yField),
        xaxis: { showticklabels: false, showgrid: false }
      };
      
      return { traces, layout };
    }
    
    private buildHeatmap(config: ChartConfig, data: any[], colors: string[], aggregator: IDataAggregator): ChartBuildResult {
      if (!config.seriesField) {
        throw new Error('Heatmap requires a series field');
      }
      
      const margins = this.calculateDynamicMargins(data, config, 'heatmap');
      const xCategories = [...new Set(data.map(r => String(r[config.xField])))];
      const yCategories = [...new Set(data.map(r => String(r[config.seriesField])))];
      
      const z = yCategories.map(yc =>
        xCategories.map(xc => {
          const values = data
            .filter(r => String(r[config.xField]) === xc && String(r[config.seriesField!]) === yc)
            .map(r => Number(r[config.yField]));
          return aggregator.aggregate(values, config.aggregation);
        })
      );
      
      const traces = [{
        x: xCategories,
        y: yCategories,
        z,
        type: 'heatmap',
        colorscale: 'Viridis',
        hoverongaps: false,
        hovertemplate: '<b>%{x}</b><br><b>%{y}</b><br>Value: %{z}<extra></extra>'
      }];
      
      const layout = {
        ...this.getEnterpriseLayoutDefaults(margins),
        xaxis: this.getAxisDefaults(config.xField, true),
        yaxis: this.getAxisDefaults(config.seriesField, true)
      };
      
      return { traces, layout };
    }
    
    private buildNumberChart(config: ChartConfig, data: any[], colors: string[], aggregator: IDataAggregator): ChartBuildResult {
      const values = data.map(r => Number(r[config.yField])).filter(v => Number.isFinite(v));
      const result = aggregator.aggregate(values, config.aggregation);
      
      return {
        traces: [],
        layout: {},
        customHtml: `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; font-family: 'Inter', system-ui, sans-serif;">
            <div style="font-size: 3.6rem; font-weight: 800; color: ${colors[0]}; margin: 0; line-height: 1;">${Math.round(result).toLocaleString()}</div>
            <div style="font-size: 1.05rem; color: #6b7280; margin-top: 12px; font-weight: 500;">${config.yField} (${config.aggregation})</div>
          </div>
        `
      };
    }
    
    private renderEmptyState(container: HTMLElement, message: string): void {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #9ca3af; font-family: 'Inter', system-ui, sans-serif;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          <div style="font-size: 1rem; font-weight: 500;">${message}</div>
        </div>
      `;
    }
    
    private renderErrorState(container: HTMLElement, error: unknown): void {
      const message = error instanceof Error ? error.message : 'Unknown error';
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #ef4444; font-family: 'Inter', system-ui, sans-serif;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px;">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <div style="font-size: 1rem; font-weight: 500; margin-bottom: 4px;">Chart Error</div>
          <div style="font-size: 0.875rem; opacity: 0.8;">${message}</div>
        </div>
      `;
    }
}