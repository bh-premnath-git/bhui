import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, BarChartIcon, Database, Info } from 'lucide-react';
import React from 'react'

export default function Statistics({selectedColumn}) {
    return (
        <>
            {selectedColumn.type === 'Numeric' || selectedColumn.type === 'integer' || selectedColumn.type === 'decimal' ? (
                <div className="space-y-8">
                    {/* Elegant header with summary */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 shadow-sm border border-indigo-100">
                        <div className="flex items-center gap-3 mb-3">
                            <BarChartIcon className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-indigo-900">Numerical Analysis</h3>
                        </div>
                        <p className="text-sm text-indigo-700 mb-4">
                            Statistical insights for <span className="font-semibold">{selectedColumn.name}</span> with {selectedColumn.n?.toLocaleString()} values
                            {selectedColumn.nullCount > 0 && ` (${selectedColumn.nullCount.toLocaleString()} missing)`}
                        </p>

                        {/* Key metrics highlight */}
                        <div className="grid grid-cols-4 gap-4 mt-2">
                            <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-100">
                                <p className="text-xs font-medium text-indigo-500 mb-1">Range</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-semibold text-gray-900">{selectedColumn.min}</span>
                                    <span className="text-xs text-gray-500">→</span>
                                    <span className="text-lg font-semibold text-gray-900">{selectedColumn.max}</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-100">
                                <p className="text-xs font-medium text-indigo-500 mb-1">Mean</p>
                                <p className="text-lg font-semibold text-gray-900">{selectedColumn.mean?.toFixed(2)}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-100">
                                <p className="text-xs font-medium text-indigo-500 mb-1">Median</p>
                                <p className="text-lg font-semibold text-gray-900">{selectedColumn["50%"] || selectedColumn.median}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-100">
                                <p className="text-xs font-medium text-indigo-500 mb-1">Std Dev</p>
                                <p className="text-lg font-semibold text-gray-900">{selectedColumn.std?.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Statistics - Redesigned with cards */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-1 bg-indigo-600 rounded-full"></div>
                            <h3 className="text-base font-semibold text-gray-800">Basic Statistics</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Minimum", value: selectedColumn.min, icon: "↓", color: "text-blue-600", tooltip: "Smallest value in the dataset" },
                                { label: "Maximum", value: selectedColumn.max, icon: "↑", color: "text-red-600", tooltip: "Largest value in the dataset" },
                                { label: "Range", value: selectedColumn.range, icon: "↔", color: "text-purple-600", tooltip: "Difference between max and min values" },
                                { label: "Sum", value: selectedColumn.sum?.toLocaleString(), icon: "Σ", color: "text-green-600", tooltip: "Sum of all values" }
                            ].map((stat, index) => (
                                <Card key={index} className="overflow-hidden border-0 shadow-md transition-all duration-200 hover:shadow-lg">
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3">
                                        <TooltipProvider>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold ${stat.color}`}>{stat.icon}</span>
                                                    <p className="text-xs font-medium text-gray-700">{stat.label}</p>
                                                </div>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="w-3 h-3 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="text-xs">{stat.tooltip}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                        <p className="font-semibold text-base mt-2 text-gray-900">{stat.value}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Central Tendency - Redesigned with visual indicators */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
                            <h3 className="text-base font-semibold text-gray-800">Central Tendency</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Mean", value: selectedColumn.mean?.toFixed(4), icon: <span className="text-blue-500 text-xs">x̄</span>, tooltip: "Average value (arithmetic mean)" },
                                { label: "Median", value: selectedColumn["50%"] || selectedColumn.median, icon: <span className="text-blue-500 text-xs">x̃</span>, tooltip: "Middle value when sorted" },
                                { label: "MAD", value: selectedColumn.mad, icon: <span className="text-blue-500 text-xs">|x-x̄|</span>, tooltip: "Mean Absolute Deviation" },
                                { label: "CV", value: selectedColumn.cv?.toFixed(4), icon: <span className="text-blue-500 text-xs">σ/μ</span>, tooltip: "Coefficient of Variation (std/mean)" }
                            ].map((stat, index) => (
                                <Card key={index} className="overflow-hidden border-0 shadow-md transition-all duration-200 hover:shadow-lg">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
                                        <TooltipProvider>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {stat.icon}
                                                    <p className="text-xs font-medium text-gray-700">{stat.label}</p>
                                                </div>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="w-3 h-3 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="text-xs">{stat.tooltip}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                        <p className="font-semibold text-base mt-2 text-gray-900">{stat.value}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Distribution Statistics - Redesigned with visual indicators */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-1 bg-purple-600 rounded-full"></div>
                            <h3 className="text-base font-semibold text-gray-800">Distribution Statistics</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Standard Deviation", value: selectedColumn.std?.toFixed(4), icon: <span className="text-purple-500 text-xs">σ</span>, tooltip: "Measure of data spread" },
                                { label: "Variance", value: selectedColumn.variance?.toFixed(4), icon: <span className="text-purple-500 text-xs">σ²</span>, tooltip: "Square of standard deviation" },
                                { label: "Skewness", value: selectedColumn.skewness?.toFixed(4), icon: <span className="text-purple-500 text-xs">γ₁</span>, tooltip: "Measure of distribution asymmetry" },
                                { label: "Kurtosis", value: selectedColumn.kurtosis?.toFixed(4), icon: <span className="text-purple-500 text-xs">γ₂</span>, tooltip: "Measure of distribution 'tailedness'" }
                            ].map((stat, index) => (
                                <Card key={index} className="overflow-hidden border-0 shadow-md transition-all duration-200 hover:shadow-lg">
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3">
                                        <TooltipProvider>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {stat.icon}
                                                    <p className="text-xs font-medium text-gray-700">{stat.label}</p>
                                                </div>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="w-3 h-3 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="text-xs">{stat.tooltip}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                        <p className="font-semibold text-base mt-2 text-gray-900">{stat.value}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Quantiles - Enhanced with interactive visual representation */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-1 bg-cyan-600 rounded-full"></div>
                                <h3 className="text-base font-semibold text-gray-800">Quantiles</h3>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                                            <Info className="h-4 w-4 text-gray-500" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-cyan-50 border border-cyan-100 p-3 max-w-xs">
                                        <div className="text-sm text-cyan-900">
                                            <p className="font-medium mb-1">Quantile Distribution</p>
                                            <p className="text-xs text-cyan-700">
                                                Quantiles divide the data into equal portions. The median (50%) splits the data in half,
                                                while Q1 (25%) and Q3 (75%) mark the boundaries of the middle 50% of values.
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Enhanced visual quantile representation */}
                        <Card className="p-5 border-0 shadow-md overflow-hidden relative mb-4 group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                {/* Animated gradient bar */}
                                <div className="relative h-10 w-full bg-white rounded-xl shadow-inner overflow-hidden mb-4">
                                    <div className="absolute top-0 left-0 h-full w-full flex">
                                        <div className="h-full w-1/4 border-r border-white bg-gradient-to-r from-cyan-200 to-cyan-300 transition-all duration-300 group-hover:from-cyan-300 group-hover:to-cyan-400"></div>
                                        <div className="h-full w-1/4 border-r border-white bg-gradient-to-r from-cyan-300 to-cyan-400 transition-all duration-300 group-hover:from-cyan-400 group-hover:to-cyan-500"></div>
                                        <div className="h-full w-1/4 border-r border-white bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-300 group-hover:from-cyan-500 group-hover:to-cyan-600"></div>
                                        <div className="h-full w-1/4 bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all duration-300 group-hover:from-cyan-600 group-hover:to-cyan-700"></div>
                                    </div>

                                    {/* Markers with tooltips */}
                                    <div className="absolute top-0 left-0 h-full w-full flex justify-between px-2">
                                        <TooltipProvider>
                                            <div className="h-full flex items-center">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="h-6 w-1 bg-gray-800 rounded-full cursor-help transition-transform duration-300 hover:scale-y-125"></div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" className="bg-gray-900 text-white border-0">
                                                        <p className="text-xs">Minimum value: {selectedColumn["0%"] || selectedColumn.min}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <div className="h-full flex items-center">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="h-6 w-1 bg-gray-800 rounded-full cursor-help transition-transform duration-300 hover:scale-y-125"></div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" className="bg-gray-900 text-white border-0">
                                                        <p className="text-xs">First quartile (Q1): {selectedColumn["25%"]}</p>
                                                        <p className="text-xs text-gray-300">25% of values are below this point</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <div className="h-full flex items-center">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="h-8 w-1.5 bg-gray-800 rounded-full cursor-help transition-transform duration-300 hover:scale-y-110"></div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" className="bg-gray-900 text-white border-0">
                                                        <p className="text-xs">Median: {selectedColumn["50%"] || selectedColumn.median}</p>
                                                        <p className="text-xs text-gray-300">50% of values are below this point</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <div className="h-full flex items-center">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="h-6 w-1 bg-gray-800 rounded-full cursor-help transition-transform duration-300 hover:scale-y-125"></div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" className="bg-gray-900 text-white border-0">
                                                        <p className="text-xs">Third quartile (Q3): {selectedColumn["75%"]}</p>
                                                        <p className="text-xs text-gray-300">75% of values are below this point</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <div className="h-full flex items-center">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="h-6 w-1 bg-gray-800 rounded-full cursor-help transition-transform duration-300 hover:scale-y-125"></div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" className="bg-gray-900 text-white border-0">
                                                        <p className="text-xs">Maximum value: {selectedColumn["100%"] || selectedColumn.max}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                    </div>

                                    {/* Labels */}
                                    <div className="absolute -bottom-6 left-0 w-full flex justify-between px-2">
                                        <span className="text-[10px] font-semibold text-gray-700">Min</span>
                                        <span className="text-[10px] font-semibold text-gray-700">Q1</span>
                                        <span className="text-[10px] font-semibold text-gray-700">Median</span>
                                        <span className="text-[10px] font-semibold text-gray-700">Q3</span>
                                        <span className="text-[10px] font-semibold text-gray-700">Max</span>
                                    </div>
                                </div>

                                {/* Quantile values with hover effects */}
                                <div className="grid grid-cols-5 gap-2 mt-8">
                                    <div className="text-center group/item transition-all duration-300 hover:scale-105">
                                        <div className="bg-white rounded-lg p-2 shadow-sm border border-cyan-100 transition-all duration-300 group-hover/item:shadow-md group-hover/item:border-cyan-300">
                                            <p className="text-xs font-medium text-cyan-600">0% (Min)</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">{selectedColumn["0%"] || selectedColumn.min}</p>
                                        </div>
                                    </div>
                                    <div className="text-center group/item transition-all duration-300 hover:scale-105">
                                        <div className="bg-white rounded-lg p-2 shadow-sm border border-cyan-100 transition-all duration-300 group-hover/item:shadow-md group-hover/item:border-cyan-300">
                                            <p className="text-xs font-medium text-cyan-600">25% (Q1)</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">{selectedColumn["25%"]}</p>
                                        </div>
                                    </div>
                                    <div className="text-center group/item transition-all duration-300 hover:scale-105">
                                        <div className="bg-white rounded-lg p-2 shadow-sm border border-cyan-100 transition-all duration-300 group-hover/item:shadow-md group-hover/item:border-cyan-300">
                                            <p className="text-xs font-medium text-cyan-600">50% (Median)</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">{selectedColumn["50%"] || selectedColumn.median}</p>
                                        </div>
                                    </div>
                                    <div className="text-center group/item transition-all duration-300 hover:scale-105">
                                        <div className="bg-white rounded-lg p-2 shadow-sm border border-cyan-100 transition-all duration-300 group-hover/item:shadow-md group-hover/item:border-cyan-300">
                                            <p className="text-xs font-medium text-cyan-600">75% (Q3)</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">{selectedColumn["75%"]}</p>
                                        </div>
                                    </div>
                                    <div className="text-center group/item transition-all duration-300 hover:scale-105">
                                        <div className="bg-white rounded-lg p-2 shadow-sm border border-cyan-100 transition-all duration-300 group-hover/item:shadow-md group-hover/item:border-cyan-300">
                                            <p className="text-xs font-medium text-cyan-600">100% (Max)</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">{selectedColumn["100%"] || selectedColumn.max}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* IQR and outlier information - Enhanced with visual indicators */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-4 border-0 shadow-md overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800">Interquartile Range (IQR)</h4>
                                            <p className="text-xs text-gray-500">Middle 50% of the data</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-3 border border-amber-100 mb-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium text-amber-700">IQR Value</p>
                                            <p className="text-lg font-bold text-amber-900">
                                                {selectedColumn["75%"] && selectedColumn["25%"] ?
                                                    (Number(selectedColumn["75%"]) - Number(selectedColumn["25%"])).toFixed(2) : "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative h-6 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
                                        <div className="absolute top-0 left-0 h-full w-full flex">
                                            <div className="h-full flex-1 bg-gray-200"></div>
                                            <div className="h-full w-1/2 bg-amber-300"></div>
                                            <div className="h-full flex-1 bg-gray-200"></div>
                                        </div>
                                        <div className="absolute top-0 left-0 h-full w-full flex justify-between px-2">
                                            <div className="h-full flex items-center">
                                                <span className="text-[10px] font-semibold text-gray-700">Min</span>
                                            </div>
                                            <div className="h-full flex items-center">
                                                <span className="text-[10px] font-semibold text-amber-800">Q1</span>
                                            </div>
                                            <div className="h-full flex items-center">
                                                <span className="text-[10px] font-semibold text-gray-700">Median</span>
                                            </div>
                                            <div className="h-full flex items-center">
                                                <span className="text-[10px] font-semibold text-amber-800">Q3</span>
                                            </div>
                                            <div className="h-full flex items-center">
                                                <span className="text-[10px] font-semibold text-gray-700">Max</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-600">
                                        The IQR represents the middle 50% of the data, calculated as Q3 - Q1.
                                        It's a robust measure of statistical dispersion and variability.
                                    </p>
                                </div>
                            </Card>

                            <Card className="p-4 border-0 shadow-md overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800">Potential Outliers</h4>
                                            <p className="text-xs text-gray-500">Values that fall outside the expected range</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="bg-white rounded-lg p-3 border border-red-100">
                                            <p className="text-xs font-medium text-red-700 mb-1">Lower Bound</p>
                                            <p className="text-sm font-bold text-red-900">
                                                {selectedColumn["25%"] ?
                                                    (Number(selectedColumn["25%"]) - 1.5 * (Number(selectedColumn["75%"]) - Number(selectedColumn["25%"]))).toFixed(2) :
                                                    "N/A"}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-red-100">
                                            <p className="text-xs font-medium text-red-700 mb-1">Upper Bound</p>
                                            <p className="text-sm font-bold text-red-900">
                                                {selectedColumn["75%"] ?
                                                    (Number(selectedColumn["75%"]) + 1.5 * (Number(selectedColumn["75%"]) - Number(selectedColumn["25%"]))).toFixed(2) :
                                                    "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative h-6 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
                                        <div className="absolute top-0 left-0 h-full w-full flex">
                                            <div className="h-full w-1/6 bg-red-300"></div>
                                            <div className="h-full w-4/6 bg-gray-200"></div>
                                            <div className="h-full w-1/6 bg-red-300"></div>
                                        </div>
                                        <div className="absolute top-0 left-0 h-full w-full flex justify-between px-2">
                                            <div className="h-full flex items-center">
                                                <span className="text-[10px] font-semibold text-red-800">Outliers</span>
                                            </div>
                                            <div className="h-full flex items-center">
                                                <span className="text-[10px] font-semibold text-gray-700">Normal Range</span>
                                            </div>
                                            <div className="h-full flex items-center">
                                                <span className="text-[10px] font-semibold text-red-800">Outliers</span>
                                            </div>
                                        </div>
                                    </div>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                                    Values outside these bounds may be considered outliers
                                                    <Info className="h-3 w-3 text-gray-400" />
                                                </p>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-gray-900 text-white border-0 p-3 max-w-xs">
                                                <p className="text-xs">
                                                    Outliers are calculated using the 1.5 × IQR rule: values below Q1 - 1.5 × IQR or
                                                    above Q3 + 1.5 × IQR are potential outliers. These may represent errors or
                                                    genuinely unusual values.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Elegant header with summary for categorical data */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 shadow-sm border border-emerald-100">
                        <div className="flex items-center gap-3 mb-3">
                            <Database className="h-5 w-5 text-emerald-600" />
                            <h3 className="text-lg font-semibold text-emerald-900">Categorical Analysis</h3>
                        </div>
                        <p className="text-sm text-emerald-700 mb-4">
                            Distribution insights for <span className="font-semibold">{selectedColumn.name}</span> with {selectedColumn.uniqueValues?.toLocaleString()} unique values
                            {selectedColumn.nullCount > 0 && ` (${selectedColumn.nullCount.toLocaleString()} missing)`}
                        </p>

                        {/* Key metrics highlight */}
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-100">
                                <p className="text-xs font-medium text-emerald-500 mb-1">Unique Values</p>
                                <p className="text-lg font-semibold text-gray-900">{selectedColumn.uniqueValues?.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">({(selectedColumn.p_distinct * 100).toFixed(1)}% of total)</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-100">
                                <p className="text-xs font-medium text-emerald-500 mb-1">Most Common</p>
                                <p className="text-lg font-semibold text-gray-900 truncate" title={selectedColumn.mode}>
                                    {selectedColumn.mode || "N/A"}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-100">
                                <p className="text-xs font-medium text-emerald-500 mb-1">Entropy</p>
                                <p className="text-lg font-semibold text-gray-900">{selectedColumn.entropy?.toFixed(2) || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Most Common Values - Redesigned with visual bars */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-1 bg-emerald-600 rounded-full"></div>
                            <h3 className="text-base font-semibold text-gray-800">Most Common Values</h3>
                        </div>
                        <Card className="border-0 shadow-md overflow-hidden">
                            <div className="bg-gradient-to-b from-emerald-50 to-white p-4">
                                {Object.entries(selectedColumn.value_counts_without_nan || {}).slice(0, 5).map(([value, count]: any, index) => {
                                    const percentage = (count / selectedColumn.n * 100);
                                    return (
                                        <div key={index} className="mb-3 last:mb-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full bg-emerald-${500 - index * 100 > 100 ? 500 - index * 100 : 500}`}></div>
                                                    <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]" title={value}>{value}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-700">{count.toLocaleString()}</span>
                                                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-emerald-${500 - index * 100 > 100 ? 500 - index * 100 : 500} rounded-full`}
                                                    style={{ width: `${percentage > 3 ? percentage : 3}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                    {/* Cardinality Analysis */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-1 bg-teal-600 rounded-full"></div>
                            <h3 className="text-base font-semibold text-gray-800">Cardinality Analysis</h3>
                        </div>
                        <Card className="border-0 shadow-md p-5 bg-gradient-to-r from-teal-50 to-cyan-50">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Cardinality Ratio</p>
                                    <p className="text-xs text-gray-600">Unique values / Total values</p>
                                </div>
                                <Badge variant="outline" className="px-2 py-1 bg-white text-teal-700 border-teal-200">
                                    {selectedColumn.is_unique ? "Unique Identifier" :
                                        selectedColumn.p_distinct > 0.9 ? "High Cardinality" :
                                            selectedColumn.p_distinct < 0.01 ? "Low Cardinality" : "Medium Cardinality"}
                                </Badge>
                            </div>

                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block text-teal-600">
                                            {(selectedColumn.p_distinct * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-teal-100">
                                    <div style={{ width: `${selectedColumn.p_distinct * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500"></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Low (0%)</span>
                                    <span>Medium (50%)</span>
                                    <span>High (100%)</span>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
                                <p className="text-xs text-gray-700">
                                    {selectedColumn.is_unique ?
                                        "This column contains unique values for each row, making it suitable as an identifier or key." :
                                        selectedColumn.p_distinct > 0.9 ?
                                            "This column has high cardinality, with most values being unique. It may be an identifier or contain very specific information." :
                                            selectedColumn.p_distinct < 0.01 ?
                                                "This column has very low cardinality, with few unique values. It likely represents a category with limited options." :
                                                "This column has medium cardinality, with a moderate number of unique values relative to the total count."}
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </>
    )
}
