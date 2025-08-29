import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

export default function DataProfileHeader({ profileReports, profileId, isLoadingReports,
    isCreatingProfile, createProfileReport, handleProfileChange, fetchProfileReports, profileData
}: any) {
    return (
        <>
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
            <div className="mb-5 flex flex-wrap justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">{profileData?.metadata.name || "Data Profile"}</h1>
                <p className="text-gray-600 mt-2">{profileData?.metadata.description || ""}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Last updated: {profileData?.metadata.lastUpdated || "N/A"}</span>
                    <span>•</span>
                    <span>Owner: {profileData?.metadata.owner || "N/A"}</span>
                </div>
            </div>
        </>
    );
}