import { useState, useMemo, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { TableFlexi } from "@/components/TableFlexi"
import { TableFlexiStatusCard } from "@/components/TableFlexiStatusCard"
import { Badge } from "@/components/ui/badge"
import { TableFiexiFilterDialog } from "@/components/TableFiexiFilterDialog"
import { TableData, FilterValues } from "@/types/dashboard"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { RootState } from "@/store/store"
import { getDataOps } from "@/redux/DataOpsSlice"
import TaskDetails from '@/components/TaskDetails/TaskDetails';
import { Package } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

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
    return <Spinner />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!data.length) {
    return <Card className="relative overflow-hidden w-full max-w-2xl mx-auto mt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-gradient/5 via-primary/2 to-background" />
      <div className="relative p-8 sm:p-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/0 blur-2xl" />
            <div className="relative bg-gradient-to-br from-background to-muted p-4 rounded-2xl border border-gradient/10">
              <Package className="w-12 h-12 text-gradient" />
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome to Your Job Monitor !
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Ready to monitor your job when flow is started.
          </p>
        </div>
      </div>
    </Card>;
  }

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedRowData, setSelectedRowData] = useState<any | null>(null)
  const filteredData = useMemo(() => {
    let filtered = data

    if (selectedStatuses.length > 0) {
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

  const handleRowClick = useCallback((item: any) => {
    if (item && item.job_id) {
      setSelectedJobId(item.job_id);
      setSelectedRowData(item);
    }
  }, [])

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
        playRow={true}
        playRowFn={handleRowClick}
        onFilterClick={() => setFilterDialogOpen(true)}
      />
      <TableFiexiFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApplyFilters={handleApplyFilters}
        filterOptions={filterOptions}
      />
      {selectedJobId && selectedRowData && (
        <TaskDetails
          jobId={selectedJobId}
          selectedRowData={selectedRowData}
          onClose={() => {
            setSelectedJobId(null)
            setSelectedRowData(null)
          }}
        />
      )}
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