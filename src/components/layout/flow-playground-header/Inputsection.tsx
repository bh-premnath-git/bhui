import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { RootState } from "@/store/";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { patchFlowOperation } from '@/store/slices/designer/flowSlice';

export const Inputsection = () => {
    const dispatch = useAppDispatch();
    const { selectedFlow } = useAppSelector((state: RootState) => state.flow);
    const [flowName, setFlowName] = useState(selectedFlow?.flow_name || '');
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        if (selectedFlow?.flow_name) {
            setFlowName(selectedFlow.flow_name);
        }
    }, [selectedFlow?.flow_name]);

    const handleRename = async () => {
        if (selectedFlow && flowName !== selectedFlow.flow_name) {
            await dispatch(patchFlowOperation({
                flowId: selectedFlow.flow_id,
                data: { flow_name: flowName }
            }));
        }
        setIsEditing(false);
    };

    return (
        <div className="relative w-64">
            <Input
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleRename();
                    }
                }}
                disabled={!isEditing}
                placeholder="Flow name..."
                className={cn(
                    "pr-12 h-9",
                    !isEditing && "border-transparent bg-transparent hover:border-input focus:border-input"
                )}
            />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-full h-7 w-7 p-1.5"
            >
                <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
        </div>
    );
};