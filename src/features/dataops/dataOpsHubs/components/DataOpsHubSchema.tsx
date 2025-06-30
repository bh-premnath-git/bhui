import { DataTable } from "@/components/bh-table/data-table";
import { useTaskDetails } from "../hooks/useTaskDetails";
import { columns } from "../config/taskColumns.config";
import { useState } from "react";
import { LazyLoading } from "@/components/shared/LazyLoading";

export function DataOpsHubSchema({ jobId }: { jobId?: string }) {
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const { taskDetails, isFetching, total, next, prev } = useTaskDetails({
    shouldFetch: true,
    jobId: jobId,
    limit: pageSize,
    offset: offset,
  });

  const pageIndex = Math.floor(offset / pageSize);
  const pageCount = Math.ceil((total || 0) / pageSize);

  const handlePageChange = (page: number) => {
    const currentPageIndex = pageIndex;
    if (page > currentPageIndex && next) {
      setOffset(o => o + pageSize);
    } else if (page < currentPageIndex && prev) {
      setOffset(o => Math.max(0, o - pageSize));
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setOffset(0);
  };

  return (
    <div className="mt-6">
      <div className="mt-4 relative">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <LazyLoading fullScreen={false} className="w-40 h-40" />
          </div>
        )}
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