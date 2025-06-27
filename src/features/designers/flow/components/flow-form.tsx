import * as React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BasicInformation } from "./form-sections/basic-information"
import { AdditionalDetails } from "./form-sections/additional-details"
import { MonitorSettings } from "./form-sections/monitor-settings"
import { Button } from "@/components/ui/button"
import { AlertCircle, Save, Loader } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import type { FlowFormValues } from "./schema"
import { Form } from "@/components/ui/form"
import type { Flow } from '@/types/designer/flow'

interface FlowFormProps {
    form: UseFormReturn<FlowFormValues>
    onSubmit: (data: FlowFormValues) => Promise<void>
    searchedFlow?: Flow | null
    searchLoading?: boolean
    flowNotFound?: boolean
    onFlowNameChange?: (name: string) => void
}

export function FlowForm({ 
    form, 
    onSubmit,
    searchedFlow,
    searchLoading,
    flowNotFound,
    onFlowNameChange, 
}: FlowFormProps) {
    const [activeSection, setActiveSection] = React.useState("basic")
    const {
        formState: { errors, isSubmitting },
    } = form

    const hasBasicErrors = !!errors.basicInformation
    const hasMonitorErrors = !!errors.monitorSettings

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Accordion type="single" collapsible className="w-full" value={activeSection} onValueChange={setActiveSection}>
                    <AccordionItem value="basic">
                        <AccordionTrigger className="text-blue-600 hover:no-underline">
                            <div className="flex items-center gap-2">
                                Basic Information
                                {hasBasicErrors && <AlertCircle className="h-4 w-4 text-red-500" />}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <BasicInformation 
                                form={form} 
                                searchedFlow={searchedFlow}
                                searchLoading={searchLoading}
                                flowNotFound={flowNotFound}
                                onFlowNameChange={onFlowNameChange}
                            />
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="details">
                        <AccordionTrigger className="text-purple-600 hover:no-underline">Additional Details</AccordionTrigger>
                        <AccordionContent>
                            <AdditionalDetails form={form} />
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="monitor">
                        <AccordionTrigger className="text-green-600 hover:no-underline">
                            <div className="flex items-center gap-2">
                                Monitor Settings
                                {hasMonitorErrors && <AlertCircle className="h-4 w-4 text-red-500" />}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <MonitorSettings form={form} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={isSubmitting || (searchedFlow && !flowNotFound)}>
                        {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </Form>
    )
}