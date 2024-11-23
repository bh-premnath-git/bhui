import React, { useEffect, useLayoutEffect } from "react";
import { FlexibleTable } from "@/components/Tabel";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { getCodesDtl, getUserDataList } from "@/redux/UserSlice";
import { Stack } from "@mui/material";
import { formatedDate } from "@/Utils/dateFormatter";
import { useDispatch } from "react-redux";
import {ApiService} from '@/services/apiServices';
import { FolderPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
                <Sparkles className="w-12 h-12 text-gradient" />
                </div>
            </div>

            {/* Welcome text */}
            <h2 className="text-3xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome to User Management!
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Start your journey by assigning a project to a new user.
            </p>

            {/* Action button with hover effect */}
            <Button
                size="lg"
                onClick={() => navigate("/admin-console/users/new")}
                className="relative group bg-foreground hover:bg-foreground/90 text-background rounded-md px-6 py-3 font-medium"
            >
                <span className="absolute inset-0 transform transition-transform group-hover:scale-105 bg-gradient-to-r from-primary to-primary/90 rounded-md blur opacity-0 group-hover:opacity-30" />
                <FolderPlus className="mr-2 h-5 w-5" />
                <span className="relative">Create user</span>
            </Button>
            </div>
        </div>
        </Card>
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
        navigate("/admin-console/users/new");
    };
    const actionFn = (rowData: any, action: string) => {
        action == 'edit' ? editFn(rowData) : changeStatus(rowData)
    }

    const editFn = (rowData: any) => {
        navigate(`/admin-console/users/${rowData.bh_user_id}`, { state: { rowData } });
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
        navigate(`/admin-console/users/${rowData.bh_user_id}`, { state: { rowData } });
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