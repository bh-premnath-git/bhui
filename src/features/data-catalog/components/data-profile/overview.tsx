import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
 
export default function Overview({selectedColumn}:any) {
    // Helper function to format numerical values to 2 decimal places
    const formatDecimal = (value: number): string => {
      return value.toFixed(2);
    };
    return (
        <div className="space-y-6">
            {/* Column Summary */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Column Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-3 border shadow-sm bg-gray-50">
                        <TooltipProvider>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">Data Type</p>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3 h-3 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">Type of data in this column</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </TooltipProvider>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-medium text-sm">{selectedColumn.type}</span>
                            <Badge variant="outline" className="text-[9px] px-1 h-4 bg-blue-50 text-blue-700">
                                {selectedColumn.is_unique ? "Unique" : selectedColumn.p_distinct > 0.9 ? "High Cardinality" :
                                    selectedColumn.p_distinct < 0.01 ? "Low Cardinality" : "Medium Cardinality"}
                            </Badge>
                        </div>
                    </Card>
 
                    <Card className="p-3 border shadow-sm bg-gray-50">
                        <TooltipProvider>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">Unique Values</p>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3 h-3 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">Count of distinct values</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </TooltipProvider>
                        <div className="flex flex-col mt-1">
                            <span className="font-medium text-sm">{selectedColumn.uniqueValues.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">({(selectedColumn.p_distinct * 100).toFixed(2)}% of total)</span>
                        </div>
                    </Card>
 
                    <Card className="p-3 border shadow-sm bg-gray-50">
                        <TooltipProvider>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">Null Values</p>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3 h-3 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">Count of missing values</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </TooltipProvider>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-medium text-sm">{selectedColumn.nullCount.toLocaleString()}</span>
                            <Badge variant={selectedColumn.nullPercentage > 5 ? "destructive" : "outline"}
                                className="text-[9px] px-1 h-4">
                                {formatDecimal(selectedColumn.nullPercentage)}%
                            </Badge>
                        </div>
                    </Card>
 
                    <Card className="p-3 border shadow-sm bg-gray-50">
                        <TooltipProvider>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">Memory Usage</p>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3 h-3 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">Memory used by this column</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </TooltipProvider>
                        <p className="font-medium text-sm mt-1">
                            {selectedColumn.memory_size ?
                                (selectedColumn.memory_size > 1048576
                                    ? (selectedColumn.memory_size / 1048576).toFixed(2) + " MB"
                                    : (selectedColumn.memory_size / 1024).toFixed(2) + " KB")
                                : "0 KB"}
                        </p>
                    </Card>
                </div>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedColumn.pattern && (
                    <Card className="p-3 border shadow-sm bg-gray-50">
                        <p className="text-xs text-gray-500 mb-2">Pattern</p>
                        <p className="font-medium text-sm font-mono bg-white p-2 rounded border">{selectedColumn.pattern}</p>
                    </Card>
                )}
 
                {selectedColumn.examples && (
                    <Card className="p-3 border shadow-sm bg-gray-50">
                        <p className="text-xs text-gray-500 mb-2">Examples</p>
                        <div className="space-y-1">
                            {selectedColumn.examples.map((ex, i) => (
                                <p key={i} className="text-xs font-mono bg-white p-2 rounded border">{ex}</p>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
 
            {/* Top Values */}
            {selectedColumn.value_counts_without_nan && (
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Most Common Values</h3>
                    <Card className="p-3 border shadow-sm">
                        <div className="grid grid-cols-1 gap-2">
                            {Object.entries(selectedColumn.value_counts_without_nan).slice(0, 5).map(([value, count]: any, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium font-mono">{value}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{count} occurrences</span>
                                        <span className="text-xs text-gray-500">({(count / selectedColumn.n * 100).toFixed(2)}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}