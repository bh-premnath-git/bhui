import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { getUserDataList } from "@/redux/UserSlice";
import { formatedDate } from "@/Utils/dateFormatter";
import { UserPlus, Search, MoreHorizontal, Filter, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types
interface UserData {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    user_status_cd: number;
    user_admin_status_cd: number;
    realm_roles: string[];
    project_details: Array<any>[];
    created_at: any;
    updated_at: any;
}

const EmptyComponent: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Card className="relative overflow-hidden w-full max-w-2xl mx-auto mt-20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50" />
            <div className="relative p-8 sm:p-12">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Icon container with glow effect */}
                    <div className="relative inline-flex mb-8">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                        <div className="relative bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                            <Users2 className="w-12 h-12 text-blue-500" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight mb-4">
                        Welcome to User Management
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                        Start your journey by creating your first user and assigning projects.
                    </p>

                    <Button
                        size="lg"
                        onClick={() => navigate("/admin-console/users/new")}
                        className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-lg transition-all duration-200"
                    >
                        <UserPlus className="mr-2 h-5 w-5" />
                        Create First User
                    </Button>
                </div>
            </div>
        </Card>
    );
};

const AllUsers: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const itemsPerPage = 8;

    useEffect(() => {
        dispatch(getUserDataList({}));
    }, [dispatch]);

    const { userDataList, loadingUsers: loading, errorUsers: apiError } = useAppSelector(
        (state: RootState) => state.userApi
    );

    // Enhanced filtering
    const filteredUsers = userDataList?.filter(user => {
        const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !selectedStatus || user.enabled === (selectedStatus === 'active');
        return matchesSearch && matchesStatus;
    }) || [];

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Spinner className="h-8 w-8" />
        </div>
    );
    if (apiError) return <ErrorDisplay message={apiError} />;
    if (!userDataList?.length) return <EmptyComponent />;

    return (
        <div className="container mx-auto py-2 px-1 max-w-7xl">
            {/* Enhanced Header Section */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage user access and permissions
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/admin-console/users/new")}
                    className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-lg transition-all duration-200"
                    size="lg"
                >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Add New User
                </Button>
            </div>

            {/* Updated Search and Filter Section */}
            <div className="p-2 ml-auto flex items-center justify-end">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-lg">

                        <Input
                            placeholder="Search"
                            className="pl-1 h-10 bg-gray-50 border-gray-300 w-55 rounded-md text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 h-10">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={() => setSelectedStatus(null)}
                                className="cursor-pointer"
                            >
                                All Users
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setSelectedStatus('active')}
                                className="cursor-pointer"
                            >
                                Active Users
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setSelectedStatus('inactive')}
                                className="cursor-pointer"
                            >
                                Inactive Users
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Enhanced Table Section */}
            <Card className="overflow-hidden bg-white shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">User</TableHead>
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="font-semibold">Projects & Roles</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Created</TableHead>
                            <TableHead className="font-semibold">Last Active</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedUsers.map((user) => (
                            <TableRow
                                key={user.id}
                                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            {(() => {
                                                const parts = user.username?.split(/[-_]/);
                                                return parts?.length > 1
                                                    ? (parts[0][0] + parts[1][0]).toUpperCase()
                                                    : user.username?.slice(0, 2).toUpperCase();
                                            })()}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{user.username}</div>
                                            <div className="text-sm text-gray-500">
                                                {user.firstName} {user.lastName}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <div className="space-y-2">
                                        {user.projects?.map((project, idx) => (
                                            <div key={idx} className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {project}
                                                </Badge>
                                                {user.realm_roles?.map((role, roleIdx) => (
                                                    <Badge
                                                        key={roleIdx}
                                                        variant="outline"
                                                        className={cn(
                                                            "text-xs",
                                                            role === 'admin-user'
                                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        )}
                                                    >
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            user.enabled
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : "bg-red-50 text-red-700 border-red-200"
                                        )}
                                    >
                                        {user.enabled ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-500">
                                    {formatedDate(user.created_at)}
                                </TableCell>
                                <TableCell className="text-gray-500">
                                    {formatedDate(user.updated_at)}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => navigate(`/admin-console/users/${user.id}`,
                                                    { state: { rowData: user } }
                                                )}
                                            >
                                                Edit User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className={user.enabled ? "text-red-600" : "text-green-600"}
                                            >
                                                {user.enabled ? "Deactivate" : "Activate"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Enhanced Pagination */}
                <div className="flex items-center justify-between px-4 py-4 border-t">
                    <p className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
                        {filteredUsers.length} users
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AllUsers;