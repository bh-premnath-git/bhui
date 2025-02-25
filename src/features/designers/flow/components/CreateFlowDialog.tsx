import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFlow, useFlowSearch } from '@/features/designers/flow/hooks/useFlow';
import { FlowForm } from "./flow-form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type FlowFormValues, flowFormSchema } from "./schema"

type CreateFlowDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateFlowDialog({ open, onOpenChange }: CreateFlowDialogProps) {
    const { handleCreateFlow } = useFlow();
    const { searchedFlow, searchLoading, flowNotFound, debounceSearchFlow } = useFlowSearch();
    
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
            recipientEmails: [],
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
            const alertConfig = {
                on_job_start: data.monitorSettings.alertSettings.onJobStart,
                on_job_failure: data.monitorSettings.alertSettings.onJobFailure,
                on_job_success: data.monitorSettings.alertSettings.onJobSuccess,
                delayed: data.monitorSettings.alertSettings.delayed,
            };

            await handleCreateFlow({
                flow_name: data.basicInformation.flowName,
                bh_project_name: data.basicInformation.project,
                flow_key: data.basicInformation.flowName.toLowerCase().replace(/\s+/g, '_'),
                notes: '',
                recipient_email: data.monitorSettings.recipientEmails,
                flow_config: [JSON.stringify(alertConfig)],
                flow_definition: {
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    created_by: 1,
                    updated_by: null,
                    is_deleted: false,
                    deleted_by: null,
                    flow_definition_id: 0,
                    flow_id: 0,
                    flow_json: []
                },
                tags: {
                    tagList: data.additionalDetails.tags
                }
            });
            onOpenChange(false);
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
