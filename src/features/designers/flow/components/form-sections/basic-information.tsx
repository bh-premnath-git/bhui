import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { UseFormReturn } from "react-hook-form"
import type { FlowFormValues } from "../schema"

interface BasicInformationProps {
  form: UseFormReturn<FlowFormValues>
}

export function BasicInformation({ form }: BasicInformationProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="basicInformation.project"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">Project</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="project1">Project 1</SelectItem>
                <SelectItem value="project2">Project 2</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="basicInformation.environment"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">Environment</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Environment" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="dev">Development</SelectItem>
                <SelectItem value="prod">Production</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="basicInformation.flowName"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">Flow Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter Flow Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

