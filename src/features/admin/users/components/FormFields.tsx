import type React from "react"
import { FormLabel } from "@/components/ui/form"
import { getProjectOptions, getEnvironmentOptions, getRoleOptions } from "./userFormSchema"
import { Button } from "@/components/ui/button"
import { useFieldArray, useWatch } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"
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
import { AlertCircle, Crown, Loader2, Palette, Shield, Wrench, Eye, Edit, Trash2, Settings } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { RoleMatrixEntry } from "@/types/admin/roles"

export const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel className="flex gap-1">
    {children}
    <span className="text-destructive">*</span>
  </FormLabel>
)

export const ProjectField = ({ form, user }: { form: any; user?: User }) => {
  // Watch current project selections
  const projectAssignments = useWatch({ control: form.control, name: 'project_assignments' }) as string[] | undefined
  const projects = useAppSelector((state) => state.users.projects)
  const projectOptions = getProjectOptions(projects)

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'project_assignments'
  })

  const getAssignmentSummary = (index: number) => {
    const projectId = form.watch(`project_assignments.${index}`) || ''

    if (!projectId || projectId === 'no-project') {
      return "No Project Selected"
    }

    const projectLabel = projectOptions.find(p => p.value === projectId)?.label
    return projectLabel || "Unknown Project"
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append('no-project')}
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
                  <div className="space-y-2">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Select Project
                    </FormLabel>
                    <Select
                      value={form.watch(`project_assignments.${index}`) || 'no-project'}
                      onValueChange={(val) => form.setValue(`project_assignments.${index}`, val)}
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
                        <SelectItem key="no-project" value="no-project">
                          No Project
                        </SelectItem>
                      </SelectContent>
                    </Select>
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

export const EnvironmentField = ({ form, user }: { form: any; user?: User }) => {
  // Watch environment selection
  const envAssignments = useWatch({ control: form.control, name: 'environment_assignments' }) as string[] | undefined
  const environments = useAppSelector((state) => state.users.environments)
  const environmentOptions = getEnvironmentOptions(environments)

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'environment_assignments'
  })

  const getAssignmentSummary = (index: number) => {
    const environmentId = form.watch(`environment_assignments.${index}`) || ''

    if (!environmentId || environmentId === 'no-environment') {
      return "No Environment Selected"
    }

    const envLabel = environmentOptions.find(e => e.value === environmentId)?.label
    return envLabel || "Unknown Environment"
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append('no-environment')}
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
                      value={form.watch(`environment_assignments.${index}`) || 'no-environment'}
                      onValueChange={(val) => form.setValue(`environment_assignments.${index}`, val)}
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
                        <SelectItem key="no-environment" value="no-environment">
                          No Environment
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Direct access to this environment
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

export const RolesField = ({ 
  form, 
  isTenantAdmin, 
  searchTerm, 
  roles, 
  isLoading, 
  isError 
}: { 
  form: any; 
  isTenantAdmin: boolean; 
  searchTerm: string;
  roles?: RoleMatrixEntry[];
  isLoading?: boolean;
  isError?: boolean;
}) => {
  const roleOptions = getRoleOptions(roles)
  
  // Watch current selected roles and permissions
  const selectedRoles = useWatch({ control: form.control, name: 'selected_roles' }) as string[] || []
  const rolePermissions = useWatch({ control: form.control, name: 'role_permissions' }) as Record<string, { view: boolean, edit: boolean, delete: boolean }> || {}
  
  // Check if admin role is selected
  const hasAdminRole = selectedRoles.includes('1') // admin_role value
  
  // Get available roles based on hierarchy
  const getAvailableRoles = () => {
    if (hasAdminRole) {
      // If admin is selected, only show admin role
      return roleOptions.filter(role => role.value === '1')
    }
    // Otherwise show all roles
    return roleOptions
  }

  const availableRoles = getAvailableRoles()

  const handleRoleChange = (roleValue: string, checked: boolean) => {
    let newRoles = [...selectedRoles]
    let newPermissions = { ...rolePermissions }
    
    if (checked) {
      // Adding a role
      if (roleValue === '1') {
        // If selecting admin, clear all other roles and set only admin
        newRoles = ['1']
        // Admin gets all permissions automatically (no need to store them)
        newPermissions = {}
      } else {
        // If selecting non-admin role, remove admin if present and add this role
        newRoles = newRoles.filter(r => r !== '1')
        if (!newRoles.includes(roleValue)) {
          newRoles.push(roleValue)
        }
        // Set default permissions for new role (all true)
        if (!newPermissions[roleValue]) {
          newPermissions[roleValue] = { view: true, edit: true, delete: true }
        }
      }
    } else {
      // Removing a role
      newRoles = newRoles.filter(r => r !== roleValue)
      // Remove permissions for this role
      delete newPermissions[roleValue]
    }
    
    form.setValue('selected_roles', newRoles)
    form.setValue('role_permissions', newPermissions)
  }

  const handlePermissionChange = (roleValue: string, permissionType: 'view' | 'edit' | 'delete', checked: boolean) => {
    const newPermissions = { ...rolePermissions }
    if (!newPermissions[roleValue]) {
      newPermissions[roleValue] = { view: true, edit: true, delete: true }
    }
    newPermissions[roleValue][permissionType] = checked
    form.setValue('role_permissions', newPermissions)
  }

  const getRoleIcon = (roleLabel: string) => {
    switch (roleLabel) {
      case 'admin_role':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'designer_role':
        return <Palette className="h-4 w-4 text-purple-600" />
      case 'ops_role':
        return <Wrench className="h-4 w-4 text-blue-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleDescription = (roleLabel: string) => {
    switch (roleLabel) {
      case 'admin_role':
        return 'Full system access - all permissions included'
      case 'designer_role':
        return 'Design and development access'
      case 'ops_role':
        return 'Operations and monitoring access'
      default:
        return 'Role-specific access'
    }
  }

  const getPermissionIcon = (permissionType: 'view' | 'edit' | 'delete') => {
    switch (permissionType) {
      case 'view':
        return <Eye className="h-3 w-3 text-green-600" />
      case 'edit':
        return <Edit className="h-3 w-3 text-blue-600" />
      case 'delete':
        return <Trash2 className="h-3 w-3 text-red-600" />
    }
  }

  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Role Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading roles...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Role Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load roles. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-500" />
          Role Assignment
        </CardTitle>
        {hasAdminRole && (
          <Badge variant="secondary" className="w-fit">
            Admin Access - Full Permissions
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {availableRoles.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
            <p className="text-sm text-muted-foreground">No roles available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-3">
              {availableRoles.map((role) => {
                const isSelected = selectedRoles.includes(role.value)
                const isDisabled = hasAdminRole && role.value !== '1'
                
                return (
                  <div
                    key={role.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      isSelected 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-card hover:bg-muted/50'
                    } ${isDisabled ? 'opacity-50' : ''}`}
                  >
                    <Checkbox
                      id={`role-${role.value}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleRoleChange(role.value, checked as boolean)}
                      disabled={isDisabled}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role.label)}
                        <label 
                          htmlFor={`role-${role.value}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {role.label.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        {isSelected && (
                          <Badge variant="default">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getRoleDescription(role.label)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Permission Checkboxes for Designer and Ops Roles */}
            {!hasAdminRole && selectedRoles.some(role => role === '2' || role === '3') && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Role Permissions</span>
                </div>
                
                {selectedRoles.filter(role => role === '2' || role === '3').map((roleValue) => {
                  const role = roleOptions.find(r => r.value === roleValue)
                  const permissions = rolePermissions[roleValue] || { view: true, edit: true, delete: true }
                  
                  return (
                    <div key={roleValue} className="space-y-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role?.label || '')}
                        <span className="text-sm font-medium">
                          {role?.label.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Permissions
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {(['view', 'edit', 'delete'] as const).map((permissionType) => (
                          <div key={permissionType} className="flex items-center gap-2">
                            <Checkbox
                              id={`${roleValue}-${permissionType}`}
                              checked={permissions[permissionType]}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(roleValue, permissionType, checked as boolean)
                              }
                            />
                            <label 
                              htmlFor={`${roleValue}-${permissionType}`}
                              className="flex items-center gap-1 text-xs font-medium cursor-pointer"
                            >
                              {getPermissionIcon(permissionType)}
                              {permissionType.charAt(0).toUpperCase() + permissionType.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {hasAdminRole && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm font-medium">Admin Role Selected</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Admin role provides full system access. Other roles are automatically included.
                </p>
              </div>
            )}
            
            {selectedRoles.length > 1 && !hasAdminRole && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Multiple Roles Selected</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  User will have combined permissions from all selected roles.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}