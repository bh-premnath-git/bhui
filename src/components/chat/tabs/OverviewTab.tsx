import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { TableEvent } from '@/types/streaming';
import type {
    ChartConfig,
    ChartType,
    ColorScheme,
} from '@/types/plotly/systemtype';
import { FieldTypeDetector } from '@/components/bh-plotly-charts/FieldTypeDetector';
import { DataNormalizer } from '@/components/bh-plotly-charts/DataNormalizer';
import { DataAggregator } from '@/components/bh-plotly-charts/DataAggregator';
import { ColorProvider } from '@/components/bh-plotly-charts/ColorProvider';
import { PlotlyChartRenderer } from '@/components/bh-plotly-charts/PlotlyChartRenderer';
import { ChartControls } from '@/components/bh-plotly-charts/ChartControls';

interface OverviewTabProps {
    explanation?: string | null;
    table?: TableEvent['content'];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ explanation, table }) => {
    const detector = useMemo(() => new FieldTypeDetector(), []);
    const normalizer = useMemo(() => new DataNormalizer(detector), [detector]);
    const aggregator = useMemo(() => new DataAggregator(), []);
    const renderer = useMemo(() => new PlotlyChartRenderer(aggregator), [aggregator]);
    const colorProvider = useMemo(() => new ColorProvider(), []);

    const chartContainerRef = useRef<HTMLDivElement>(null);

    // Observe container size changes (NOT just window resizes)
    useEffect(() => {
        const el = chartContainerRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
            renderer.resize(el);
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, [renderer]);

    // Normalize the table data
    const normalizedData = useMemo(() => {
        if (!table) return null;
        return normalizer.normalize(table);
    }, [table, normalizer]);

    // Chart configuration state
    const [chartConfig, setChartConfig] = useState<ChartConfig>(() => {
        if (!normalizedData) {
            return {
                type: 'column' as ChartType,
                xField: '',
                yField: '',
                aggregation: 'sum' as const
            };
        }

        // Auto-select fields based on data
        const firstStringField = normalizedData.stringFields[0] || '';
        const firstNumericField = normalizedData.numericFields[0] || '';

        return {
            type: 'column' as ChartType,
            xField: firstStringField,
            yField: firstNumericField,
            aggregation: 'sum' as const
        };
    });

    const [colorScheme, setColorScheme] = useState<ColorScheme>('default');
    const [customColor, setCustomColor] = useState('#667eea');

    // Update chart config when data changes
    useEffect(() => {
        if (normalizedData && (!chartConfig.xField || !chartConfig.yField)) {
            const firstStringField = normalizedData.stringFields[0] || '';
            const firstNumericField = normalizedData.numericFields[0] || '';

            setChartConfig(prev => ({
                ...prev,
                xField: firstStringField,
                yField: firstNumericField
            }));
        }
    }, [normalizedData, chartConfig.xField, chartConfig.yField]);

    // Render chart when config or data changes
    useEffect(() => {
        if (!chartContainerRef.current || !normalizedData || !chartConfig.xField || !chartConfig.yField) {
            return;
        }

        const colors = colorProvider.getColors(colorScheme, customColor);

        try {
            renderer.render(chartContainerRef.current, {
                config: chartConfig,
                data: normalizedData.rows,
                colors
            });
        } catch (error) {
            console.error('Chart rendering error:', error);
        }
    }, [chartConfig, normalizedData, colorScheme, customColor, renderer, colorProvider]);

    return (
        <div className="space-y-4">
            {/* Chart Controls */}
            {normalizedData && (
                <ChartControls
                    config={chartConfig}
                    colorScheme={colorScheme}
                    customColor={customColor}
                    fields={{
                        numeric: normalizedData.numericFields,
                        string: normalizedData.stringFields
                    }}
                    onConfigChange={setChartConfig}
                    onColorSchemeChange={setColorScheme}
                    onCustomColorChange={setCustomColor}
                />
            )}

            {/* Chart Container */}
            <div className="border rounded-lg p-4 bg-muted/20">
                {table ? (
                    <div
                        ref={chartContainerRef}
                        className="h-96 w-full"
                        style={{ minHeight: '384px' }}
                    />
                ) : (
                    <div className="h-64 w-full border-2 border-dashed border-muted-foreground/20 rounded-md grid place-items-center">
                        <div className="text-sm text-muted-foreground text-center">
                            <span className="block">No data available for visualization</span>
                            <span className="block text-xs mt-1">Chart will appear when data is received</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Explanation */}
            <div className="text-left text-sm bg-muted/10 rounded-md p-3">
                <div className="text-xs text-muted-foreground mb-1">Explanation</div>
                {explanation ? (
                    <p className="text-foreground whitespace-pre-wrap break-words">{explanation}</p>
                ) : (
                    <p className="text-muted-foreground italic">No explanation generated.</p>
                )}
            </div>
        </div>
    );
};