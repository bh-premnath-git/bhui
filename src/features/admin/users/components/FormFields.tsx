import type React from "react"
import { FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { MultiSelect } from "./MultiSelect"
import { getProjectOptions, getEnvironmentOptions } from "./userFormSchema"
import { AVAILABLE_ROLES } from "@/types/admin/roles"
import { Button } from "@/components/ui/button"
import { useFieldArray } from "react-hook-form"
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

// Helper function to check if user has admin access
const isUserAdmin = (user?: User): boolean => {
  if (!user?.access) return false;
  const { manageGroupMembership, view, mapRoles, impersonate, manage } = user.access;
  return manageGroupMembership && view && mapRoles && impersonate && manage;
};

export const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel className="flex gap-1">
    {children}
    <span className="text-destructive">*</span>
  </FormLabel>
)

export const NameFields = ({ form, disabled, user }: { form: any; disabled?: boolean; user?: User }) => (
  <div className="grid grid-cols-2 gap-6">
    <FormField
      control={form.control}
      name="first_name"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>First Name</RequiredFormLabel>
          <FormControl>
            <Input {...field} disabled={disabled} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="last_name"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Last Name</RequiredFormLabel>
          <FormControl>
            <Input {...field} disabled={disabled} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
)

export const EmailField = ({ form, user }: { form: any; user?: User }) => (
  <div className="grid grid-cols-3 gap-4">
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Email</RequiredFormLabel>
          <FormControl>
            <Input type="email" placeholder="Enter email address" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
)

export const StatusField = ({ form, user }: { form: any; user?: User }) => (
  <div>
    <FormField
      control={form.control}
      name="enabled"
      defaultValue={true}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center gap-2">
          <FormLabel>Status</FormLabel>
          <FormControl>
            <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
          </FormControl>
          <span className="text-sm text-muted-foreground">{field.value ? "Active" : "Inactive"}</span>
        </FormItem>
      )}
    />
  </div>
)

export const ProjectsAndEnvironmentsFields = ({ form, user }: { form: any; user?: User }) => {
  const projects = useAppSelector((state) => state.users.projects);
  const environments = useAppSelector((state) => state.users.environments);
  const projectOptions = getProjectOptions(projects);
  const environmentOptions = getEnvironmentOptions(environments);
  return (
    <div className="grid grid-cols-2 gap-6">
      <MultiSelect
        form={form}
        name="projects"
        label="Projects"
        placeholder="Select projects"
        options={projectOptions}
      />
      <MultiSelect
        form={form}
        name="environments"
        label="Environments"
        placeholder="Select environments"
        options={environmentOptions}
      />
    </div>
  )
}

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

export const RolesField = ({ form }: { form: any }) => {
  const roleOptions = AVAILABLE_ROLES.map(role => ({
    label: role
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    value: role
  }))

  return (
    <MultiSelect
      form={form}
      name="roles"
      label="Roles"
      placeholder="Select roles"
      options={roleOptions}
    />
  )
}

export const ProjectRolesField = ({ form, user }: { form: any; user?: User }) => {
  const projects = useAppSelector((state) => state.users.projects)
  const projectOptions = getProjectOptions(projects)
  const roleOptions = AVAILABLE_ROLES.map(role => ({
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
    const projects = form.watch(`project_assignments.${index}.projects`) || []
    const role = form.watch(`project_assignments.${index}.role`)
    
    if (projects.length === 0 || !role) {
      return "Configure assignment"
    }
    
    const roleLabel = roleOptions.find(r => r.value === role)?.label
    return `${projects.length} project${projects.length !== 1 ? 's' : ''} → ${roleLabel}`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ projects: [], role: '' })}
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
                      Select Projects
                    </FormLabel>
                    <MultiSelect
                      form={form}
                      name={`project_assignments.${index}.projects`}
                      label=""
                      placeholder="Choose projects"
                      options={projectOptions}
                    />
                    <p className="text-xs text-muted-foreground">
                      Access to all environments in these projects
                    </p>
                  </div>
                  
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Project Role
                    </FormLabel>
                    <Select
                      value={form.watch(`project_assignments.${index}.role`) || ''}
                      onValueChange={(val) => form.setValue(`project_assignments.${index}.role`, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role for projects" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      This role applies to all selected projects
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
  const environments = useAppSelector((state) => state.users.environments)
  const environmentOptions = getEnvironmentOptions(environments)
  const roleOptions = AVAILABLE_ROLES.map(role => ({
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
    const environments = form.watch(`environment_assignments.${index}.environments`) || []
    const role = form.watch(`environment_assignments.${index}.role`)
    
    if (environments.length === 0 || !role) {
      return "Configure assignment"
    }
    
    const roleLabel = roleOptions.find(r => r.value === role)?.label
    return `${environments.length} environment${environments.length !== 1 ? 's' : ''} → ${roleLabel}`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ environments: [], role: '' })}
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
                      Select Environments
                    </FormLabel>
                    <MultiSelect
                      form={form}
                      name={`environment_assignments.${index}.environments`}
                      label=""
                      placeholder="Choose specific environments"
                      options={environmentOptions}
                    />
                    <p className="text-xs text-muted-foreground">
                      Direct access to specific environments
                    </p>
                  </div>
                  
                  {/* Role Selection for Environments */}
                  <div className="space-y-2">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Environment Role
                    </FormLabel>
                    <Select
                      value={form.watch(`environment_assignments.${index}.role`) || ''}
                      onValueChange={(val) => form.setValue(`environment_assignments.${index}.role`, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role for environments" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

export const RoleAssignmentsField = ({ form, user }: { form: any; user?: User }) => {
  const projects = useAppSelector((state) => state.users.projects)
  const environments = useAppSelector((state) => state.users.environments)
  const projectOptions = getProjectOptions(projects)
  const environmentOptions = getEnvironmentOptions(environments)
  const roleOptions = AVAILABLE_ROLES.map(role => ({
    label: role
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    value: role
  }))
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'assignments'
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-medium">Environment-Specific Assignments</h5>
          <p className="text-sm text-muted-foreground">
            Fine-grained control for specific project-environment combinations
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ project: '', environment: '', role: '' })}
        >
          + Add Assignment
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground">
            No environment-specific assignments yet.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Add Assignment" to create granular permissions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field: any, index: number) => (
            <div key={field.id} className="p-4 border rounded-lg bg-card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {/* Project Selection */}
                <div className="space-y-1">
                  <FormLabel className="text-xs font-medium text-muted-foreground">PROJECT</FormLabel>
                  <Select
                    value={form.watch(`assignments.${index}.project`) || ''}
                    onValueChange={(val) => form.setValue(`assignments.${index}.project`, val)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Environment Selection */}
                <div className="space-y-1">
                  <FormLabel className="text-xs font-medium text-muted-foreground">ENVIRONMENT</FormLabel>
                  <Select
                    value={form.watch(`assignments.${index}.environment`) || ''}
                    onValueChange={(val) => form.setValue(`assignments.${index}.environment`, val)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {environmentOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role Selection */}
                <div className="space-y-1">
                  <FormLabel className="text-xs font-medium text-muted-foreground">ROLE</FormLabel>
                  <Select
                    value={form.watch(`assignments.${index}.role`) || ''}
                    onValueChange={(val) => form.setValue(`assignments.${index}.role`, val)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assignment Summary & Remove Button */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  {form.watch(`assignments.${index}.project`) && form.watch(`assignments.${index}.environment`) && form.watch(`assignments.${index}.role`) ? (
                    <>
                      <span className="font-medium">
                        {projectOptions.find(p => p.value === form.watch(`assignments.${index}.project`))?.label}
                      </span>
                      {' → '}
                      <span className="font-medium">
                        {environmentOptions.find(e => e.value === form.watch(`assignments.${index}.environment`))?.label}
                      </span>
                      {' → '}
                      <span className="font-medium">
                        {roleOptions.find(r => r.value === form.watch(`assignments.${index}.role`))?.label}
                      </span>
                    </>
                  ) : (
                    'Please select project, environment, and role'
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-destructive hover:text-destructive h-8 px-2"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
