import { useCallback, useState } from "react";
import { DataTable } from "@/components/bh-table/data-table";
import { LLM } from "@/types/admin/llm";
import { Row } from "@tanstack/react-table";
import { useNavigation } from "@/hooks/useNavigation";
import { ROUTES } from "@/config/routes";
import { useLlms } from "./hooks/useLlms";
import { useLlmManagementService } from "./services/llmMgtSrv";
import { DeleteLlmDialog } from "./components/DeleteLlmDialog";
import { createColumns, getToolbarConfig } from "./config/columns.config";

interface LLMListProps {
  llms: LLM[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export function LlmsList({
  llms,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hasNextPage,
  hasPreviousPage
}: LLMListProps) {
  const { handleNavigation } = useNavigation();
  const llmMgtSrv = useLlmManagementService();
  const { refetch: refetchLlms } = useLlms();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onRowClickHandler = useCallback(
    (row: Row<LLM>) => {
      llmMgtSrv.setSelectedLlm(row.original);
      handleNavigation(ROUTES.ADMIN.LLM.EDIT(row.original.id.toString()));
    },
    [llmMgtSrv, handleNavigation]);

  const handleDeleteClick = useCallback(
    (llm: LLM) => {
      llmMgtSrv.setSelectedLlm(llm);
      setDeleteDialogOpen(true);
    },
    [llmMgtSrv]
  );

  const columns = createColumns({ onDelete: handleDeleteClick });

  return (
    <>
      <DataTable<LLM>
        columns={columns}
        data={llms || []}
        topVariant="simple"
        onRowClick={onRowClickHandler}
        toolbarConfig={getToolbarConfig()}
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />

      <DeleteLlmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={refetchLlms}
      />
    </>
  );
}
