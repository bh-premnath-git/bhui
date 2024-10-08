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
import { getCustomerList } from "@/redux/CustomerSlice";

// Define types in a separate file for better organization
interface customer {
    customer_id: number;
    relation_ship_owner: string;
    relation_ship_owner_email: string;
    technology_owner: string;
    technology_owner_email: string;
    status_cd: number;
    created_at: any;
    updated_at: any
}

interface CustomerTableProps {
    customerList: customer[];
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
        key: 'relation_ship_owner',
        header: 'Customer Name',
        sortable: true,
        filterable: true,
        type: 'text',
        

    },
    {
        key: 'status_cd',
        header: 'Status',
        type: 'number',
        sortable: false,
    },
    {
        key: 'total_extracts_configured',
        header: 'Total Extracts Configured',
        type: 'number',
        sortable: false,
        render: (value: string | null) => value || '12',
    },
    

];

const EmptyComponent: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <FileQuestion size={64} className="text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">User Not Available</h2>
            <button
                onClick={() => navigate("/AddCustomers")}
                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
                Add Customers
            </button>
        </div>
    );
};

function CustomerTable({
    customerList,
    loading,
    error,
}: CustomerTableProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    useLayoutEffect(() => {
        console.log(customerList)
        dispatch(getCustomerList());
    }, [dispatch]);

    if (loading) {
        return <Spinner size="lg" />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const createNewFn = () => {
        navigate("/AddCustomers");
    };
    const actionFn = (rowData: any, action: string) => {
        action == 'edit' ? editFn(rowData) : changeStatus(rowData)
    }

    const editFn = (rowData: any) => {
        navigate("/AddCustomers", { state: { rowData } });
    }

    const changeStatus = async (rowData: any) => {
      
    }


    if (customerList.length === 0) {
        return <EmptyComponent />;
    }

    return (
        <div className="container mx-auto p-4">
            <FlexibleTable
                data={customerList}
                columns={columns}
                itemsPerPageOptions={[5, 10, 20]}
                defaultItemsPerPage={10}
                tableName="Add Customer"
                background="bg-black"
                createNewFn={createNewFn}
                actionFn={actionFn}
            />
        </div>
    );
}

const AllCustomers: React.FC = () => {
    const { customerList, loading, error: apiError } = useAppSelector(
        (state: RootState) => state.customerApi
    );

    const error = apiError ? { message: apiError } : null;

    return (
        <CustomerTable
            customerList={customerList}
            loading={loading}
            error={error}
        />
    );
};

export default AllCustomers;