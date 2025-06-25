import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from "@/store/";
import { fetchEnvironments, setSelectedEnv } from '@/store/slices/designer/flowSlice';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

export const EnvironmentSelect = () => {
    const dispatch = useAppDispatch();
    const { environments, selectedEnvironment, selectedFlow, loading } = useAppSelector((state: RootState) => state.flow);
    useEffect(() => {
        dispatch(fetchEnvironments({offset:0,limit:10}));
    }, [dispatch]);

    useEffect(() => {
        if (environments?.length > 0 && !loading) {
            // If there's a selected flow, use its environment
            if (selectedFlow?.flow_deployment?.[0]?.bh_env_id) {
                dispatch(setSelectedEnv(selectedFlow.flow_deployment[0].bh_env_id));
            }
            // Otherwise, if no environment is selected, use the first one
            else if (!selectedEnvironment) {
                dispatch(setSelectedEnv(environments[0].bh_env_id));
            }
        }
    }, [environments, selectedFlow, selectedEnvironment, loading, dispatch]);

    const handleEnvironmentChange = (value: string) => {
        dispatch(setSelectedEnv(Number(value)));
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="relative">
                        <Select
                            value={selectedEnvironment?.bh_env_id?.toString()}
                            onValueChange={handleEnvironmentChange}
                            disabled={loading}
                        >
                            <SelectTrigger className="w-[180px] h-9">
                                <SelectValue placeholder="Select environment" />
                                {loading && (
                                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                )}
                            </SelectTrigger>
                            <SelectContent>
                                {environments?.map((env:any) => (
                                    <SelectItem
                                        key={env.bh_env_id}
                                        value={env.bh_env_id.toString()}
                                    >
                                        {env.bh_env_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Select Environment</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};