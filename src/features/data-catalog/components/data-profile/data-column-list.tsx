import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
 
export default function DataColumnList({profileData, selectedColumn, setSelectedColumn,getQualityBadge}: any){
    // Helper function to format numerical values to 2 decimal places
    const formatDecimal = (value: number): string => {
      return value.toFixed(2);
    };
    return (
        <Card className="col-span-1 shadow-sm border">
          <div className="p-3 border-b flex items-center justify-between bg-gray-50">
            <h3 className="font-medium text-sm text-gray-700">Columns</h3>
            <Badge variant="secondary" className="text-xs">
              {profileData?.summary.totalColumns || 0} total
            </Badge>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="p-2 space-y-1">
              {profileData?.columnStats.map((column) => (
                <div
                  key={column.name}
                  className={`
                    group relative p-2.5 rounded-md cursor-pointer transition-all
                    ${selectedColumn && selectedColumn.name === column.name
                      ? 'bg-blue-50 border-l-2 border-l-blue-500'
                      : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                    }
                  `}
                  onClick={() => setSelectedColumn(column)}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0"> {/* min-w-0 helps with text truncation */}
                      <p className="font-medium text-sm truncate" title={column.name}>
                        {column.name}
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant={column.nullPercentage > 5 ? "destructive" : "outline"}
                              className="text-[9px] px-1 h-4 shrink-0"
                            >
                              {formatDecimal(column.nullPercentage)}%
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-xs">{formatDecimal(column.nullPercentage)}% missing values</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
 
                  {/* Column Metadata */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className="text-[9px] px-1.5 h-4 bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                    >
                      {column.type}
                    </Badge>
                   
                    {profileData && getQualityBadge(column, profileData.summary.totalRows) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant={getQualityBadge(column, profileData.summary.totalRows).variant as "default" | "secondary" | "destructive" | "outline"}
                              className="text-[9px] px-1.5 h-4 flex items-center gap-0.5"
                            >
                              {getQualityBadge(column, profileData.summary.totalRows).icon}
                              <span className="truncate max-w-[80px]">
                                {getQualityBadge(column, profileData.summary.totalRows).label}
                              </span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-xs">{getQualityBadge(column, profileData.summary.totalRows).label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
 
                    {/* Additional metadata badges if needed */}
                    {profileData && column.uniqueValues === profileData.summary.totalRows && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 h-4 border-blue-200 text-blue-600"
                      >
                        Unique
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
    );
}
 