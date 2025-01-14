import { useState, useMemo, useCallback, useEffect } from "react"
import { TableFlexi } from "@/components/TableFlexi"
import { TableFlexiStatusCard } from "@/components/TableFlexiStatusCard"
import { Badge } from "@/components/ui/badge"
import { TableFiexiFilterDialog } from "@/components/TableFiexiFilterDialog"
import { TableData, FilterValues } from "@/types/dashboard"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { RootState } from "@/store/store"
import { getDataOps } from "@/redux/DataOpsSlice"

interface DemoPageProps {
  data: TableData[];
  loading: boolean;
  error: string | null;
}

const columns = [
  {
    accessorKey: "flow",
    header: "Flow",
  },
  {
    accessorKey: "project",
    header: "Project",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.getValue("status") as string).toLowerCase()
      return (
        <Badge
          className={
            status === "success"
              ? "bg-[rgb(132,204,162)] hover:bg-[rgb(132,204,162)]"
              : status === "failed"
                ? "bg-[rgb(255,178,178)] hover:bg-[rgb(255,178,178)]"
                : "bg-[rgb(255,207,169)] hover:bg-[rgb(255,207,169)]"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => {
      return new Date(row.getValue("startTime")).toLocaleString()
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "owner",
    header: "Owner",
  },
]

function DataOPsTable({ data, loading, error }: DemoPageProps) {
  if (loading) {
    return <div className="flex justify-center items-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!data.length) {
    return <div>No Data Available.</div>;
  }

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues | null>(null)
  const filteredData = useMemo(() => {
    let filtered = data

    if (selectedStatuses.length > 0) {
      console.log("selectedStatuses", selectedStatuses);
      
      filtered = filtered.filter(item => selectedStatuses.includes(item.status.toLowerCase()))
    }

    if (appliedFilters) {
      filtered = filtered.filter(item => {
        for (const [key, value] of Object.entries(appliedFilters)) {
          if (value && key !== 'startDate' && key !== 'endDate') {
            if (item[key as keyof TableData]?.toLowerCase() !== value.toLowerCase()) return false
          }
        }

        if (appliedFilters.startDate || appliedFilters.endDate) {
          const itemDate = new Date(item.startTime)
          if (appliedFilters.startDate && itemDate < appliedFilters.startDate) return false
          if (appliedFilters.endDate && itemDate > appliedFilters.endDate) return false
        }

        return true
      })
    }

    return filtered
  }, [data, selectedStatuses, appliedFilters])

  const stats = useMemo(() => ({
    success: data.filter(item => item.status.toLowerCase() === "success").length,
    failed: data.filter(item => item.status.toLowerCase() === "failed").length,
    inProgress: data.filter(item => item.status.toLowerCase() === "in progress").length,
  }), [data])

  const handleStatusSelect = useCallback((status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }, [])

  const handleApplyFilters = useCallback((filters: FilterValues) => {
    setAppliedFilters(filters)
    setFilterDialogOpen(false)
  }, [])

  const filterOptions = useMemo(() => ({
    projectOptions: Array.from(new Set(data.map(item => item.project))).map(project => ({ value: project, label: project })),
    flowOptions: Array.from(new Set(data.map(item => item.flow))).map(flow => ({ value: flow, label: flow })),
    statusOptions: [
      { value: "success", label: "Success" },
      { value: "failed", label: "Failed" },
      { value: "in progress", label: "In Progress" },
    ],
  }), [data])

  return (
    <div className="container mx-auto py-10 space-y-8 px-4">
      <TableFlexiStatusCard
        data={stats}
        selectedStatuses={selectedStatuses}
        onStatusSelect={handleStatusSelect}
      />
      <TableFlexi
        columns={columns}
        data={filteredData}
        onFilterClick={() => setFilterDialogOpen(true)}
      />
      <TableFiexiFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApplyFilters={handleApplyFilters}
        filterOptions={filterOptions}
      />
    </div>
  )
}

export default function AllDataOps() {
  const dispatch = useAppDispatch();

  const { getDataOpsList, loading, error } = useAppSelector(
    (state: RootState) => state.dataopsApi
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const tenDaysAgo = new Date(now);
        tenDaysAgo.setDate(now.getDate() - 10);

        const tenDaysAgoISOString = tenDaysAgo.toISOString();
        const params = { job_start_time: tenDaysAgoISOString };
        dispatch(getDataOps(params));
      } catch (error) {
        console.error("Error fetching DataOps data:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <DataOPsTable data={getDataOpsList} loading={loading} error={error} />
  )
} 