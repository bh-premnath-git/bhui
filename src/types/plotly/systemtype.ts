import type { TableContent } from '@/types/streaming';

// Re-export TableContent for use by other modules
export type { TableContent };

export interface IDataNormalizer {
    normalize(data: TableContent): NormalizedData;
}

export interface IFieldTypeDetector {
    detectTypes(data: any[]): FieldTypes;
}

export interface IChartRenderer {
    render(container: HTMLElement, data: ChartRenderData): void;
    download(container: HTMLElement, filename: string): void;
}

export interface IColorProvider {
    getColors(scheme: ColorScheme, customColor?: string): string[];
}

export interface IDataAggregator {
    aggregate(values: number[], method: AggregationMethod): number;
    groupBy<T>(data: T[], keys: string[]): GroupedData<T>;
}

// ===== TYPE DEFINITIONS =====

export type FieldType = 'string' | 'number';
export type AggregationMethod = 'sum' | 'avg' | 'min' | 'max';
export type ChartType = 'bar' | 'column' | 'line' | 'scatter' | 'pie' | 'histogram' | 'box' | 'heatmap' | 'number';
export type ColorScheme = 'default' | 'viridis' | 'plasma' | 'blues' | 'greens' | 'custom';

export interface FieldTypes {
    [fieldName: string]: FieldType;
}

export interface NormalizedData {
    rows: any[];
    fieldTypes: FieldTypes;
    numericFields: string[];
    stringFields: string[];
}

export interface ChartConfig {
    type: ChartType;
    xField: string;
    yField: string;
    seriesField?: string;
    aggregation: AggregationMethod;
}

export interface ChartRenderData {
    config: ChartConfig;
    data: any[];
    colors: string[];
}

export interface GroupedData<T> {
    entries: { key: string[]; rows: T[] }[];
}
