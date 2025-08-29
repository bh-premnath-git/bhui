import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { UseFormReturn } from "react-hook-form"
import type { FlowFormValues } from "../schema"
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux"
import { getEnvironmentOptions, getProjectOptions, getAirflowOptions } from "../schema"
import { Loader2, X, Check } from "lucide-react"
import type { Flow } from '@/types/designer/flow'
import { Combobox } from "@/components/ui/combobox"
import { useDebounce } from "@/hooks/useDebounce"
import { useEffect, useState } from "react"
import { fetchEnvironments, fetchProjects, setEnvironmentSearchQuery, setProjectSearchQuery } from "@/store/slices/designer/flowSlice"

const LIMIT = 20;

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
  onFlowNameChange,
}: BasicInformationProps) {
  const dispatch = useAppDispatch();
  const {
    projects,
    projectsLoading,
    projectSearchQuery,
    projectsOffset,
    hasMoreProjects,
    environments,
    environmentsLoading,
    environmentSearchQuery,
    environmentsOffset,
    hasMoreEnvironments,
  } = useAppSelector((state) => state.flow);

  const [projectInput, setProjectInput] = useState('');
  const debouncedProjectSearch = useDebounce(projectInput, 500);

  useEffect(() => {
    dispatch(setProjectSearchQuery(debouncedProjectSearch));
    dispatch(fetchProjects({ offset: 0, limit: LIMIT, search: debouncedProjectSearch }));
  }, [debouncedProjectSearch, dispatch]);

  const projectOptions = getProjectOptions(projects);

  const loadMoreProjects = () => {
    if (hasMoreProjects && !projectsLoading) {
      dispatch(fetchProjects({ offset: projectsOffset, limit: LIMIT, search: projectSearchQuery }));
    }
  };

  const [environmentInput, setEnvironmentInput] = useState('');

  const debouncedEnvironmentSearch = useDebounce(environmentInput, 500);

  useEffect(() => {
    dispatch(setEnvironmentSearchQuery(debouncedEnvironmentSearch));
    dispatch(fetchEnvironments({ offset: 0, limit: LIMIT, search: debouncedEnvironmentSearch }));
  }, [debouncedEnvironmentSearch, dispatch]);

  const environmentOptions = getEnvironmentOptions(environments);

  const loadMoreEnvironments = () => {
    if (hasMoreEnvironments && !environmentsLoading) {
      dispatch(fetchEnvironments({ offset: environmentsOffset, limit: LIMIT, search: environmentSearchQuery }));
    }
  };

  // Get selected environment and its airflow instances
  const selectedEnvironmentId = form.watch("basicInformation.environment");
  const selectedEnvironment = environments.find(env => env.bh_env_id.toString() === selectedEnvironmentId);
  const airflowInstances = selectedEnvironment?.bh_airflow || [];
  const airflowOptions = getAirflowOptions(airflowInstances);

  // Auto-select airflow instance if only one exists
  useEffect(() => {
    if (selectedEnvironmentId && airflowInstances.length === 1) {
      form.setValue("basicInformation.airflowInstance", airflowInstances[0].id.toString());
    } else if (selectedEnvironmentId && airflowInstances.length === 0) {
      form.setValue("basicInformation.airflowInstance", "");
    } else if (selectedEnvironmentId && airflowInstances.length > 1) {
      // Clear the field when environment changes and there are multiple instances
      form.setValue("basicInformation.airflowInstance", "");
    }
  }, [selectedEnvironmentId, airflowInstances, form]);

  // Custom validation for airflow instance
  useEffect(() => {
    if (selectedEnvironmentId && airflowInstances.length > 1) {
      const currentValue = form.getValues("basicInformation.airflowInstance");
      if (!currentValue) {
        form.setError("basicInformation.airflowInstance", {
          type: "required",
          message: "Airflow instance is required when multiple instances are available"
        });
      } else {
        form.clearErrors("basicInformation.airflowInstance");
      }
    }
  }, [selectedEnvironmentId, airflowInstances, form.watch("basicInformation.airflowInstance"), form]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="basicInformation.project"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">Project</FormLabel>
            <Combobox
              options={projectOptions}
              value={field.value}
              onChange={field.onChange}
              onSearch={setProjectInput}
              onLoadMore={loadMoreProjects}
              isLoading={projectsLoading}
              placeholder="Select Project"
              searchPlaceholder="Search projects..."
              emptyText="No projects found."
            />
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
            <Combobox
              options={environmentOptions}
              value={field.value}
              onChange={field.onChange}
              onSearch={setEnvironmentInput}
              onLoadMore={loadMoreEnvironments}
              isLoading={environmentsLoading}
              placeholder="Select Environment"
              searchPlaceholder="Search environments..."
              emptyText="No environments found."
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Airflow Instance Selection - only show if environment is selected and has multiple airflow instances */}
      {selectedEnvironmentId && airflowInstances.length > 1 && (
        <FormField
          control={form.control}
          name="basicInformation.airflowInstance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">Airflow Instance</FormLabel>
              <Combobox
                options={airflowOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select Airflow Instance"
                searchPlaceholder="Search airflow instances..."
                emptyText="No airflow instances found."
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}

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
