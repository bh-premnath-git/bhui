import { DataTable } from "@/components/bh-table/data-table";
import { useTaskDetails } from "../hooks/useTaskDetails";
import { columns } from "../config/taskColumns.config";
import { useState } from "react";

export function DataOpsHubSchema({ jobId }: { jobId?: string }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const offset = pageIndex * pageSize;

  const { taskDetails, total } = useTaskDetails({
    shouldFetch: true,
    jobId: jobId,
    limit: pageSize,
    offset: offset,
  });

  const pageCount = Math.ceil((total || 0) / pageSize);

  const handlePageChange = (page: number) => {
    setPageIndex(page - 1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  return (
    <div className="mt-6">
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={taskDetails}
          topVariant="simple"
          pagination={true}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}