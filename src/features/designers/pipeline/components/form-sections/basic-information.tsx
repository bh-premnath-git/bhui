import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { FormValues } from "../schema"

interface BasicInformationProps {
    form: UseFormReturn<FormValues>
}

export function BasicInformation({ form }: BasicInformationProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Project</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="project1">Project 1</SelectItem>
                                <SelectItem value="project2">Project 2</SelectItem>
                                <SelectItem value="project3">Project 3</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
