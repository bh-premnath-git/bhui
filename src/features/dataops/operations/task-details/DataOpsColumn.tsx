import React, { useState } from "react";
import {
  CheckCircle2,
  Globe,
  RotateCw,
  SkipForward,
  StopCircle,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import CostOptimizationForm from "./CostOptimizationForm";
import ExploreDrawer from "./ExploreDrawer";
import StopPopUp from "./StopPopUp";
import RestartPopUp from "./RestartPopUp";
import SkipPopUp from "./SkipPopUp";

const rootStyle = getComputedStyle(document.documentElement);

const COLORS = [
  rootStyle.getPropertyValue("--chart-1-color").trim(),
  rootStyle.getPropertyValue("--chart-2-color").trim(),
  rootStyle.getPropertyValue("--chart-5-color").trim(),
];

type ColumnConfig = {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: "text" | "number" | "date" | "badge";
  badgeConfig?: {
    colorMap: Record<string, string>;
  };
  render?: (value: any, row: any) => React.ReactNode;
  align?: "left" | "center" | "right";
};

const formatDuration = (start: string, end: string): string => {
  try {
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return "Invalid Time";
    }

    const diffInSeconds = Math.abs(
      Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    );
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;

    return `${minutes} min ${seconds} sec`;
  } catch (error) {
    console.error("Error in formatDuration:", error);
    return "Invalid Time";
  }
};

export const dataopsColumn: ColumnConfig[] = [
  {
    key: "flow_name",
    header: "Flow",
    type: "number",
    sortable: false,
    filterable: false,
    render: (value: any) => {
      const [isExpanded, setIsExpanded] = useState(false);
      const [open, setOpen] = useState(false);

      const toggleDrawer = (newState: boolean) => () => {
        try {
          setOpen(newState);
          if (!newState) {
            setIsExpanded(false);
          }
        } catch (error) {
          console.error("Error in toggleDrawer:", error);
          setOpen(false);
          setIsExpanded(false);
        }
      };

      const handleClick = (e: React.MouseEvent) => {
        try {
          e.stopPropagation();
          setOpen(true);
          setIsExpanded(!isExpanded);
        } catch (error) {
          console.error("Error in handleClick:", error);
        }
      };

      return (
        <>
          <div className="text-black flex items-center gap-2 hover:bg-gray-50 rounded px-2 py-1">
            {value}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Globe
                    className="text-green-600 hover:text-green-800 cursor-pointer mb-2 h-5 w-5"
                    onClick={handleClick}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Explore Flow</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {open && (
            <ExploreDrawer
              isExpanded={isExpanded}
              toggleDrawer={toggleDrawer}
              handleClick={handleClick}
            />
          )}
        </>
      );
    },
  },
  {
    key: "project_name",
    header: "Project",
    type: "number",
    sortable: false,
    filterable: false,
    align: "left",
  },
  {
    key: "flow_status",
    header: "Status",
    type: "number",
    filterable: false,
    sortable: false,
    align: "center",
    render: (value: any) => (
      <div
        style={{
          backgroundColor:
            value === "Success"
              ? COLORS[0]
              : value === "Failed"
              ? COLORS[2]
              : COLORS[1],
          color: "white",
          padding: 5,
          borderRadius: "15px",
          width: "90px",
          textAlign: "center",
        }}
      >
        {value}
      </div>
    ),
  },
  {
    key: "job_start_time",
    header: "Start Time",
    type: "number",
    sortable: false,
    filterable: false,
    align: "left",
  },
  {
    key: "duration",
    header: "Duration",
    type: "number",
    sortable: false,
    align: "left",
    render: (value: any, row: any) => (
      <div className="pr-0 mr-0">{formatDuration(row.job_start_time, row.job_end_time)}</div>
    ),
  },
  {
    key: "created_by",
    header: "Owner",
    type: "number",
    sortable: false,
    align: "left",
  },
  {
    key: "action",
    header: "Action",
    type: "number",
    sortable: false,
    render: (value: any, row: any) => {
      const [openSkip, setOpenSkip] = useState(false);
      const [openRestart, setOpenRestart] = useState(false);
      const [openStop, setOpenStop] = useState(false);
      const [openCost, setOpenCost] = useState(false);

      const handleActionClick = (
        e: React.MouseEvent,
        action: () => void
      ) => {
        try {
          e.stopPropagation();
          action();
        } catch (error) {
          console.error("Error in handleActionClick:", error);
        }
      };

      const handleCostClose = (e?: React.MouseEvent) => {
        try {
          if (e) {
            e.stopPropagation();
          }
          setOpenCost(false);
        } catch (error) {
          console.error("Error in handleCostClose:", error);
        }
      };

      return (
        <div className="text-white" onClick={(e) => e.stopPropagation()}>
          {/* If the flow is already successful */}
          {row?.flow_status === "Success" && (
            <div className="flex flex-row items-center">
              <CheckCircle2 className="text-green-600 h-5 w-5" />
            </div>
          )}

          {/* If the flow failed */}
          {row?.flow_status === "Failed" && (
            <div className="flex flex-row gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="text-black p-1 rounded cursor-pointer"
                      onClick={(e) => handleActionClick(e, () => setOpenSkip(true))}
                    >
                      <SkipForward className="h-5 w-5 text-[#054c97] hover:text-[#054c9744]" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Skip Job</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="text-black p-1 rounded cursor-pointer"
                      onClick={(e) => handleActionClick(e, () => setOpenRestart(true))}
                    >
                      <RotateCw className="h-5 w-5 text-green-700 hover:text-green-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Restart Job</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* If the flow is in progress */}
          {row?.flow_status === "In Progress" && (
            <div className="flex flex-row gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="text-black p-1 rounded cursor-pointer"
                      onClick={(e) => handleActionClick(e, () => setOpenStop(true))}
                    >
                      <StopCircle className="h-5 w-5 text-red-600 hover:text-red-300" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop Job</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Popups */}
          <SkipPopUp open={openSkip} jobDetail={row} onClose={() => setOpenSkip(false)} />
          <RestartPopUp open={openRestart} jobDetail={row} onClose={() => setOpenRestart(false)} />
          <StopPopUp open={openStop} jobDetail={row} onClose={() => setOpenStop(false)} />
          <CostOptimizationForm open={openCost} jobDetail={row} onClose={handleCostClose} />
        </div>
      );
    },
  },
];

export const logData = [
  { date: "2023-11-03 14:35:20.000", label: "EST", description: "User login successful for user_id: 1024" },
  { date: "2023-11-03 14:37:12.000", label: "EST", description: "File upload initiated by user_id: 1024" },
  { date: "2023-11-03 14:38:45.000", label: "EST", description: "Data processing started for file_id: 456" },
  { date: "2023-11-03 14:40:23.000", label: "EST", description: "Error encountered: Missing values in column 3 for file_id: 456" },
  { date: "2023-11-03 14:45:19.000", label: "EST", description: "Starting scan to move intermediate done files" },
  { date: "2023-11-03 15:05:11.000", label: "EST", description: "System check completed successfully" },
  { date: "2023-11-03 15:15:40.000", label: "EST", description: "User logout detected for user_id: 1024" },
  { date: "2023-11-03 15:26:53.000", label: "EST", description: "Backup completed for database db_id: 789" },
  { date: "2023-11-03 15:28:30.000", label: "EST", description: "New user registration for user_id: 1050" },
  { date: "2023-11-03 15:40:15.000", label: "EST", description: "Data export initiated by user_id: 1033" },
  { date: "2023-11-03 16:00:05.000", label: "EST", description: "Scheduled maintenance started on server 2" },
  { date: "2023-11-03 16:02:29.000", label: "EST", description: "Scheduled maintenance completed on server 2" },
  { date: "2023-11-03 16:15:10.000", label: "EST", description: "Session timeout for user_id: 1018" },
  { date: "2023-11-03 16:20:08.000", label: "EST", description: "Connection reset for db_id: 792 during query execution" },
  { date: "2023-11-03 16:35:54.000", label: "EST", description: "Service restart triggered for email subsystem" },
];
