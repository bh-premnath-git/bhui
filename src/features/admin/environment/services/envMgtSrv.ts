import { Environment } from "@/types/admin/environment";
import { useAppDispatch } from "@/hooks/useRedux";
import { setEnvironments, setSelectedEnvironment } from "@/store/slices/admin/environmentsSlice";

export interface EnvironmentManagementService {
    setEnvironments(): Promise<Environment[]>;
    selectatedEnvironment(environment: Environment  | null): Promise<Environment | null>;
}

export const useEnvironmentManagementServive = () => {
    const dispatch = useAppDispatch();
    return ({
        setEnvironments: (environments: Environment[]) => {
            dispatch(setEnvironments(environments));
        },
        selectatedEnvironment: (environemnt: Environment | null) => {
            dispatch(setSelectedEnvironment(environemnt));
        }
    })
}