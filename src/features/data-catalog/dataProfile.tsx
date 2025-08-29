import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { ArrowUp, ArrowDown, AlertCircle, Info, RefreshCw, Database, BarChartIcon, Layers } from "lucide-react"
import { BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Bar } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { apiService } from "@/lib/api/api-service"
import { CATALOG_REMOTE_API_URL } from "@/config/platformenv"
import { toast } from "sonner"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import DataProfileHeader from "./components/data-profile/data-profile-header"
import ProfileStatsCard from "./components/data-profile/profile-stats-card"
import DataColumnList from "./components/data-profile/data-column-list"
import Overview from "./components/data-profile/overview"
import Statistics from "./components/data-profile/statistics"
import { DataProfileProps, ProfileApiResponse, ProfileData, ProfileReportResponse } from "./types"
import Distribution from "./components/data-profile/distribution"


// Enhanced modern color palette with gradients
const COLORS = {
  // Primary colors
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  primaryGradient: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',

  // Success colors
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',
  successGradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',

  // Warning colors
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  warningGradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',

  // Error colors
  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',
  errorGradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',

  // Info colors
  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
  infoGradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',

  // Additional colors
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  purpleDark: '#7C3AED',
  purpleGradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',

  pink: '#EC4899',
  pinkLight: '#F472B6',
  pinkDark: '#DB2777',
  pinkGradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',

  orange: '#F97316',
  orangeLight: '#FB923C',
  orangeDark: '#EA580C',
  orangeGradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',

  teal: '#14B8A6',
  tealLight: '#2DD4BF',
  tealDark: '#0D9488',
  tealGradient: 'linear-gradient(135deg, #14B8A6 0%, #2DD4BF 100%)',

  cyan: '#06B6D4',
  cyanLight: '#22D3EE',
  cyanDark: '#0891B2',
  cyanGradient: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',

  // Neutral colors
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  grayDark: '#4B5563',
  grayGradient: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',

  // Background colors
  bgLight: '#F9FAFB',
  bgMedium: '#F3F4F6',
  bgDark: '#E5E7EB'
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

const DataProfile = ({ dataSourceId }: DataProfileProps) => {
  const [selectedColumn, setSelectedColumn]: any = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState<boolean>(false);
  const [profileReports, setProfileReports] = useState<ProfileReportResponse[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(false);

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
          memorySize: response.report_json.table.memory_size,
          recordSize: response.report_json.table.record_size,
          varsWithMissing: response.report_json.table.n_vars_with_missing,
          varsAllMissing: response.report_json.table.n_vars_all_missing,
          // Calculate a data quality score based on missing values and duplicates
          // We're using 100 - percentage of missing cells - percentage of duplicates
          dataQualityScore: Math.round(100 * (1 - response.report_json.table.p_cells_missing - response.report_json.table.p_duplicates))
        },
        columnStats: []
      };

      // Transform the variables data into column stats
      const variables = response.report_json.variables;
      transformedData.columnStats = Object.keys(variables).map(varName => {
        const varData = variables[varName];

        // Create distribution data for charts
        let distribution: Array<{ range: string, count: number }> = [];

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
          distribution,
          // Additional fields for enhanced statistics
          n_distinct: varData.n_distinct,
          p_distinct: varData.p_distinct,
          is_unique: varData.is_unique,
          n_unique: varData.n_unique,
          p_unique: varData.p_unique,
          value_counts_without_nan: varData.value_counts_without_nan,
          value_counts_index_sorted: varData.value_counts_index_sorted,
          ordering: varData.ordering,
          n: varData.n,
          p_missing: varData.p_missing,
          count: varData.count,
          memory_size: varData.memory_size,
          n_negative: varData.n_negative,
          p_negative: varData.p_negative,
          n_infinite: varData.n_infinite,
          p_infinite: varData.p_infinite,
          n_zeros: varData.n_zeros,
          p_zeros: varData.p_zeros,
          sum: varData.sum,
          variance: varData.variance,
          kurtosis: varData.kurtosis,
          skewness: varData.skewness,
          mad: varData.mad,
          range: varData.range,
          "5%": varData["5%"],
          "25%": varData["25%"],
          "50%": varData["50%"],
          "75%": varData["75%"],
          "95%": varData["95%"],
          iqr: varData.iqr,
          cv: varData.cv,
          monotonic_increase: varData.monotonic_increase,
          monotonic_decrease: varData.monotonic_decrease,
          monotonic_increase_strict: varData.monotonic_increase_strict,
          monotonic_decrease_strict: varData.monotonic_decrease_strict,
          monotonic: varData.monotonic,
          chi_squared: varData.chi_squared
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

  return (
    <div className="p-4 bg-gray-50">
      <DataProfileHeader profileReports={profileReports} profileId={profileId} isLoadingReports={isLoadingReports}
        isCreatingProfile={isCreatingProfile} createProfileReport={createProfileReport}
        handleProfileChange={handleProfileChange} fetchProfileReports={fetchProfileReports} profileData={profileData} />
      <ProfileStatsCard profileData={profileData} />
      <div className="grid grid-cols-4 gap-4">
        <DataColumnList profileData={profileData}
          selectedColumn={selectedColumn}
          setSelectedColumn={setSelectedColumn}
          getQualityBadge={getQualityBadge} />

        <Card className="col-span-3 shadow-sm border overflow-hidden">
          <Tabs defaultValue="overview" className="w-full">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-4 pt-4">
              <TabsList className="w-full bg-white/50 border border-indigo-100/50 shadow-sm">
                <TabsTrigger value="overview" className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex items-center gap-1.5">
                  <BarChartIcon className="h-3.5 w-3.5" />
                  <span>Statistics</span>
                </TabsTrigger>
                <TabsTrigger value="distribution" className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Distribution</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-4 mt-0">
              <Overview selectedColumn={selectedColumn} />
            </TabsContent>
            <TabsContent value="statistics" className="p-4 mt-0">
              <Statistics selectedColumn={selectedColumn} />
            </TabsContent>

            <TabsContent value="distribution" className="mt-0">

              <Distribution selectedColumn={selectedColumn} COLORS={COLORS} />

            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default DataProfile
