import { DataOpsHub } from "@/types/dataops/dataOpsHub";
import { useAppDispatch } from "@/hooks/useRedux";
import { setDataOpsHubs, setSelectedDataOpsHub } from "@/store/slices/dataops/dataOpsHubSlice";

export interface DataOpsHubManagementService {
    setDataOpsHubs(dataOpsHubs: DataOpsHub[]): void;
    selectDataOpsHub(dataOpsHub: DataOpsHub | null): void;
}

export const useDataOpsHubManagementService = (): DataOpsHubManagementService => {
    const dispatch = useAppDispatch();
    return {
        setDataOpsHubs: (dataOpsHubs: DataOpsHub[]) => {
            dispatch(setDataOpsHubs(dataOpsHubs));
        },
        selectDataOpsHub: (dataOpsHub: DataOpsHub | null) => {
            dispatch(setSelectedDataOpsHub(dataOpsHub));
        }
    };
};
