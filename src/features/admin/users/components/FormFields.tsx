import type React from "react"
import { FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { MultiSelect } from "./MultiSelect"
import { getProjectOptions, getEnvironmentOptions } from "./userFormSchema"
import { Button } from "@/components/ui/button"
import { useFieldArray } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppSelector } from "@/hooks/useRedux"

export const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel className="flex gap-1">
    {children}
    <span className="text-destructive">*</span>
  </FormLabel>
)

export const NameFields = ({ form, disabled }: { form: any; disabled?: boolean }) => (
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

export const EmailField = ({ form }: { form: any }) => (
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

export const StatusField = ({ form }: { form: any }) => (
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

export const ProjectsAndEnvironmentsFields = ({ form }: { form: any }) => {
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

export const TenantAdminField = ({ form }: { form: any }) => (
  <div>
    <FormField
      control={form.control}
      name="is_tenant_admin"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center gap-2">
          <FormLabel>Tenant Admin</FormLabel>
          <FormControl>
            <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
          </FormControl>
          <span className="text-sm text-muted-foreground">{field.value ? 'Yes' : 'No'}</span>
        </FormItem>
      )}
    />
  </div>
)

export const RolesField = ({ form }: { form: any }) => {
  const roleOptions = [
    { label: 'Designer', value: 'designer' },
    { label: 'Ops User', value: 'ops_user' },
    { label: 'Admin', value: 'admin' },
  ]

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

export const RoleAssignmentsField = ({ form }: { form: any }) => {
  const projects = useAppSelector((state) => state.users.projects)
  const environments = useAppSelector((state) => state.users.environments)
  const projectOptions = getProjectOptions(projects)
  const environmentOptions = getEnvironmentOptions(environments)
  const roleOptions = [
    { label: 'Designer', value: 'designer' },
    { label: 'Ops User', value: 'ops_user' },
    { label: 'Admin', value: 'admin' },
  ]
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'assignments'
  })

  return (
    <div className="space-y-2">
      <RequiredFormLabel>Role Assignments</RequiredFormLabel>
      {fields.map((field: any, index: number) => (
        <div key={field.id} className="grid grid-cols-4 gap-2 items-center">
          <Select
            value={form.watch(`assignments.${index}.project`) || ''}
            onValueChange={(val) => form.setValue(`assignments.${index}.project`, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              {projectOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.watch(`assignments.${index}.environment`) || ''}
            onValueChange={(val) => form.setValue(`assignments.${index}.environment`, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              {environmentOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.watch(`assignments.${index}.role`) || ''}
            onValueChange={(val) => form.setValue(`assignments.${index}.role`, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-destructive hover:underline text-sm"
          >
            Remove
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ project: '', environment: '', role: '' })}
      >
        Add Assignment
      </Button>
    </div>
  )
}
