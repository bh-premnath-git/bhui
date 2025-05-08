import { useRef, useState, useEffect } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { patchCronDeployment } from '@/store/slices/designer/flowSlice';
import { IntervalModal, IntervalModalRef, IntervalState } from '@/components/shared/IntervalModal';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

const defaultState = {
    selectedInterval: "daily",
    repeatEvery: "1",
    repeatAt: "00:00",
    selectedDays: [],
    selectedMonth: "January",
    selectedDate: "1"
};

// Function to convert interval state to cron expression
const convertToCron = (state) => {
    const [hours, minutes] = state.repeatAt.split(':');
    
    switch (state.selectedInterval.toLowerCase()) {
        case "minutes": return `*/${state.repeatEvery} * * * *`;
        case "hourly": return `${minutes} */${state.repeatEvery} * * *`;
        case "daily": return `${minutes} ${hours} * * *`;
        case "weekly":
            if (state.selectedDays.length === 0) return "* * * * *";
            const days = state.selectedDays.map(day => {
                const dayMap = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
                return dayMap[day];
            }).join(',');
            return `${minutes} ${hours} * * ${days}`;
        case "monthly": return `${minutes} ${hours} ${state.selectedDate} * *`;
        case "yearly":
            const monthIndex = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"].indexOf(state.selectedMonth) + 1;
            return `${minutes} ${hours} ${state.selectedDate} ${monthIndex} *`;
        default: return "* * * * *";
    }
};

export const SchedulePicker = () => {
    const dispatch = useAppDispatch();
    const { selectedFlow, loading } = useAppSelector((state) => state.flow);
    const [cronExpression, setCronExpression] = useState("* * * * *");
    const [intervalState, setIntervalState] = useState<IntervalState>(defaultState);
    const modalRef = useRef<IntervalModalRef>(null);
    const [scheduleActive, setScheduleActive] = useState(false);

    useEffect(() => {
        if (selectedFlow?.flow_deployment?.[0]?.cron_expression) {
            const cronExp = selectedFlow.flow_deployment[0].cron_expression;
            setCronExpression(typeof cronExp === 'string' ? cronExp : 
                (typeof cronExp === 'object' && cronExp.cron ? cronExp.cron : "* * * * *"));
        }
    }, [selectedFlow?.flow_deployment]);

    const handleClear = async () => {
        if (selectedFlow?.flow_deployment?.[0]?.flow_deployment_id) {
            try {
                const defaultCronExpression = convertToCron(defaultState);
                await dispatch(patchCronDeployment({
                    flow_deployment_id: selectedFlow.flow_deployment[0].flow_deployment_id,
                    cron_expression: { cron_expression:{cron: defaultCronExpression} }
                }));
                setCronExpression(defaultCronExpression);
                setIntervalState(defaultState);
            } catch (error) {
                console.error('Failed to clear cron schedule:', error);
            }
        }
    };

    const handleSaveInterval = async (intervalJson) => {
        try {
            const newState = JSON.parse(intervalJson);
            setIntervalState(newState);
            
            const newCronExpression = convertToCron(newState);
            setCronExpression(newCronExpression);
            
            if (selectedFlow?.flow_deployment?.[0]?.flow_deployment_id) {
                await dispatch(patchCronDeployment({
                    flow_deployment_id: selectedFlow.flow_deployment[0].flow_deployment_id,
                    cron_expression: { cron_expression: { cron: newCronExpression } }
                }));
            }
        } catch (error) {
            console.error('Failed to save interval:', error);
        }
    };

    const getScheduleDescription = () => {
        const interval = intervalState.selectedInterval.toLowerCase();
        switch (interval) {
            case "minutes":
                return `Every ${intervalState.repeatEvery} minute(s)`;
            case "hourly":
                return `Every ${intervalState.repeatEvery} hour(s) at ${intervalState.repeatAt.split(':')[1]} minutes`;
            case "daily":
                return `Daily at ${intervalState.repeatAt}`;
            case "weekly":
                return `Weekly on ${intervalState.selectedDays.join(', ')} at ${intervalState.repeatAt}`;
            case "monthly":
                return `Monthly on day ${intervalState.selectedDate} at ${intervalState.repeatAt}`;
            case "yearly":
                return `Yearly on ${intervalState.selectedMonth} ${intervalState.selectedDate} at ${intervalState.repeatAt}`;
            default:
                return "Not scheduled";
        }
    };

    useEffect(() => {
        setScheduleActive(cronExpression !== "* * * * *");
    }, [cronExpression]);

    return (
        <div className="relative">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={loading}
                                className={cn("h-8 w-8 rounded-md border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-150",
                                    scheduleActive ? "bg-slate-50" : "")}
                                onClick={() => modalRef.current?.open()}
                            >
                                <Calendar className={cn("h-4 w-4", scheduleActive ? "text-blue-500" : "text-slate-500")} />
                            </Button>
                            {scheduleActive && (
                                <div className="absolute -top-1 -right-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={loading}
                                        className="h-4 w-4 p-0 rounded-full bg-slate-100 hover:bg-slate-200"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClear();
                                        }}
                                    >
                                        <X className="h-2.5 w-2.5 text-slate-500" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="px-2 py-1 max-w-xs">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <p className="text-xs font-medium">Flow Schedule</p>
                            </div>
                            {scheduleActive && (
                                <div className="text-xs font-mono bg-slate-50 p-1 rounded mt-1">
                                    {cronExpression}
                                </div>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            
            <IntervalModal
                ref={modalRef}
                initialState={intervalState}
                onStateChange={setIntervalState}
                onSave={handleSaveInterval}
            />
        </div>
    );
};