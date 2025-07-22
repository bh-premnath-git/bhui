import type React from "react"
import { FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { MultiSelect } from "./MultiSelect"
import { getProjectOptions, getEnvironmentOptions } from "./userFormSchema"
import { AVAILABLE_ROLES } from "@/types/admin/roles"
import { Button } from "@/components/ui/button"
import { useFieldArray, useWatch } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { useAppSelector } from "@/hooks/useRedux"
import type { User } from "@/types/admin/user"
import { useRoleMatrixQuery } from "../hooks/useRoleMatrixQuery"



export const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel className="flex gap-1">
    {children}
    <span className="text-destructive">*</span>
  </FormLabel>
)

export const TenantAdminField = ({ form, user }: { form: any; user?: User }) => {
  return (
    <div>
      <FormField
        control={form.control}
        name="is_tenant_admin"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2">
            <FormLabel className="text-green-700 font-medium">
              Tenant Admin
            </FormLabel>
            <FormControl>
              <Switch 
                checked={field.value ?? false} 
                onCheckedChange={field.onChange}
                className={field.value ? "data-[state=checked]:bg-green-600" : ""}
              />
            </FormControl>
            <span className={`text-sm ${field.value ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
              {field.value ? 'Yes' : 'No'}
            </span>
          </FormItem>
        )}
      />
    </div>
  )
}

export const ProjectRolesField = ({ form, user }: { form: any; user?: User }) => {
  // Watch current project selections to trigger role-matrix API call
  const projectAssignments = useWatch({ control: form.control, name: 'project_assignments' }) as { project?: string }[] | undefined
  const firstProjectId = projectAssignments?.[0]?.project
  // Fetch roles for selected project
  const { roles: fetchedRoles } = useRoleMatrixQuery({ projectId: firstProjectId, enabled: Boolean(firstProjectId) })
  const projects = useAppSelector((state) => state.users.projects)
  const projectOptions = getProjectOptions(projects)
  
  // Use fetched roles if available, otherwise fall back to static roles
  const projectRoleNames = fetchedRoles && fetchedRoles.length > 0
    ? Array.from(new Set(fetchedRoles.map(r => r.role_name)))
    : AVAILABLE_ROLES
    
  const roleOptions = projectRoleNames.map(role => ({
    label: role
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    value: role
  }))

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'project_assignments'
  })

  const getAssignmentSummary = (index: number) => {
    const project = form.watch(`project_assignments.${index}.project`) || ''
    const roles: string[] = form.watch(`project_assignments.${index}.roles`) || []
    
    if (!project || roles.length === 0) {
      return "Configure assignment"
    }
    
    const projectLabel = projectOptions.find(p=>p.value===project)?.label
    const roleLabels = roles.map(r=>roleOptions.find(ro=>ro.value===r)?.label).filter(Boolean).join(', ')
    return `${projectLabel} → ${roleLabels}`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ project: '', roles: [] })}
          className="ml-auto"
        >
          + Add Project Assignment
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground">
            No project assignments yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Add Project Assignment" to grant project-wide access
          </p>
        </div>
      ) : (
        <Accordion type="multiple" className="w-full space-y-2">
          {fields.map((field: any, index: number) => (
            <AccordionItem 
              key={field.id} 
              value={`project-${index}`}
              className="border rounded-lg bg-card/30"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full mr-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs bg-blue-50">
                      Project #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">
                      {getAssignmentSummary(index)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(index)
                    }}
                    className="text-destructive hover:text-destructive h-7 w-7 p-0"
                  >
                    ×
                  </Button>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Project Selection */}
                  <div className="space-y-2">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Select Project
                    </FormLabel>
                    <Select
                      value={form.watch(`project_assignments.${index}.project`) || ''}
                      onValueChange={(val) => form.setValue(`project_assignments.${index}.project`, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Access to all environments in these projects
                    </p>
                  </div>
                  
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Project Roles
                    </FormLabel>
                    <MultiSelect
                      form={form}
                      name={`project_assignments.${index}.roles`}
                      label=""
                      placeholder="Select roles"
                      options={roleOptions}
                    />
                    <p className="text-xs text-muted-foreground">
                      These roles apply to the selected project
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export const EnvironmentRolesField = ({ form, user }: { form: any; user?: User }) => {
  // Watch environment selection to trigger role matrix call
  const envAssignments = useWatch({ control: form.control, name: 'environment_assignments' }) as { environment?: string }[] | undefined
  const firstEnvId = envAssignments?.[0]?.environment
  const { roles: fetchedEnvRoles } = useRoleMatrixQuery({ environmentId: firstEnvId, enabled: Boolean(firstEnvId) })
  const environments = useAppSelector((state) => state.users.environments)
  const environmentOptions = getEnvironmentOptions(environments)
  
  // Use fetched environment roles if available, otherwise fall back to static roles
  const environmentRoleNames = fetchedEnvRoles && fetchedEnvRoles.length > 0
    ? Array.from(new Set(fetchedEnvRoles.map(r => r.role_name)))
    : AVAILABLE_ROLES
    
  const roleOptions = environmentRoleNames.map(role => ({
    label: role
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    value: role
  }))

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'environment_assignments'
  })

  const getAssignmentSummary = (index: number) => {
    const environment = form.watch(`environment_assignments.${index}.environment`) || ''
    const roles: string[] = form.watch(`environment_assignments.${index}.roles`) || []
    
    if (!environment || roles.length === 0) {
      return "Configure assignment"
    }
    
    const envLabel = environmentOptions.find(e => e.value === environment)?.label
    const roleLabels = roles.map(r=>roleOptions.find(ro=>ro.value===r)?.label).filter(Boolean).join(', ')
    return `${envLabel} → ${roleLabels}`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ environment: '', roles: [] })}
          className="ml-auto"
        >
          + Add Environment Assignment
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground">
            No environment assignments yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Add Environment Assignment" to grant environment-specific access
          </p>
        </div>
      ) : (
        <Accordion type="multiple" className="w-full space-y-2">
          {fields.map((field: any, index: number) => (
            <AccordionItem 
              key={field.id} 
              value={`environment-${index}`}
              className="border rounded-lg bg-card/30"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full mr-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs bg-green-50">
                      Environment #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">
                      {getAssignmentSummary(index)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(index)
                    }}
                    className="text-destructive hover:text-destructive h-7 w-7 p-0"
                  >
                    ×
                  </Button>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Environment Selection */}
                  <div className="space-y-2">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Select Environment
                    </FormLabel>
                    <Select
                      value={form.watch(`environment_assignments.${index}.environment`) || ''}
                      onValueChange={(val) => form.setValue(`environment_assignments.${index}.environment`, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose environment" />
                      </SelectTrigger>
                      <SelectContent>
                        {environmentOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Direct access to this environment
                    </p>
                  </div>
                  
                  {/* Roles Selection */}
                  <div className="space-y-2">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Environment Roles
                    </FormLabel>
                    <MultiSelect
                      form={form}
                      name={`environment_assignments.${index}.roles`}
                      label=""
                      placeholder="Select roles"
                      options={roleOptions}
                    />
                    <p className="text-xs text-muted-foreground">
                      This role applies to all selected environments
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
