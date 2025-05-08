import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { UseFormReturn } from "react-hook-form"
import type { FlowFormValues } from "../schema"
import { useAppSelector } from "@/hooks/useRedux"
import { getProjectOptions, getEnvironmentOptions } from "../schema"
import { Loader2, X, Check } from "lucide-react"
import type { Flow } from '@/types/designer/flow'

interface BasicInformationProps {
  form: UseFormReturn<FlowFormValues>
  searchedFlow?: Flow | null
  searchLoading?: boolean
  flowNotFound?: boolean
  onFlowNameChange?: (name: string) => void
}

export function BasicInformation({ 
  form,
  searchedFlow,
  searchLoading,
  flowNotFound,
  onFlowNameChange
}: BasicInformationProps) {
  const { projects, environments } = useAppSelector((state) => state.flow);
  const projectOptions = getProjectOptions(projects);
  const environmentOptions = getEnvironmentOptions(environments);

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
                {projectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
                {environmentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
              <Input 
                placeholder="Enter Flow Name" 
                {...field} 
                onChange={(e) => {
                  field.onChange(e);
                  onFlowNameChange?.(e.target.value);
                }}
              />
            </FormControl>
            {searchLoading && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking availability...
              </div>
            )}
            {searchedFlow && !flowNotFound && (
              <div className="flex items-center text-sm text-destructive">
                <X className="h-4 w-4 mr-2" />
                Flow name already taken
              </div>
            )}
            {flowNotFound && (
              <div className="flex items-center text-sm text-green-600">
                <Check className="h-4 w-4 mr-2" />
                Flow name available
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
