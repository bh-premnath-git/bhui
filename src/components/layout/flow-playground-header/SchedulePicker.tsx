import { useRef, useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
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

const defaultState: IntervalState = {
    selectedInterval: "daily",
    repeatEvery: "1",
    repeatAt: "00:00",
    selectedDays: [],
    selectedMonth: "January",
    selectedDate: "1"
};

// Function to convert interval state to cron expression
const convertToCron = (state: IntervalState): string => {
    const [hours, minutes] = state.repeatAt.split(':');
    
    switch (state.selectedInterval.toLowerCase()) {
        case "minutes":
            return `*/${state.repeatEvery} * * * *`;
            
        case "hourly":
            return `${minutes} */${state.repeatEvery} * * *`;
            
        case "daily":
            return `${minutes} ${hours} * * *`;
            
        case "weekly":
            if (state.selectedDays.length === 0) return "* * * * *";
            const days = state.selectedDays.map(day => {
                const dayMap: Record<string, number> = { 
                    "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 
                };
                return dayMap[day];
            }).join(',');
            return `${minutes} ${hours} * * ${days}`;
            
        case "monthly":
            return `${minutes} ${hours} ${state.selectedDate} * *`;
            
        case "yearly":
            const monthIndex = months.indexOf(state.selectedMonth) + 1;
            return `${minutes} ${hours} ${state.selectedDate} ${monthIndex} *`;
            
        default:
            return "* * * * *";
    }
};

// Months array for yearly interval
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const SchedulePicker = () => {
    const dispatch = useAppDispatch();
    const { selectedFlow, loading } = useAppSelector((state: RootState) => state.flow);
    const [cronExpression, setCronExpression] = useState<string>("* * * * *");
    const [intervalState, setIntervalState] = useState<IntervalState>(defaultState);
    const modalRef = useRef<IntervalModalRef>(null);

    useEffect(() => {
        if (selectedFlow?.flow_deployment?.[0]?.cron_expression) {
            // Handle both string and object formats
            const cronExp = selectedFlow.flow_deployment[0].cron_expression;
            if (typeof cronExp === 'string') {
                setCronExpression(cronExp);
            } else if (typeof cronExp === 'object' && cronExp.cron) {
                setCronExpression(cronExp.cron);
            }
            // TODO: Parse cron expression to interval state if needed
        }
    }, [selectedFlow?.flow_deployment]);

    const handleClear = async () => {
        if (selectedFlow?.flow_deployment?.[0]?.flow_deployment_id) {
            try {
                // Get default cron expression from the default state
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

    const handleSaveInterval = async (intervalJson: string) => {
        try {
            const newState = JSON.parse(intervalJson) as IntervalState;
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

    const openIntervalModal = () => {
        if (modalRef.current) {
            modalRef.current.open();
        }
    };

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative w-[180px]">
                            <Input
                                value={cronExpression}
                                readOnly
                                disabled={loading}
                                className="pr-20 cursor-pointer h-9 font-mono text-sm"
                                onClick={openIntervalModal}
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
                                    onClick={openIntervalModal}
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
            
            <IntervalModal
                ref={modalRef}
                initialState={intervalState}
                onStateChange={setIntervalState}
                onSave={handleSaveInterval}
            />
        </>
    );
};