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
          displayModeBar: true,
          modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
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
      const traces = [{
        x: grouped.entries.map(entry => {
          const values = entry.rows.map(r => Number(r[config.yField])).filter(v => Number.isFinite(v));
          return aggregator.aggregate(values, config.aggregation);
        }),
        y: grouped.entries.map(entry => entry.key[0]),
        type: 'bar',
        orientation: 'h',
        marker: { color: colors[0] }
      }];
      
      const layout = {
        title: 'Bar Chart',
        xaxis: { title: config.yField },
        yaxis: { title: config.xField },
        margin: { t: 40, l: 80, r: 50, b: 50 }
      };
      
      return { traces, layout };
    }
    
    private buildColumnChart(config: ChartConfig, data: any[], colors: string[], aggregator: IDataAggregator): ChartBuildResult {
      const grouped = aggregator.groupBy(data, [config.xField]);
      const traces = [{
        x: grouped.entries.map(entry => entry.key[0]),
        y: grouped.entries.map(entry => {
          const values = entry.rows.map(r => Number(r[config.yField])).filter(v => Number.isFinite(v));
          return aggregator.aggregate(values, config.aggregation);
        }),
        type: 'bar',
        marker: { color: colors[0] }
      }];
      
      const layout = {
        title: 'Column Chart',
        xaxis: { title: config.xField },
        yaxis: { title: config.yField },
        margin: { t: 40, l: 50, r: 50, b: 50 }
      };
      
      return { traces, layout };
    }
    
    private buildLineChart(config: ChartConfig, data: any[], colors: string[], aggregator: IDataAggregator): ChartBuildResult {
      const grouped = aggregator.groupBy(data, [config.xField]);
      const traces = [{
        x: grouped.entries.map(entry => entry.key[0]),
        y: grouped.entries.map(entry => {
          const values = entry.rows.map(r => Number(r[config.yField])).filter(v => Number.isFinite(v));
          return aggregator.aggregate(values, config.aggregation);
        }),
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: colors[0] }
      }];
      
      const layout = {
        title: 'Line Chart',
        xaxis: { title: config.xField },
        yaxis: { title: config.yField },
        margin: { t: 40, l: 50, r: 50, b: 50 }
      };
      
      return { traces, layout };
    }
    
    private buildScatterChart(config: ChartConfig, data: any[], colors: string[]): ChartBuildResult {
      const traces = [{
        x: data.map(r => r[config.xField]),
        y: data.map(r => Number(r[config.yField])),
        type: 'scatter',
        mode: 'markers',
        marker: { color: colors[0] }
      }];
      
      const layout = {
        title: 'Scatter Plot',
        xaxis: { title: config.xField },
        yaxis: { title: config.yField },
        margin: { t: 40, l: 50, r: 50, b: 50 }
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
        marker: { colors }
      }];
      
      const layout = {
        title: 'Pie Chart',
        margin: { t: 40, l: 50, r: 50, b: 50 }
      };
      
      return { traces, layout };
    }
    
    private buildHistogram(config: ChartConfig, data: any[], colors: string[]): ChartBuildResult {
      const traces = [{
        x: data.map(r => Number(r[config.yField])).filter(v => Number.isFinite(v)),
        type: 'histogram',
        marker: { color: colors[0] },
        opacity: 0.8
      }];
      
      const layout = {
        title: 'Histogram',
        xaxis: { title: config.yField },
        yaxis: { title: 'Frequency' },
        margin: { t: 40, l: 50, r: 50, b: 50 }
      };
      
      return { traces, layout };
    }
    
    private buildBoxChart(config: ChartConfig, data: any[], colors: string[]): ChartBuildResult {
      const traces = [{
        y: data.map(r => Number(r[config.yField])),
        type: 'box',
        name: config.yField,
        marker: { color: colors[0] }
      }];
      
      const layout = {
        title: 'Box Plot',
        yaxis: { title: config.yField },
        margin: { t: 40, l: 50, r: 50, b: 50 }
      };
      
      return { traces, layout };
    }
    
    private buildHeatmap(config: ChartConfig, data: any[], colors: string[], aggregator: IDataAggregator): ChartBuildResult {
      if (!config.seriesField) {
        throw new Error('Heatmap requires a series field');
      }
      
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
        colorscale: 'Viridis'
      }];
      
      const layout = {
        title: 'Heatmap',
        xaxis: { title: config.xField },
        yaxis: { title: config.seriesField },
        margin: { t: 40, l: 80, r: 50, b: 50 }
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
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
            <div style="font-size: 3.6rem; font-weight: 800; color: ${colors[0]}; margin: 0;">${Math.round(result).toLocaleString()}</div>
            <div style="font-size: 1.05rem; color: #6c757d; margin-top: 8px;">${config.yField} (${config.aggregation})</div>
          </div>
        `
      };
    }
    
    private renderEmptyState(container: HTMLElement, message: string): void {
      container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6c757d; font-style: italic;">
          ${message}
        </div>
      `;
    }
    
    private renderErrorState(container: HTMLElement, error: unknown): void {
      const message = error instanceof Error ? error.message : 'Unknown error';
      container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #dc3545;">
          Error rendering chart: ${message}
        </div>
      `;
    }
}