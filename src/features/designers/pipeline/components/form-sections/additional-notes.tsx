import { useState } from "react"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { FormValues } from "../schema"

interface AdditionalNotesProps {
    form: UseFormReturn<FormValues>
}

export function AdditionalNotes({ form }: AdditionalNotesProps) {
    const [isNotesOpen, setIsNotesOpen] = useState(false)

    return (
        <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen} className="space-y-2">
            <div className="flex items-center space-x-4">
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 p-0 text-sm font-normal text-blue-600 hover:text-blue-700"
                    >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isNotesOpen ? "rotate-180" : ""}`} />
                        Add Notes
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="Add notes (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CollapsibleContent>
        </Collapsible>
    )
}
