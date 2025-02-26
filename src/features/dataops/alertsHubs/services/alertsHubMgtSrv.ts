import { AlertHub } from "@/types/dataops/alertsHub"; 
import { useAppDispatch } from "@/hooks/useRedux";
import { setAlerts, setSelectedAlert } from "@/store/slices/dataops/alertHubSlice";

export interface AlertHubManagementService {
    setAlertHubs(alertHubs: AlertHub[]): void;
    selectAlertHub(alertHub: AlertHub | null): void;
}

export const useAlertHubManagementService = (): AlertHubManagementService => {
    const dispatch = useAppDispatch();
    return {
        setAlertHubs: (alertHubs: AlertHub[]) => {
            dispatch(setAlerts(alertHubs));
        },
        selectAlertHub: (alertHub: AlertHub | null) => {
            dispatch(setSelectedAlert(alertHub));
        }
    };
};
