import type React from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { environments, platforms } from "./environmentFormSchema"
import { AddTagDialog } from "@/components/shared/AddTagDialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel>
    {children}
    <span className="text-red-500 ml-1">*</span>
  </FormLabel>
)

export const EnvironmentDetailsFields = ({ form }: { form: any }) => (
  <div className="grid gap-4 md:grid-cols-2">
    <FormField
      control={form.control}
      name="environmentName"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Environment Name</RequiredFormLabel>
          <FormControl>
            <Input placeholder="e.g. My Dev Env" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="environment"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Environment</RequiredFormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Environment" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {environments.map((env) => (
                <SelectItem key={env.value} value={env.value}>
                  {env.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
)

export const PlatformFields = ({ form }: { form: any }) => (
  <div className="grid gap-4 md:grid-cols-3">
    <FormField
      control={form.control}
      name="platform.type"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Platform</RequiredFormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {platforms.map((platform) => (
                <SelectItem key={platform.value} value={platform.value}>
                  {platform.label}
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
      name="platform.region"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Region</FormLabel>
          <FormControl>
            <Input placeholder="e.g. us-east-1" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="platform.zone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Zone</FormLabel>
          <FormControl>
            <Input placeholder="e.g. us-east-1a" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
)

export const CredentialsFields = ({ form }: { form: any }) => (
  <div className="grid gap-4">
    <FormField
      control={form.control}
      name="credentials.accessKey"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Access Key</FormLabel>
          <FormControl>
            <Input type="password" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="credentials.secretKey"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Secret Key</FormLabel>
          <FormControl>
            <Input type="password" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="credentials.token"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Token (Optional)</FormLabel>
          <FormControl>
            <Input type="password" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
)

export const AdvancedSettingsFields = ({ form }: { form: any }) => (
  <div className="grid gap-4 md:grid-cols-3">
    <FormField
      control={form.control}
      name="advancedSettings.vpc"
      render={({ field }) => (
        <FormItem>
          <FormLabel>VPC ID</FormLabel>
          <FormControl>
            <Input placeholder="vpc-xxxxxx" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="advancedSettings.subnet"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Subnet ID</FormLabel>
          <FormControl>
            <Input placeholder="subnet-xxxxxx" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="advancedSettings.securityGroup"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Security Group ID</FormLabel>
          <FormControl>
            <Input placeholder="sg-xxxxxx" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
)

export const TagsField = ({ form }: { form: any }) => {
  const tags = form.watch("tags") || []

  const addTag = (key: string, value: string) => {
    form.setValue("tags", [...tags, { key, value }])
  }

  const removeTag = (index: number) => {
    const newTags = tags.filter((_: any, i: number) => i !== index)
    form.setValue("tags", newTags)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Add Tags</h3>
          <p className="text-sm text-muted-foreground">
            Add one or more tags to easily identify resources in your cloud environment
          </p>
        </div>
        <AddTagDialog onAddTag={addTag} />
      </div>

      {tags.length > 0 && (
        <div className="space-y-4">
          {tags.map((tag: any, index: number) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
              <div className="grid gap-1 flex-1">
                <div className="text-sm font-medium">Key</div>
                <div className="text-sm text-muted-foreground">{tag.key}</div>
              </div>
              <div className="grid gap-1 flex-1">
                <div className="text-sm font-medium">Value</div>
                <div className="text-sm text-muted-foreground">{tag.value}</div>
              </div>
              <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => removeTag(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}