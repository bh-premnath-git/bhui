import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChartIcon, Copy, Database, FileWarning, Layers } from "lucide-react";

export default function ProfileStatsCard({profileData}) {
    return(
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <Card className="overflow-hidden relative border-0 shadow-md transition-all duration-300 hover:shadow-lg group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Records
                      </h3>
                      <Database className="h-4 w-4 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                              <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-800 transition-colors duration-300">
                                {profileData ? 
                                  profileData.summary.totalRows >= 1000000 ? 
                                    (profileData.summary.totalRows / 1000000).toFixed(1) + "M" : 
                                    profileData.summary.totalRows >= 1000 ? 
                                      (profileData.summary.totalRows / 1000).toFixed(1) + "K" : 
                                      profileData.summary.totalRows.toLocaleString() 
                                  : "0"}
                              </p>
                            </div>
                            <p className="text-xs text-blue-700 mt-1 opacity-80">
                              {profileData?.summary.totalRows.toLocaleString() || 0} total
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-blue-50 border border-blue-100">
                          <div className="text-sm text-blue-900">
                            <p className="font-medium">Total number of rows</p>
                            <p className="text-xs text-blue-700 mt-1">Records in the dataset</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Card>
                
                <Card className="overflow-hidden relative border-0 shadow-md transition-all duration-300 hover:shadow-lg group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-green-700 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Fields
                      </h3>
                      <Layers className="h-4 w-4 text-green-600 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                              <p className="text-3xl font-bold text-green-900 group-hover:text-green-800 transition-colors duration-300">{profileData?.summary.totalColumns || "0"}</p>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex-1 h-1.5 bg-green-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                                  style={{ width: `${Math.min(100, (profileData?.summary.totalColumns || 0) / 50 * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-green-700">columns</span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-green-50 border border-green-100">
                          <div className="text-sm text-green-900">
                            <p className="font-medium">Total number of columns</p>
                            <p className="text-xs text-green-700 mt-1">Variables/features in the dataset</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Card>
                
                <Card className="overflow-hidden relative border-0 shadow-md transition-all duration-300 hover:shadow-lg group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        Memory Size
                      </h3>
                      <Database className="h-4 w-4 text-purple-600 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                              <p className="text-3xl font-bold text-purple-900 group-hover:text-purple-800 transition-colors duration-300">
                                {profileData?.summary.memorySize ? 
                                  (profileData.summary.memorySize > 1048576 
                                    ? (profileData.summary.memorySize / 1048576).toFixed(1) 
                                    : (profileData.summary.memorySize / 1024).toFixed(1)) 
                                  : "0"}
                              </p>
                              <p className="text-lg font-medium text-purple-700">
                                {profileData?.summary.memorySize ? 
                                  (profileData.summary.memorySize > 1048576 ? "MB" : "KB") 
                                  : "KB"}
                              </p>
                            </div>
                            <p className="text-xs text-purple-700 mt-1 opacity-80">
                              total memory usage
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-purple-50 border border-purple-100">
                          <div className="text-sm text-purple-900">
                            <p className="font-medium">Total memory usage</p>
                            <p className="text-xs text-purple-700 mt-1">Memory consumed by the dataset</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Card>
                
                <Card className="overflow-hidden relative border-0 shadow-md transition-all duration-300 hover:shadow-lg group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-cyan-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-cyan-700 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        Record Size
                      </h3>
                      <BarChartIcon className="h-4 w-4 text-cyan-600 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                              <p className="text-3xl font-bold text-cyan-900 group-hover:text-cyan-800 transition-colors duration-300">
                                {profileData?.summary.recordSize ? 
                                  profileData.summary.recordSize >= 1024 ? 
                                    (profileData.summary.recordSize / 1024).toFixed(1) : 
                                    profileData.summary.recordSize.toFixed(1) 
                                  : "0"}
                              </p>
                              <p className="text-lg font-medium text-cyan-700">
                                {profileData?.summary.recordSize ? 
                                  profileData.summary.recordSize >= 1024 ? "KB" : "B" 
                                  : "B"}
                              </p>
                            </div>
                            <p className="text-xs text-cyan-700 mt-1 opacity-80">
                              per record
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-cyan-50 border border-cyan-100">
                          <div className="text-sm text-cyan-900">
                            <p className="font-medium">Average memory usage</p>
                            <p className="text-xs text-cyan-700 mt-1">Memory used per row</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Card>
                
                <Card className="overflow-hidden relative border-0 shadow-md transition-all duration-300 hover:shadow-lg group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        Missing Values
                      </h3>
                      <FileWarning className="h-4 w-4 text-amber-600 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                              <p className="text-3xl font-bold text-amber-900 group-hover:text-amber-800 transition-colors duration-300">
                                {profileData ? ((profileData.summary.missingCells / (profileData.summary.totalRows * profileData.summary.totalColumns)) * 100).toFixed(1) : "0"}
                              </p>
                              <p className="text-lg font-medium text-amber-700">%</p>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                {profileData?.summary.varsWithMissing || 0} columns affected
                              </Badge>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-amber-50 border border-amber-100">
                          <div className="text-sm text-amber-900">
                            <p className="font-medium">Missing values percentage</p>
                            <p className="text-xs text-amber-700 mt-1">
                              {profileData?.summary.missingCells.toLocaleString() || 0} cells missing
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Card>
                
                <Card className="overflow-hidden relative border-0 shadow-md transition-all duration-300 hover:shadow-lg group">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Duplicate Rows
                      </h3>
                      <Copy className="h-4 w-4 text-red-600 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                              <p className="text-3xl font-bold text-red-900 group-hover:text-red-800 transition-colors duration-300">
                                {profileData ? 
                                  profileData.summary.duplicateRows >= 1000000 ? 
                                    (profileData.summary.duplicateRows / 1000000).toFixed(1) + "M" : 
                                    profileData.summary.duplicateRows >= 1000 ? 
                                      (profileData.summary.duplicateRows / 1000).toFixed(1) + "K" : 
                                      profileData.summary.duplicateRows.toLocaleString() 
                                  : "0"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                {profileData ? (profileData.summary.duplicateRows / profileData.summary.totalRows * 100).toFixed(2) + "% of rows" : "0%"}
                              </Badge>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-50 border border-red-100">
                          <div className="text-sm text-red-900">
                            <p className="font-medium">Duplicate rows</p>
                            <p className="text-xs text-red-700 mt-1">
                              {profileData?.summary.duplicateRows.toLocaleString() || 0} duplicate records
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Card>
              </div>
    )
}