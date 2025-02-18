import { User } from "@/types/admin/user";
import { useAppDispatch } from "@/hooks/uaeRedux";
import { setUsers, setSelectedUser } from "@/store/slices/admin/usersSlice";

export interface UserManagementService {
    getUsers(): Promise<User[]>;
    selectatedUser(user: User | null): Promise<User | null>;
}

export const useUserManagementServive = () => {
    const dispatch = useAppDispatch();
    return ({
        setUsers: (users: User[]) => {
            dispatch(setUsers(users));
        },
        selectatedUser: (user: User | null) => {
            dispatch(setSelectedUser(user));
        }
    })
}