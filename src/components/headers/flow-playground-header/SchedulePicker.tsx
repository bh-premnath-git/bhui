import { useRef, useState, useEffect } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from "@/store/";
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
    const [intervalState, setIntervalState] = useState(defaultState);
    const modalRef = useRef(null);

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

    return (
        <div className="relative">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="w-[180px] rounded-md border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-150">
                            <div className="flex items-center">
                                <Input
                                    value={cronExpression}
                                    readOnly
                                    disabled={loading}
                                    className="border-0 shadow-none h-8 font-mono text-xs bg-transparent focus-visible:ring-0 px-2 flex-grow"
                                    onClick={() => modalRef.current?.open()}
                                />
                                <div className="flex items-center gap-0.5 pr-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={loading}
                                        className="h-6 w-6 p-1 rounded-full hover:bg-slate-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClear();
                                        }}
                                    >
                                        <X className="h-3.5 w-3.5 text-slate-500" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={loading}
                                        className="h-6 w-6 p-1 rounded-full hover:bg-slate-100"
                                        onClick={() => modalRef.current?.open()}
                                    >
                                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="px-2 py-1">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <p className="text-xs">Configure Flow Schedule</p>
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