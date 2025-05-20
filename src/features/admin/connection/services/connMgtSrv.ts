import { Connection } from "@/types/admin/connection";
import { useAppDispatch  } from "@/hooks/useRedux";
import { setconnection, setSelectedconnection } from "@/store/slices/admin/connectionSlice";

export interface ConnectionManagementService {
    setConnection(connection: Connection[]): void;
    selectatedConnection(connection: Connection | null): void;
}

export const useConnectionManagementService = (): ConnectionManagementService => {
    const dispatch = useAppDispatch();

    return {
        setConnection: ( connection: Connection[]) => {
            dispatch(setconnection(connection));
        },
        selectatedConnection: (connection: Connection | null) => {
            dispatch(setSelectedconnection(connection));
        }
    };
}