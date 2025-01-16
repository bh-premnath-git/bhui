import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FlexibleTable } from "@/components/Table";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { getAllPipeline, deletePipelineById } from "@/redux/BuildPipeLineSlice";
import { formatedDate } from "@/Utils/dateFormatter";
import { getGitProject } from "@/redux/ProjectSlice";
import BuildPipeLineCreatePopup from "@/components/BuildPipeLineComps/BuildPipeLineCreatePopup";
import useToast from "@/components/teast-service";
import { FolderPlus, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteDialog } from "@/components/DeleteDialog";
import { COLORS } from "@/Utils/constants";

interface PipelineData {
    pipeline_id: number;
    pipeline_name: string;
    git_branch: string;
    bh_project_id: number;
    bh_project_name?: string; 
    created_at: string;
    updated_at: string;
    updated_by: string;
}

interface BuildDataPipeLineTableProps {
    pipelineList: PipelineData[];
    loading: boolean;
    error: { message: string } | null;
}

type ColumnConfig = {
    key: keyof PipelineData;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    type?: 'text' | 'number' | 'date' | 'badge';
    badgeConfig?: {
        colorMap: Record<string, string>;
    };
    render?: (value: any, row: PipelineData) => React.ReactNode;
};

const columns: ColumnConfig[] = [
    {
        key: 'pipeline_name',
        header: 'Pipeline Name',
        type: 'text', 
        sortable: false,
        filterable: true,
        render: (value: string) => (
            <div className="flex items-center gap-3">
                <span>{value}</span>
            </div>
        )
    },
    {
        key: 'bh_project_name',
        header: 'BH Project',
        sortable: true,
        filterable: true,
        type: 'text',
        render: (value: string) => <div>{value}</div>
    },
    {
        key: 'updated_by',
        header: 'Last Updated By',
        type: 'text', 
        sortable: false,
        render: (value: string) => <div>{value}</div>
    },
    {
        key: 'updated_at',
        header: 'Last Executed On',
        type: 'date',
        sortable: true, 
        filterable: true,
        render: (value: string | null) => formatedDate(value) || 'Never',
    },
];

const EmptyComponent: React.FC<{ onAddPipeline: () => void }> = React.memo(({ onAddPipeline }) => {
    return (
        <Card className="relative overflow-hidden w-full max-w-2xl mx-auto mt-20">
            <div className="absolute inset-0 bg-gradient-to-br from-gradient/5 via-primary/2 to-background" />
            <div className="relative p-8 sm:p-12">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                    <div className="relative inline-flex mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/0 blur-2xl" />
                        <div className="relative bg-gradient-to-br from-background to-muted p-4 rounded-2xl border border-gradient/10">
                            <Workflow className="w-12 h-12 text-gradient" />
                        </div>
                    </div>

                    {/* Welcome text */}
                    <h2 className="text-3xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Welcome to Your Data Pipeline Creation!
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                        Ready to transform your data into actionable insights? Kickstart your new data pipeline.
                    </p>
                    <Button
                        size="lg"
                        onClick={onAddPipeline}
                        className="relative group bg-foreground hover:bg-foreground/90 text-background rounded-md px-6 py-3 font-medium"
                    >
                        <span className="absolute inset-0 transform transition-transform group-hover:scale-105 bg-gradient-to-r from-primary to-primary/90 rounded-md blur opacity-0 group-hover:opacity-30" />
                        <FolderPlus className="mr-2 h-5 w-5" />
                        <span className="relative">Create New Pipeline</span>
                    </Button>
                </div>
            </div>
        </Card>
    );
});

const BuildDataPipeLineTable: React.FC<BuildDataPipeLineTableProps> = ({
    pipelineList,
    loading,
    error,
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
    const [ToastComponent, showToast] = useToast();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePipelineName, setDeletePipelineName] = useState<string>("");
    const [deletePipelineId, setDeletePipelineId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(getAllPipeline({ offset: 0, limit: 1000, order_desc: true, order_by: 'pipeline_id' }));
        dispatch(getGitProject());
    }, [dispatch]);

    const handleOpenCreatePopup = useCallback(() => {
        setIsCreatePopupOpen(true);
    }, []);

    const handleCloseCreatePopup = useCallback(() => {
        setIsCreatePopupOpen(false);
    }, []);

    const handleDeleteDialogOpen = useCallback((pipeline: PipelineData) => {
        setDeletePipelineName(pipeline.pipeline_name);
        setDeletePipelineId(pipeline.pipeline_id);
        setDeleteDialogOpen(true);
    }, []);

    const handleDeleteDialogClose = useCallback(() => {
        setDeleteDialogOpen(false);
        setDeletePipelineName("");
        setDeletePipelineId(null);
    }, []);

    const handleDeletePipeline = useCallback(async () => {
        if (!deletePipelineId) return;
        try {
            const result = await dispatch(deletePipelineById({ pipeline_id: deletePipelineId }));
            if (deletePipelineById.fulfilled.match(result)) {
                showToast("Pipeline deleted successfully!", { color: COLORS.green });
                dispatch(getAllPipeline({ offset: 0, limit: 1000, order_desc: true, order_by: 'pipeline_id' }));
            } else {
                showToast("Failed to delete pipeline.", { color: COLORS.red });
            }
            handleDeleteDialogClose();
        } catch (error) {
            console.error("Error deleting pipeline:", error);
            showToast("An unexpected error occurred.", { color: COLORS.red });
        }
    }, [dispatch, deletePipelineId, showToast, handleDeleteDialogClose]);

    const actionFn = useCallback((rowData: PipelineData, action: string) => {
        if (action === "delete") {
            handleDeleteDialogOpen(rowData);
        }
    }, [handleDeleteDialogOpen]);

    const editFn = useCallback((rowData: PipelineData) => {
        navigate(`/designers/build-playground/${rowData.pipeline_id}`);
    }, [navigate]);

    const memoizedColumns = useMemo(() => columns, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container p-4">
                <ErrorDisplay message={error.message} />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <ToastComponent />
            {pipelineList.length === 0 ? (
                <EmptyComponent onAddPipeline={handleOpenCreatePopup} />
            ) : (
                <FlexibleTable
                    data={pipelineList}
                    columns={memoizedColumns}
                    itemsPerPageOptions={[5, 10, 20]}
                    defaultItemsPerPage={10}
                    tableName="Add Pipeline"
                    createNewFn={handleOpenCreatePopup}
                    actionFn={actionFn}
                    playRow={true}
                    playRowFn={editFn}
                    rowColorFn={(row, index) => (index % 2 === 0 ? "bg-white" : "bg-gray-100")}
                />
            )}
            {isCreatePopupOpen && (
                <BuildPipeLineCreatePopup
                    handleClose={handleCloseCreatePopup}
                    open={isCreatePopupOpen}
                    showToast={showToast}
                />
            )}
            <DeleteDialog
                title="Delete Data Pipeline"
                placeholder="Enter Pipeline name"
                isOpen={deleteDialogOpen}
                onClose={handleDeleteDialogClose}
                pipelineName={deletePipelineName}
                onDelete={handleDeletePipeline}
            />
        </div>
    );
}

const AllBuildDataPipeLine: React.FC = () => {
    const { pipelineList, loading, error: apiError } = useAppSelector(
        (state: RootState) => state.buildPipeLineApi
    );
    const error = apiError ? { message: apiError } : null;

    return (
        <BuildDataPipeLineTable
            pipelineList={pipelineList}
            loading={loading}
            error={error}
        />
    );
};

export default AllBuildDataPipeLine;
