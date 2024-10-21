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
        key: 'bh_project_name',
        header: 'BH Project',
        sortable: true,
        filterable: true,
        type: 'text',


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
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <FileQuestion size={64} className="text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">PipeLine Not Available</h2>
            <button
                onClick={() => handleOpen()}
                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
                Add Pipeline
            </button>
            {open && (<BuildPipeLineCreatePopup handleClose={handleClose} open={open} />)}

        </div>
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
        navigate(`/BuildPlayGround/${rowData?.pipeline_id}`);
    }

    const changeStatus = async (rowData: any) => {

    }


    if (pipelineList.length === 0) {
        return <EmptyComponent />;
    }

    return (
        <div className="container mx-auto p-4">
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
            {open && (<BuildPipeLineCreatePopup handleClose={() => setOpen(false)} open={open} />)}

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