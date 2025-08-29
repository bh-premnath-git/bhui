import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useFlow, useFlowSearch } from '@/features/designers/flow/hooks/useFlow';
import { useFlow as useFlowCtx } from '@/context/designers/FlowContext'
import { FlowForm } from "./flow-form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type FlowFormValues, flowFormSchema } from "./schema"
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from "@/config/routes";
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setSelectedProject, setSelectedEnv, setSelectedFlow, setCurrentFlow, fetchProjects, fetchEnvironments } from '@/store/slices/designer/flowSlice';
import { useEffect } from "react";

type CreateFlowDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CreateFlowDialog({ open, onOpenChange }: CreateFlowDialogProps) {
    const { setSelectedFlowId } = useFlowCtx();
    const { handleCreateFlow } = useFlow();
    const { handleNavigation } = useNavigation();
    const { searchedFlow, searchLoading, flowNotFound, debounceSearchFlow } = useFlowSearch();
    const dispatch = useAppDispatch();
    const { projects, environments } = useAppSelector((state) => state.flow);

    useEffect(() => {
        if (open) {
            dispatch(fetchProjects({ offset: 0, limit: 20, search: '' }));
            dispatch(fetchEnvironments({ offset: 0, limit: 20, search: '' }));
        }
    }, [open, dispatch]);

    const form = useForm<FlowFormValues>({
        resolver: zodResolver(flowFormSchema),
        defaultValues: {
            basicInformation: {
                project: "",
                environment: "",
                flowName: "",
                airflowInstance: "",
            },
            additionalDetails: {
                tags: [],
            },
            monitorSettings: {
                recipientEmails: { emails: [] },
                alertSettings: {
                    onJobStart: false,
                    onJobFailure: true,
                    onJobSuccess: false,
                    delayed: false,
                },
            },
        },
    });

    const onSubmit = async (data: FlowFormValues) => {
        try {
            // Get the selected environment to determine bh_airflow_id
            const selectedEnvironment = environments.find(env => 
                env.bh_env_id.toString() === data.basicInformation.environment
            );
            
            let bh_airflow_id: number | undefined;
            
            if (selectedEnvironment?.bh_airflow) {
                if (selectedEnvironment.bh_airflow.length === 1) {
                    // Auto-use the first (and only) airflow instance
                    bh_airflow_id = selectedEnvironment.bh_airflow[0].id;
                } else if (selectedEnvironment.bh_airflow.length > 1) {
                    if (!data.basicInformation.airflowInstance) {
                        // Set error if airflow instance is required but not selected
                        form.setError("basicInformation.airflowInstance", {
                            type: "required",
                            message: "Airflow instance is required when multiple instances are available"
                        });
                        return;
                    }
                    // Use the selected airflow instance
                    bh_airflow_id = Number(data.basicInformation.airflowInstance);
                }
            }

            await handleCreateFlow({
                flow_name: data.basicInformation.flowName,
                notes: '',
                recipient_email: data.monitorSettings.recipientEmails,
                tags: {
                    tagList: data.additionalDetails.tags.map(tag => ({ value: tag }))
                },
                bh_project_id: Number(data.basicInformation.project),
                alert_settings: {
                    on_job_start: data.monitorSettings.alertSettings.onJobStart,
                    on_job_failure: data.monitorSettings.alertSettings.onJobFailure,
                    on_job_success: data.monitorSettings.alertSettings.onJobSuccess,
                    long_running: data.monitorSettings.alertSettings.delayed
                },
                flow_json: {},
                bh_env_id: Number(data.basicInformation.environment),
                bh_airflow_id: bh_airflow_id
            }).then((result: any) => {
                dispatch(setSelectedProject(Number(data.basicInformation.project)));
                dispatch(setSelectedEnv(Number(data.basicInformation.environment)));
                dispatch(setSelectedFlow(result));
                dispatch(setCurrentFlow(result));

                setSelectedFlowId(result.flow_id.toString());
                handleNavigation(ROUTES.DESIGNERS.Data_FLOW_PLAYGROUND(result.flow_id.toString()));
                onOpenChange(false);
            }).catch(err => console.log(err));

            form.reset();
        } catch (error) {
            console.error('Failed to create flow:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Flow</DialogTitle>
                </DialogHeader>
                <FlowForm
                    form={form}
                    onSubmit={onSubmit}
                    searchedFlow={searchedFlow}
                    searchLoading={searchLoading}
                    flowNotFound={flowNotFound}
                    onFlowNameChange={debounceSearchFlow}
                />
            </DialogContent>
        </Dialog>
    );
}
