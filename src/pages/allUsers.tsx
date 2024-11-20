import React, { useEffect, useLayoutEffect } from "react";
import { FlexibleTable } from "@/components/Tabel";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { FileQuestion } from "lucide-react";
import { getCodesDtl, getUserDataList } from "@/redux/UserSlice";
import { Stack } from "@mui/material";
import { formatedDate } from "@/Utils/dateFormatter";
import { useDispatch } from "react-redux";
import {ApiService} from '@/services/apiServices';

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
    created_at: any;
    updated_at: any
}

interface UserDetailTableProps {
    columns: ColumnConfig[]
    userList: userData[];
    loading: boolean;
    error: { message: string } | null;
}

type ColumnConfig = {
    key: string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    type?: 'text' | 'number' | 'date' | 'badge';
    badgeConfig?: {
        colorMap: Record<string, string>;
    };
    render?: (value: any, row: userData) => React.ReactNode;
};


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
    columns,
    userList,
    loading,
    error,
}: UserDetailTableProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    useEffect(() => {
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
        action == 'edit' ? editFn(rowData) : changeStatus(rowData)
    }

    const editFn = (rowData: any) => {
        navigate(`/EditUser/${rowData.bh_user_id}`, { state: { rowData } });
    }

    const changeStatus = async (rowData: any) => {
        let data: any = { ...rowData }
        data.user_status_cd == 701 ? data.user_status_cd = 702 : data.user_status_cd = 701;
        let result = await ApiService('8011', 'put', `/bh_user/${data.bh_user_id}`, data);
        if (result) {
            dispatch(getUserDataList());
        }
    }

    if (userList?.length === 0) {
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
    const { codesDtl, userDataList, loading, error: apiError } = useAppSelector(
        (state: RootState) => state.userApi
    );
    const error = apiError ? { message: apiError } : null;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(getCodesDtl());
    }, [dispatch, codesDtl?.length == 0]);

    const viewFn = (rowData: any) => {
        navigate(`/EditUser/${rowData.bh_user_id}`, { state: { rowData } });
    };

    
    const columns: ColumnConfig[] = [
        {
            key: 'bh_user_first_name',
            header: 'Full Name',
            sortable: true,
            filterable: true,
            type: 'text',
            render: (value, row) => (
                <span onClick={() => viewFn(row)} className="cursor-pointer">
                    {row?.bh_user_first_name} {row?.bh_user_middle_name} {row?.bh_user_last_name}
                </span>
            )
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
            type: 'text',
            sortable: false,
            render: (value, row) => {
                return (
                    <>
                        {Array.isArray(row?.project_details) && row.project_details.map((item: any, index: number) => (
                            <div key={index} className="mb-4">
                                {Array.isArray(item.project) && item.project.map((project: any, projIndex: number) => (
                                    <div key={projIndex} className="mb-2">
                                        <b>Project {projIndex + 1}:</b> {project.label}
                                    </div>
                                ))}
        
                                {Array.isArray(item.projectRole) && item.projectRole.map((role: any, roleIndex: number) => (
                                    <Stack key={roleIndex} direction="row" alignItems="center" spacing={1}>
                                        <span className="font-bold p-1">Role:</span>
                                        <span className="p-1 rounded-sm mx-1" style={{
                                            backgroundColor: role.dtl_desc === 'Super Admin' ? '#feecc6' : '#d4f5e7'
                                        }}>
                                            {role.dtl_desc}
                                        </span>
                                    </Stack>
                                ))}
                            </div>
                        ))}
                    </>
                );
            }
        },
        {
            key: 'user_status_cd',
            header: 'Status',
            type: 'text',
            sortable: false,
            render: (value) => {
                const statusMap = {
                    701: 'Active',
                    702: 'Inactive'
                };
                const statusColor = statusMap[value] === 'Active'
                return (
                    <div 
                        className="text-center rounded-md border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80 bg-green-500 text-white p-1 w-12"
                        style={{ 
                            backgroundColor: statusMap[value] === 'Active' ? '#00D55B' : '#ffcdd2'
                        }}
                    >
                        {statusMap[value]}
                    </div>
                );
            }
        },     
        {
            key: 'created_at',
            header: 'Created On',
            type: 'number',
            sortable: false,
            render: (value: any) => formatedDate(value)
        },
        {
            key: 'updated_at',
            header: 'Last Active On',
            type: 'number',
            sortable: false,
            render: (value: any) => formatedDate(value)
        },


    ];

    return (
        <UserDetailTable
            userList={userDataList}
            columns={columns}
            loading={loading}
            error={error}
        />
    );
};

export default AllUsers;