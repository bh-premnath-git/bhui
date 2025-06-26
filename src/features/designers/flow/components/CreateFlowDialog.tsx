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
import { type FlowFormValues, flowFormSchema, getProjectOptions } from "./schema"
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from "@/config/routes";
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setSelectedProject, setSelectedEnv, setSelectedFlow, setCurrentFlow, setProjects } from '@/store/slices/designer/flowSlice';
import { useProjects } from "@/features/admin/projects/hooks/useProjects";
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
    const { projects: fetchedProjects, isLoading: projectsLoading } = useProjects();

    useEffect(() => {
        if (fetchedProjects.length > 0) {
            dispatch(setProjects(fetchedProjects));
        }
    }, [fetchedProjects, dispatch]);

    const projectOptions = getProjectOptions(projects);

    const form = useForm<FlowFormValues>({
        resolver: zodResolver(flowFormSchema),
        defaultValues: {
            basicInformation: {
                project: "",
                environment: "",
                flowName: "",
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
                bh_env_id: Number(data.basicInformation.environment)
            }).then((result: any) => {
                console.log(result,"resulrt")
                result.bh_project_name= projectOptions.find(
                    (project) => project.value === data.basicInformation.project
                )?.label || '';
                console.log(result,"resulrt")

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
                    projectOptions={projectOptions}
                    projectsLoading={projectsLoading}
                />
            </DialogContent>
        </Dialog>
    );
}
