import React, { useLayoutEffect } from "react";
import { FlexibleTable } from "@/components/Tabel";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { getGitProject } from '@/redux/ProjectSlice';
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { FileQuestion } from "lucide-react";
import { getUserDataList } from "@/redux/UserSlice";
import { Stack } from "@mui/material";
import { formatDate, formatedDate } from "@/Utils/dateFormatter";

// Define types in a separate file for better organization
interface userData {
    bh_user_id: number;
    bh_user_first_name: string;
    bh_user_middle_name: string;
    bh_user_last_name: string;
    user_email_id: string;
    user_status_cd: number;
    user_admin_status_cd: number;
    project_details: Array<any>[];
    created_at:any;
    updated_at:any
}

interface UserDetailTableProps {
    userList: userData[];
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
        key: 'bh_user_first_name',
        header: 'Full Name',
        sortable: true,
        filterable: true,
        type: 'text',
        render: (value, row) => {
            return (
                <>
                    {row?.bh_user_first_name}  {row?.bh_user_middle_name}  {row?.bh_user_last_name}
                </>
            )
        }

    },
    {
        key: 'user_email_id',
        header: 'Email ID',
        type: 'number',
        sortable: false,
    },
    {
        key: 'project_details',
        header: 'Project Details',
        type: 'number',
        sortable: false,
        render: (value, row) => {
            return (
                <>
                    {row?.project_details?.map((item: any, index: number) => (
                        <div key={index}>
                            <Stack direction={'row'}>
                                <span >
                                    <b>project{index + 1}  </b></span>:   <span className="mx-2">
                                    {item.project?.label}
                                </span>
                            </Stack>
                            <Stack direction={'row'}>
                                <span className="font-bold p-1">
                                Role :
                                </span>
                                {item.projectRole?.map((role: any, j: number) => (
                                    <Stack key={j} direction={'row'}>
                                        <Stack className="p-1 rounded-sm" direction={'row'} sx={{backgroundColor:`${role?.dtl_desc=='Admin'||role?.dtl_desc=='Super Admin'?'#feecc6':'#d4f5e7'}`}}>
                                                {role?.dtl_desc}
                                        </Stack>
                                    </Stack>
                                ))}

                            </Stack>
                        </div>

                    ))}
                </>
            )
        }

    },
    {
        key: 'user_status_cd',
        header: 'Status',
        type: 'number',
        sortable: false,
    },
    {
        key: 'created_at',
        header: 'Created On',
        type: 'number',
        sortable: false,
        render:(value:any)=>formatedDate(value)
    },
    {
        key: 'updated_at',
        header: 'Last Active On',
        type: 'number',
        sortable: false,
        render:(value:any)=>formatedDate(value)
    },
    

];

const EmptyComponent: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <FileQuestion size={64} className="text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">User Not Available</h2>
            <button
                onClick={() => navigate("/AddUser")}
                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
                Add User
            </button>
        </div>
    );
};

function UserDetailTable({
    userList,
    loading,
    error,
}: UserDetailTableProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    useLayoutEffect(() => {
        dispatch(getUserDataList());
    }, [dispatch]);

    if (loading) {
        return <Spinner size="lg" />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const createNewFn = () => {
        navigate("/AddUser");
    };
    const actionFn = (rowData: any, action: string) => {
        // console.log("Action:", action, "Row Data:", rowData);    
    }

    if (userList.length === 0) {
        return <EmptyComponent />;
    }

    return (
        <div className="container mx-auto p-4">
            <FlexibleTable
                data={userList}
                columns={columns}
                itemsPerPageOptions={[5, 10, 20]}
                defaultItemsPerPage={10}
                tableName="Add User"
                background="bg-black"
                createNewFn={createNewFn}
                actionFn={actionFn}
            />
        </div>
    );
}

const AllUsers: React.FC = () => {
    const { userDataList, loading, error: apiError } = useAppSelector(
        (state: RootState) => state.userApi
    );

    const error = apiError ? { message: apiError } : null;

    return (
        <UserDetailTable
            userList={userDataList}
            loading={loading}
            error={error}
        />
    );
};

export default AllUsers;