import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart } from "@/components/bh-charts/BarChart"
import { useState, useEffect } from "react"
import { ArrowUp, ArrowDown, AlertCircle, Info, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { apiService } from "@/lib/api/api-service"
import { CATALOG_REMOTE_API_URL } from "@/config/platformenv"
import { toast } from "sonner"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Fallback mock data for development and preview
const mockProfileData = {
  metadata: {
    name: "Customer Transaction Dataset",
    description: "Historical customer transaction data from retail operations",
    lastUpdated: "2025-03-15",
    owner: "Retail Analytics Team"
  },
  summary: {
    totalRows: 1243567,
    totalColumns: 24,
    missingCells: 39794,
    duplicateRows: 124,
    dataQualityScore: 87,
  },
  columnStats: [
    {
      name: "customer_id",
      type: "string",
      uniqueValues: 1241234,
      nullCount: 152843,
      nullPercentage: 12.3,
      duplicates: 2333,
      pattern: "CUST_[0-9]{6}",
      examples: ["CUST_123456", "CUST_789012"],
      distribution: [
        { range: "CUST_1xxxxx", count: 250000 },
        { range: "CUST_2xxxxx", count: 280000 },
        { range: "CUST_3xxxxx", count: 220000 },
        { range: "CUST_4xxxxx", count: 245000 },
        { range: "CUST_5xxxxx", count: 248567 },
      ]
    },
    {
      name: "transaction_date",
      type: "date",
      uniqueValues: 365,
      nullCount: 0,
      nullPercentage: 0,
      min: "2024-01-01",
      max: "2024-12-31",
      distribution: [
        { range: "Q1 2024", count: 310892 },
        { range: "Q2 2024", count: 298567 },
        { range: "Q3 2024", count: 315789 },
        { range: "Q4 2024", count: 318319 },
      ]
    },
    {
      name: "purchase_amount",
      type: "decimal",
      uniqueValues: 8234,
      nullCount: 0,
      nullPercentage: 0,
      min: 0.99,
      max: 9999.99,
      mean: 127.45,
      median: 89.99,
      stdDev: 245.67,
      distribution: [
        { range: "$0-$50", count: 456789 },
        { range: "$51-$100", count: 345678 },
        { range: "$101-$500", count: 234567 },
        { range: "$501-$1000", count: 123456 },
        { range: "$1000+", count: 83077 },
      ]
    },
    {
      name: "payment_method",
      type: "categorical",
      uniqueValues: 5,
      nullCount: 45987,
      nullPercentage: 3.7,
      distribution: [
        { range: "Credit Card", count: 623456 },
        { range: "Debit Card", count: 412345 },
        { range: "Digital Wallet", count: 98765 },
        { range: "Cash", count: 45678 },
        { range: "Other", count: 17336 },
      ]
    },
    {
      name: "store_id",
      type: "string",
      uniqueValues: 1243,
      nullCount: 1243,
      nullPercentage: 0.1,
      pattern: "ST[0-9]{4}",
      distribution: [
        { range: "ST0xxx", count: 312345 },
        { range: "ST1xxx", count: 298765 },
        { range: "ST2xxx", count: 321234 },
        { range: "ST3xxx", count: 311223 },
      ]
    },
    {
      name: "customer_age",
      type: "integer",
      uniqueValues: 72,
      nullCount: 24871,
      nullPercentage: 2.0,
      min: 18,
      max: 89,
      mean: 42.5,
      median: 41,
      stdDev: 12.3,
      distribution: [
        { range: "18-25", count: 156789 },
        { range: "26-35", count: 345678 },
        { range: "36-45", count: 378901 },
        { range: "46-55", count: 234567 },
        { range: "56+", count: 127632 },
      ]
    },
    {
      name: "customer_zipcode",
      type: "string",
      uniqueValues: 3456,
      nullCount: 101972,
      nullPercentage: 8.2,
      pattern: "[0-9]{5}",
      distribution: [
        { range: "10xxx", count: 234567 },
        { range: "11xxx", count: 198765 },
        { range: "12xxx", count: 167890 },
        { range: "Other", count: 642345 },
      ]
    },
    {
      name: "product_category",
      type: "categorical",
      uniqueValues: 8,
      nullCount: 0,
      nullPercentage: 0,
      distribution: [
        { range: "Electronics", count: 289765 },
        { range: "Clothing", count: 345678 },
        { range: "Home & Garden", count: 234567 },
        { range: "Food & Beverage", count: 198765 },
        { range: "Others", count: 174792 },
      ]
    },
    {
      name: "satisfaction_score",
      type: "integer",
      uniqueValues: 5,
      nullCount: 37307,
      nullPercentage: 3.0,
      min: 1,
      max: 5,
      mean: 4.2,
      median: 4,
      stdDev: 0.8,
      distribution: [
        { range: "1 Star", count: 24871 },
        { range: "2 Stars", count: 49742 },
        { range: "3 Stars", count: 248710 },
        { range: "4 Stars", count: 447678 },
        { range: "5 Stars", count: 472566 },
      ]
    },
    {
      name: "transaction_time",
      type: "time",
      uniqueValues: 1440,
      nullCount: 0,
      nullPercentage: 0,
      distribution: [
        { range: "Morning (6-12)", count: 372891 },
        { range: "Afternoon (12-17)", count: 447469 },
        { range: "Evening (17-22)", count: 298765 },
        { range: "Night (22-6)", count: 124442 },
      ]
    }
  ]
}

const COLORS = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  teal: '#14B8A6',
  cyan: '#06B6D4'
}


// Helper function for quality badges
const getQualityBadge = (column, totalRows: number) => {
  if (column.nullPercentage > 10) {
    return {
      label: "High Missing Values",
      variant: "destructive",
      icon: <AlertCircle className="w-3 h-3" />
    };
  } else if ((column.type === 'categorical' || column.type === 'Categorical') && column.uniqueValues < 3) {
    return {
      label: "Low Cardinality",
      variant: "warning",
      icon: <ArrowDown className="w-3 h-3" />
    };
  } else if ((column.type === 'string' || column.type === 'Text') && column.uniqueValues === totalRows) {
    return {
      label: "Unique Identifier",
      variant: "success",
      icon: <ArrowUp className="w-3 h-3" />
    };
  }
  return null;
};

// For easier type management
type ColumnStat = typeof mockProfileData.columnStats[0];

// Types for API responses
interface ProfileReportResponse {
  data_profile_id: number;
  data_src_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  status: string;
}

interface ProfileApiResponse {
  data_profile_id: number;
  data_src_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  report_json: {
    analysis: {
      title: string;
      date_start: string;
      date_end: string;
    };
    time_index_analysis: string;
    table: {
      n: number;
      n_var: number;
      memory_size: number;
      record_size: number;
      n_cells_missing: number;
      n_vars_with_missing: number;
      n_vars_all_missing: number;
      p_cells_missing: number;
      types: {
        Numeric: number;
        Text: number;
        DateTime: number;
        Categorical: number;
      };
      n_duplicates: number;
      p_duplicates: number;
    };
    variables: Record<string, {
      n_distinct: number;
      p_distinct: number;
      is_unique: boolean;
      n_unique: number;
      p_unique: number;
      type: string;
      hashable: boolean;
      value_counts_without_nan?: Record<string, number>;
      value_counts_index_sorted?: Record<string, number>;
      ordering?: boolean;
      n_missing: number;
      n: number;
      p_missing: number;
      count: number;
      memory_size: number;
      mean?: number;
      std?: number;
      min?: number | string;
      max?: number | string;
      median?: number;
      histogram?: {
        counts: number[];
        bin_edges: number[] | string[];
      };
      distribution?: Array<{range: string, count: number}>;
      [key: string]: any;
    }>;
  };
}

// Transformed data for our UI
interface ProfileData {
  metadata: {
    name: string;
    description: string;
    lastUpdated: string;
    owner: string;
  };
  summary: {
    totalRows: number;
    totalColumns: number;
    missingCells: number;
    duplicateRows: number;
    dataQualityScore: number;
  };
  columnStats: ColumnStat[];
}

interface DataProfileProps {
  dataSourceId?: number;
}

const DataProfile = ({ dataSourceId }: DataProfileProps) => {
  const [selectedColumn, setSelectedColumn] = useState<ColumnStat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState<boolean>(false);
  const [profileReports, setProfileReports] = useState<ProfileReportResponse[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(false);

  // Fetch the latest profile report for the data source
  const fetchLatestProfileReport = async () => {
    if (!dataSourceId) return;
    
    setIsLoading(true);
    setIsError(false);
    
    try {
      const response = await apiService.get<ProfileReportResponse>({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/data-profile/data-source/${dataSourceId}/latest-profile-report`,
        method: 'GET',
        usePrefix: true,
        metadata: {
          errorMessage: 'Failed to fetch profile report'
        }
      });
      
      if (response && response.data_profile_id) {
        setProfileId(response.data_profile_id);
        await fetchProfileData(response.data_profile_id);
      } else {
        // No profile report found
        setProfileData(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching profile report:', error);
      // Instead of setting error state, we'll set profileData to null
      // This will trigger the UI to show the "Create Profile Report" button
      setProfileData(null);
      setIsLoading(false);
    }
  };

  // Fetch the detailed profile data using the profile ID
  const fetchProfileData = async (profileId: number) => {
    try {
      const response = await apiService.get<ProfileApiResponse>({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/data-profile/${profileId}`,
        method: 'GET',
        usePrefix: true,
        metadata: {
          errorMessage: 'Failed to fetch profile data'
        }
      });
      
      // Transform the API response into the format our UI expects
      const transformedData: any = {
        metadata: {
          name: response.report_json.analysis.title || "Data Profile",
          description: `Profile generated for data source ${response.data_src_id}`,
          lastUpdated: new Date(response.updated_at).toLocaleDateString(),
          owner: `User ${response.created_by}`
        },
        summary: {
          totalRows: response.report_json.table.n,
          totalColumns: response.report_json.table.n_var,
          missingCells: response.report_json.table.n_cells_missing,
          duplicateRows: response.report_json.table.n_duplicates,
          // Calculate a data quality score based on missing values and duplicates
          dataQualityScore: Math.round(100 * (1 - response.report_json.table.p_cells_missing))
        },
        columnStats: []
      };
      
      // Transform the variables data into column stats
      const variables = response.report_json.variables;
      transformedData.columnStats = Object.keys(variables).map(varName => {
        const varData = variables[varName];
        
        // Create distribution data for charts
        let distribution: Array<{range: string, count: number}> = [];
        
        // Try to create distribution from value_counts_without_nan
        if (varData.value_counts_without_nan) {
          distribution = Object.entries(varData.value_counts_without_nan)
            .slice(0, 10) // Take top 10 values
            .map(([range, count]) => ({ range, count }));
        } 
        // Or try to create from histogram if available
        else if (varData.histogram && varData.histogram.counts && varData.histogram.bin_edges) {
          const counts = varData.histogram.counts;
          const binEdges = varData.histogram.bin_edges;
          
          // Create distribution from histogram data
          distribution = counts.slice(0, 10).map((count, index) => {
            let range = "";
            if (index < binEdges.length - 1) {
              range = `${binEdges[index]} - ${binEdges[index + 1]}`;
            } else {
              range = `${binEdges[index]}+`;
            }
            return { range, count };
          });
        }
        
        return {
          name: varName,
          type: varData.type,
          uniqueValues: varData.n_distinct,
          nullCount: varData.n_missing,
          nullPercentage: varData.p_missing * 100,
          duplicates: varData.n - varData.n_unique,
          min: varData.min,
          max: varData.max,
          mean: varData.mean,
          median: varData.median,
          stdDev: varData.std,
          distribution
        };
      });
      
      setProfileData(transformedData);
      if (transformedData.columnStats && transformedData.columnStats.length > 0) {
        setSelectedColumn(transformedData.columnStats[0]);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // If we can't fetch the profile data, set profileData to null
      // This will trigger the UI to show the "Create Profile Report" button
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new profile report
  const createProfileReport = async () => {
    if (!dataSourceId) return;
    
    setIsCreatingProfile(true);
    
    try {
      await apiService.post({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/data-profile/${dataSourceId}/trigger-profile-report`,
        method: 'POST',
        usePrefix: true,
        metadata: {
          successMessage: 'Profile report creation initiated',
          errorMessage: 'Failed to create profile report'
        }
      });
      
      // After initiating profile creation, fetch the profile reports
      await fetchProfileReports();
    } catch (error) {
      console.error('Error creating profile report:', error);
      toast.error('Failed to create profile report');
      // Even if creation fails, we still want to check if there's an existing profile
      // This handles the case where the profile was already being created
      setTimeout(() => {
        fetchProfileReports();
      }, 2000); // Wait 2 seconds before checking again
    } finally {
      setIsCreatingProfile(false);
    }
  };

  // Fetch all profile reports for the data source
  const fetchProfileReports = async () => {
    if (!dataSourceId) return;
    
    setIsLoadingReports(true);
    
    try {
      const response = await apiService.get<ProfileReportResponse[]>({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/data-profile/data-source/${dataSourceId}/profile-reports`,
        method: 'GET',
        usePrefix: true,
        metadata: {
          errorMessage: 'Failed to fetch profile reports'
        }
      });
      
      setProfileReports(response);
      
      // If we have profile reports and no profile is currently selected,
      // select the most recent one (which should be the first in the array)
      if (response.length > 0 && !profileId) {
        // Sort by created_at in descending order to get the most recent first
        const sortedReports = [...response].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setProfileId(sortedReports[0].data_profile_id);
        await fetchProfileData(sortedReports[0].data_profile_id);
      }
    } catch (error) {
      console.error('Error fetching profile reports:', error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Handle profile selection change
  const handleProfileChange = async (profileId: number) => {
    setProfileId(profileId);
    setIsLoading(true);
    await fetchProfileData(profileId);
  };

  // Load profile data when component mounts or dataSourceId changes
  useEffect(() => {
    if (dataSourceId) {
      fetchProfileReports();
    } else {
      // Use mock data when no dataSourceId is provided (for development)
      setProfileData(mockProfileData);
      setSelectedColumn(mockProfileData.columnStats[0]);
    }
  }, [dataSourceId]);

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <LoadingState className="w-20 h-20" />
      </div>
    );
  }

  // If error, show error state
  if (isError) {
    return (
      <div className="p-8">
        <ErrorState message="Failed to load data profile. Please try again later." />
      </div>
    );
  }

  // If no profile data and not loading, show create profile button
  if (!profileData && !isLoading && dataSourceId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">No profile data available for this data source.</p>
        <div className="flex gap-3">
          <Button 
            onClick={createProfileReport} 
            disabled={isCreatingProfile}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white"
            variant="default"
          >
            {isCreatingProfile ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              <>
                Create Profile Report
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchProfileReports}
            disabled={isCreatingProfile}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Check Again
          </Button>
        </div>
      </div>
    );
  }

  // If we have profile data, compute completeness
  const completeness = profileData ? 100 - (profileData.summary.missingCells / 
    (profileData.summary.totalRows * profileData.summary.totalColumns) * 100) : 0;

  return (
    <div className="p-4 bg-gray-50">
      {/* Profile Selection and Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {profileReports.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Profile Report:</label>
              <Select
                value={profileId?.toString()}
                onValueChange={(value) => handleProfileChange(parseInt(value))}
                disabled={isLoadingReports}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select a profile report" />
                </SelectTrigger>
                <SelectContent>
                  {profileReports
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((report) => (
                      <SelectItem key={report.data_profile_id} value={report.data_profile_id.toString()}>
                        {new Date(report.created_at).toLocaleString()} {report.status === 'completed' ? '✓' : '⏳'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={createProfileReport}
            disabled={isCreatingProfile}
            className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white"
          >
            {isCreatingProfile ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Create New Profile
              </>
            )}
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchProfileReports}
          className="flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>
      
      {/* Compact Header */}
      <div className="mb-5 flex flex-wrap justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{profileData?.metadata.name || "Data Profile"}</h1>
        <p className="text-gray-600 mt-2">{profileData?.metadata.description || ""}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>Last updated: {profileData?.metadata.lastUpdated || "N/A"}</span>
          <span>•</span>
          <span>Owner: {profileData?.metadata.owner || "N/A"}</span>
        </div>
      </div>

      {/* Compact Summary Stats */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <h3 className="text-sm font-medium text-blue-700">Records</h3>
          <p className="text-2xl font-bold text-blue-900">{profileData?.summary.totalRows.toLocaleString() || "0"}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <h3 className="text-sm font-medium text-green-700">Fields</h3>
          <p className="text-2xl font-bold text-green-900">{profileData?.summary.totalColumns || "0"}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <h3 className="text-sm font-medium text-purple-700">Data Quality Score</h3>
          <div className="mt-2">
            <Progress 
              value={profileData?.summary.dataQualityScore || 0} 
              className="h-1.5 bg-purple-200 [&>div]:bg-purple-600" 
            />
            <p className="mt-1 text-lg font-semibold text-purple-900">{profileData?.summary.dataQualityScore || 0}%</p>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-700">Missing Values</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {profileData ? ((profileData.summary.missingCells / (profileData.summary.totalRows * profileData.summary.totalColumns)) * 100).toFixed(1) + "%" : "0%"}
          </p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <h3 className="text-sm font-medium text-red-700">Duplicate Rows</h3>
          <p className="text-2xl font-bold text-red-900">{profileData?.summary.duplicateRows.toLocaleString() || "0"}</p>
        </Card>
      </div>

      {/* Main Content with Grid Layout */}
      <div className="grid grid-cols-4 gap-4">
        {/* Column List - Enhanced UI */}
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
                              {column.nullPercentage}%
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-xs">{column.nullPercentage}% missing values</p>
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

        {/* Column Details - More Compact */}
        <Card className="col-span-3 shadow-sm border">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-4 mt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <p className="font-medium text-sm mt-1">{selectedColumn.uniqueValues.toLocaleString()}</p>
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
                      {selectedColumn.nullPercentage}%
                    </Badge>
                  </div>
                </Card>

                {selectedColumn.pattern && (
                  <Card className="p-3 border shadow-sm bg-gray-50">
                    <p className="text-xs text-gray-500">Pattern</p>
                    <p className="font-medium text-sm mt-1 font-mono">{selectedColumn.pattern}</p>
                  </Card>
                )}

                {selectedColumn.examples && (
                  <Card className="p-3 border shadow-sm bg-gray-50">
                    <p className="text-xs text-gray-500">Examples</p>
                    <div className="mt-1 space-y-1">
                      {selectedColumn.examples.map((ex, i) => (
                        <p key={i} className="text-xs font-mono bg-white p-1 rounded border">{ex}</p>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="p-4 mt-0">
              {selectedColumn.type === 'integer' || selectedColumn.type === 'decimal' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-3 border shadow-sm bg-gray-50">
                      <TooltipProvider>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Minimum</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Smallest value in the dataset</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                      <p className="font-medium text-sm mt-1">{selectedColumn.min}</p>
                    </Card>

                    <Card className="p-3 border shadow-sm bg-gray-50">
                      <TooltipProvider>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Maximum</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Largest value in the dataset</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                      <p className="font-medium text-sm mt-1">{selectedColumn.max}</p>
                    </Card>

                    <Card className="p-3 border shadow-sm bg-gray-50">
                      <TooltipProvider>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Mean</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Average value</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                      <p className="font-medium text-sm mt-1">{selectedColumn.mean}</p>
                    </Card>

                    <Card className="p-3 border shadow-sm bg-gray-50">
                      <TooltipProvider>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Standard Deviation</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Measure of data spread</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                      <p className="font-medium text-sm mt-1">{selectedColumn.stdDev}</p>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Advanced statistics not available for {selectedColumn.type} type</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="distribution" className="mt-0">
              <div className="p-3">
                <p className="text-xs font-medium text-gray-700 mb-3">Distribution of {selectedColumn.name}</p>
                <div className="h-[300px]">
                  <BarChart
                    data={selectedColumn.distribution}
                    xAxisDataKey="range"
                    bars={["count"]}
                    colors={[COLORS.primary]}
                    config={{
                      valueFormatter: (value) => value.toLocaleString(),
                      labels: ["Count"]
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default DataProfile
