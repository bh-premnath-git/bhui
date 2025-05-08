import { DataTable } from "@/components/bh-table/data-table";
import { useTaskDetails } from "../hooks/useTaskDetails";
import { columns } from "../config/taskColumns.config";

export function DataOpsHubSchema({ jobId }: { jobId?: string }) {
  const { taskDetails, isLoading } = useTaskDetails({
    shouldFetch: true,
    jobId: jobId,
  });

  return (
    <div className="mt-6">
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={taskDetails}
          topVariant="simple"
          pagination={true}
        />
      </div>
    </div>
  );
}