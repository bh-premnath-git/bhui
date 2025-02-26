import { Flow } from '@/types/designer/flow';
import { useAppDispatch } from '@/hooks/useRedux';
import { setFlows, setSelectedFlow } from '@/store/slices/designer/flowSlice';

export interface FlowManagementService {
    getFlows(): Promise<Flow[]>;
    selectedFlow(flow: Flow | null): Promise<Flow | null>;
}

export const useFlowManagementService = () => {
    const dispatch = useAppDispatch();
    return ({
        setFlows: (flows: Flow[]) => {
            dispatch(setFlows(flows));
        },
        selectedFlow: (flow: Flow | null) => {
            dispatch(setSelectedFlow(flow));
        }
    })
}
