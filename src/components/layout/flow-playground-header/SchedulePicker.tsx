import { useRef, useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from "@/store/";
import { patchCronDeployment } from '@/store/slices/designer/flowSlice';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface IntervalState {
    selectedInterval: string;
    repeatEvery: string;
    repeatAt: string;
    selectedDays: string[];
    selectedMonth: string;
    selectedDate: string;
}

const defaultState: IntervalState = {
    selectedInterval: "daily",
    repeatEvery: "1",
    repeatAt: "00:00",
    selectedDays: [],
    selectedMonth: "January",
    selectedDate: "1"
};

export const SchedulePicker = () => {
    const dispatch = useAppDispatch();
    const { selectedFlow, loading } = useAppSelector((state: RootState) => state.flow);
    const [cronExpression, setCronExpression] = useState<string>("* * * * *");

    useEffect(() => {
        if (selectedFlow?.flow_deployment?.[0]?.cron_expression) {
            setCronExpression(selectedFlow.flow_deployment[0].cron_expression);
        }
    }, [selectedFlow?.flow_deployment]);

    const handleClear = async () => {
        if (selectedFlow?.flow_deployment?.[0]?.flow_deployment_id) {
            try {
                await dispatch(patchCronDeployment({
                    flow_deployment_id: selectedFlow.flow_deployment[0].flow_deployment_id,
                    cron_expression: { cron_expression: "* * * * *" }
                }));
                setCronExpression("* * * * *");
            } catch (error) {
                console.error('Failed to clear cron schedule:', error);
            }
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="relative w-[180px]">
                        <Input
                            value={cronExpression}
                            readOnly
                            disabled={loading}
                            className="pr-20 cursor-pointer h-9 font-mono text-sm"
                            onClick={() => {/* TODO: Open interval modal */}}
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={loading}
                                className="hover:bg-gray-100 rounded-full h-7 w-7 p-1.5"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClear();
                                }}
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={loading}
                                className="hover:bg-gray-100 rounded-full h-7 w-7 p-1.5"
                                onClick={() => {/* TODO: Open interval modal */}}
                            >
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Schedule Flow</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};