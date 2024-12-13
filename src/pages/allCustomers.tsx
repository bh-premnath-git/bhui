import React, { useLayoutEffect } from "react";
import { FlexibleTable } from "@/components/Tabel";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { getCustomerList } from "@/redux/CustomerSlice";
import { COLORS } from "@/Utils/constants";
import { FolderPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

function CustomerTable({
    customerList,
    loading,
    error,
}: CustomerTableProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    useLayoutEffect(() => {
        dispatch(getCustomerList());
    }, [dispatch]);

    const viewFn = (rowData: any) => {
        navigate(`/admin-console/customers/${rowData.customer_id}`, { state: { rowData } });
    }

// Define column configurations outside the component for better performance
const columns: ColumnConfig[] = [
    {
        key: 'relation_ship_owner',
        header: 'Customer Name',
        sortable: true,
        filterable: true,
        type: 'text',
        render: (value, row) => (
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {(() => {
                        const parts = value?.split(/[-_]/);
                        const initials = parts?.length > 1
                        ? (parts[0][0] + parts[1][0]).toUpperCase()
                        : value?.slice(0, 2).toUpperCase();
                        return <span className="font-bold">{initials}</span>;
                    })()}
                </div>
                <span onClick={() => viewFn(row)} className="cursor-pointer">
                    {row?.relation_ship_owner}
                </span>
            </div>
        )
    },
    {
        key: 'status',
        header: 'Status',
        type: 'number',
        sortable: false,
        render: (value) => {
            return (
                <div
                    style={{
                        color: value === 'active' ? COLORS.green : COLORS.red
                    }}
                    className={`text-center rounded-md border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80
                        ${value === 'active' ? 'bg-green-500' : 'bg-red-500'} text-white p-1 w-12 capitalize`}>
                    {value}
                </div>
            )
        }
    },
    {
        key: 'total_extracts_config',
        header: 'Total Extracts Configured',
        type: 'number',
        sortable: false,
    },
];

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
                        Welcome to Customer Management!
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                        Stay organized and keep track of your customer relationships efficiently. Use the tools below to manage your customer base
                    </p>

                    {/* Action button with hover effect */}
                    <Button
                        size="lg"
                        onClick={() => navigate("/admin-console/customers/new")}
                        className="relative group bg-foreground hover:bg-foreground/90 text-background rounded-md px-6 py-3 font-medium"
                    >
                        <span className="absolute inset-0 transform transition-transform group-hover:scale-105 bg-gradient-to-r from-primary to-primary/90 rounded-md blur opacity-0 group-hover:opacity-30" />
                        <FolderPlus className="mr-2 h-5 w-5" />
                        <span className="relative">Create Customer</span>
                    </Button>
                </div>
            </div>
        </Card>
    );
};


    if (loading) {
        return <Spinner size="lg" />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const createNewFn = () => {
        navigate("/admin-console/customers/new");
    };
    const actionFn = (rowData: any, action: string) => {
        action == 'edit' ? editFn(rowData) : changeStatus(rowData)
    }

    const editFn = (rowData: any) => {
        navigate(`/admin-console/customers/${rowData.customer_id}`, { state: { rowData } });
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