import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FlowForm } from "./flow-form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type FlowFormValues, flowFormSchema } from "./schema"


type CreateFlowDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateFlowDialog({ open, onOpenChange }: CreateFlowDialogProps) {
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
      })
      const onSubmit = async (data: FlowFormValues) => {
        try {
          
        } catch (error) {
            
        }
      }
      
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Flow</DialogTitle>
        </DialogHeader>
        <FlowForm form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
