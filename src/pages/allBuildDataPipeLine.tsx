import React, { useLayoutEffect } from "react";
import { FlexibleTable } from "@/components/Tabel";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { FileQuestion } from "lucide-react";
import { getCustomerList } from "@/redux/CustomerSlice";
import { getAllPipeline } from "@/redux/BuildPipeLineSlice";
import { formatedDate } from "@/Utils/dateFormatter";
import { getGitProject } from "@/redux/ProjectSlice";
import BuildPipeLineCreatePopup from "@/components/BuildPipeLineComps/BuildPipeLineCreatePopup";
import useToast from "@/oldcomponents/teast-service";
import { FolderPlus, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Define types in a separate file for better organization
interface pipelineData {
    pipeline_id: number;
    pipeline_name: string;
    git_branch: string;
    bh_project_id: number;
    created_at: any;
    updated_at: any;
    updated_by: any;
}

interface BuildDataPipeLineTableProps {
    pipelineList: pipelineData[];
    loading: boolean;
    error: { message: string } | null;
}

// Define the ColumnConfig type based on what FlexibleTable expects
type ColumnConfig = {
    key: string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    type?: 'text' | 'number' | 'date' | 'badge';
    badgeConfig?: {
        colorMap: Record<string, string>;
    };
    render?: (value: any, row: any) => React.ReactNode;
};

// Define column configurations outside the component for better performance
const columns: ColumnConfig[] = [

    {
        key: 'pipeline_name',
        header: 'Pipeline Name',
        type: 'number',
        sortable: false,
        filterable: true,


    },
    {
        key: 'bh_project',
        header: 'BH Project',
        sortable: true,
        filterable: true,
        type: 'text',
        render: (value) => <div>{value?.bh_project_name}</div>
    },
    {
        key: 'git_branch',
        header: 'Git Branch',
        type: 'number',
        sortable: false,
        filterable: true,

    },
    {
        key: 'updated_by',
        header: 'Last Updated By',
        type: 'number',
        sortable: false,
        render: (value) => <div>{value?.user_name}</div>
    },
    {
        key: 'created_at',
        header: 'Last Updated On',
        type: 'number',
        sortable: false,
        render: (value) => formatedDate(value)
    }, {
        key: 'updated_at',
        header: 'Last Executed On',
        type: 'number',
        sortable: false,
        render: (value) => formatedDate(value)

    },


];

const EmptyComponent: React.FC = () => {
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
	const [ToastComponent, showToast] = useToast();

    return (
        <Card className="relative overflow-hidden w-full max-w-2xl mx-auto mt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-gradient/5 via-primary/2 to-background" />
            <div className="relative p-8 sm:p-12">
                <div className="max-w-2xl mx-auto text-center">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                
                {/* Icon container with glow effect */}
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

                {/* Action button with hover effect */}
                <Button
                    size="lg"
                    onClick={() => handleOpen()}
                    className="relative group bg-foreground hover:bg-foreground/90 text-background rounded-md px-6 py-3 font-medium"
                >
                    <span className="absolute inset-0 transform transition-transform group-hover:scale-105 bg-gradient-to-r from-primary to-primary/90 rounded-md blur opacity-0 group-hover:opacity-30" />
                    <FolderPlus className="mr-2 h-5 w-5" />
                    <span className="relative">Create New Pipeline</span>
                </Button>
                {open && (<BuildPipeLineCreatePopup handleClose={handleClose} open={open}  showToast={showToast}/>)}

                {/* Additional guidance */}
                <p className="mt-6 text-sm text-muted-foreground">
                    Click the button above to begin setting up your data pipeline
                </p>
            </div>
        </div>
    </Card>
    );
};

function BuildDataPipeLineTable({
    pipelineList,
    loading,
    error,
}: BuildDataPipeLineTableProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
	const [ToastComponent, showToast] = useToast();

    useLayoutEffect(() => {
        dispatch(getAllPipeline({ offset: 0, limit: 1000, order_desc: true, order_by: 'pipeline_id' }));
        dispatch(getGitProject());
    }, [dispatch]);

    if (loading) {
        return <Spinner size="lg" />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const createNewFn = () => {
        handleOpen();
    };
    const actionFn = (rowData: any, action: string) => {
        action == 'edit' ? editFn(rowData) : changeStatus(rowData)
    }

    const editFn = (rowData: any) => {
        navigate(`/designers/build-playground/${rowData?.pipeline_id}`);
    }

    const changeStatus = async (rowData: any) => {

    }


    if (pipelineList.length === 0) {
        return <EmptyComponent />;
    }

    return (
        <div className="container mx-auto p-4">
                <ToastComponent />

            <FlexibleTable
                data={pipelineList}
                columns={columns}
                itemsPerPageOptions={[5, 10, 20]}
                defaultItemsPerPage={10}
                tableName="Add Pipeline"
                background="bg-black"
                createNewFn={createNewFn}
                actionFn={actionFn}
            />
            {open && (<BuildPipeLineCreatePopup handleClose={() => setOpen(false)} open={open} showToast={showToast} />)}

        </div>
    );
}

const AllBuildDataPipeLine: React.FC = () => {
    const { pipelineList, loading, error: apiError } = useAppSelector(
        (state: RootState) => state.buildPipeLineApi
    );
    console.log(pipelineList)
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