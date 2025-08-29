import { User } from "@/types/admin/user";
import { useAppDispatch } from "@/hooks/useRedux";
import { setUsers, setSelectedUser } from "@/store/slices/admin/usersSlice";

export interface UserManagementService {
    getUsers(): Promise<User[]>;
    selectedUser(user: User | null): Promise<User | null>;
}

export const useUserManagementService = () => {
    const dispatch = useAppDispatch();
    return ({
        setUsers: (users: User[]) => {
            dispatch(setUsers(users));
        },
        selectedUser: (user: User | null) => {
            dispatch(setSelectedUser(user));
        }
    })
}