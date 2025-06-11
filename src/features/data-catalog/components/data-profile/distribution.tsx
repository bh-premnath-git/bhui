import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import React from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, XAxis, YAxis,Tooltip as RechartsTooltip } from 'recharts'

export default function Distribution({selectedColumn,COLORS}) {
    return (
        <div className="p-5 bg-gradient-to-br from-white to-indigo-50/30">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-indigo-600 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-gray-800">Distribution of {selectedColumn.name}</h3>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                                <Info className="h-4 w-4 text-gray-500" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-indigo-50 border border-indigo-100 p-3 max-w-xs">
                            <div className="text-sm text-indigo-900">
                                <p className="font-medium mb-1">Distribution Chart</p>
                                <p className="text-xs text-indigo-700">
                                    This chart shows the frequency distribution of values in the {selectedColumn.name} column.
                                    Hover over bars to see exact counts.
                                </p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="h-[350px] bg-white p-4 rounded-lg shadow-sm border border-indigo-100/50">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={selectedColumn.distribution}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 20,
                            bottom: 20,
                        }}
                        barSize={60}
                        barGap={2}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="range"
                            tick={{ fill: '#4B5563', fontSize: 12 }}
                            tickLine={{ stroke: '#9CA3AF' }}
                            axisLine={{ stroke: '#D1D5DB' }}
                        />
                        <YAxis
                            tick={{ fill: '#4B5563', fontSize: 12 }}
                            tickLine={{ stroke: '#9CA3AF' }}
                            axisLine={{ stroke: '#D1D5DB' }}
                            tickFormatter={(value) =>
                                value >= 1000000
                                    ? `${(value / 1000000).toFixed(1)}M`
                                    : value >= 1000
                                        ? `${(value / 1000).toFixed(1)}K`
                                        : value
                            }
                        />
                        <RechartsTooltip
                            cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #E0E7FF',
                                borderRadius: '6px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            formatter={(value) => [value.toLocaleString(), 'Count']}
                            labelFormatter={(label) => `Range: ${label}`}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '10px' }}
                            formatter={(value) => <span className="text-xs font-medium text-gray-700">{value}</span>}
                        />
                        <Bar
                            dataKey="count"
                            name="Count"
                            radius={[4, 4, 0, 0]}
                            fill="url(#colorGradient)"
                            animationDuration={1000}
                            animationEasing="ease-out"
                        >
                            {/* Add hover effect for each bar */}
                            {selectedColumn.distribution?.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    className="transition-opacity duration-200 hover:opacity-80"
                                />
                            ))}
                        </Bar>
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLORS.primaryLight} />
                                <stop offset="100%" stopColor={COLORS.primary} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Distribution summary */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="p-3 border-0 shadow-sm bg-white">
                    <p className="text-xs font-medium text-indigo-600 mb-1">Distribution Type</p>
                    <p className="text-sm font-semibold text-gray-800">
                        {selectedColumn.skewness ?
                            selectedColumn.skewness > 0.5 ? "Right-skewed" :
                                selectedColumn.skewness < -0.5 ? "Left-skewed" :
                                    "Approximately normal" :
                            "Categorical distribution"}
                    </p>
                </Card>
                <Card className="p-3 border-0 shadow-sm bg-white">
                    <p className="text-xs font-medium text-indigo-600 mb-1">Most Common Range</p>
                    <p className="text-sm font-semibold text-gray-800">
                        {selectedColumn.distribution &&
                            [...selectedColumn.distribution].sort((a, b) => b.count - a.count)[0]?.range}
                    </p>
                </Card>
                <Card className="p-3 border-0 shadow-sm bg-white">
                    <p className="text-xs font-medium text-indigo-600 mb-1">Value Spread</p>
                    <p className="text-sm font-semibold text-gray-800">
                        {selectedColumn.type === 'numeric' || selectedColumn.type === 'Numeric' ?
                            `${selectedColumn.min} to ${selectedColumn.max}` :
                            `${selectedColumn.uniqueValues} unique values`}
                    </p>
                </Card>
            </div>
        </div>)
}
