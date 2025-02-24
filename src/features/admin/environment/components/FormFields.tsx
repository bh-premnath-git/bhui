import type React from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { environments, platforms, regions } from "./environmentFormSchema"
import { AddTagDialog } from "@/components/shared/AddTagDialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel>
    {children}
    <span className="text-red-500 ml-1">*</span>
  </FormLabel>
)

export const EnvironmentDetailsFields = ({ form }: { form: any }) => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
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
  </div>
)

export const PlatformFields = ({ form }: { form: any }) => (
  <div className="space-y-2">
    <FormField
      control={form.control}
      name="platform.type"
      render={({ field }) => (
        <FormItem>
          <div className="flex gap-4">
            {platforms.map((platform) => (
              <button
                key={platform.value}
                type="button"
                onClick={() => field.onChange(platform.value)}
                className={`border rounded-lg p-4 flex flex-col items-center justify-center ${
                  field.value === platform.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                } transition-colors w-32 h-24`}
              >
                <img
                  src={platform.image || "/placeholder.svg"}
                  alt={platform.label}
                  className="h-8 w-8 object-contain mb-2"
                />
                <span className="text-sm font-medium">{platform.label}</span>
              </button>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
)

export const CredentialsFields = ({ form }: { form: any }) => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
      <FormField
        control={form.control}
        name="platform.project"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Id</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Aws Project Id" {...field} />
            </FormControl>
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
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {regions.map((reg) => (
                  <SelectItem key={reg.value} value={reg.value}>
                    {reg.label}
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
        name="credentials.validate"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 md:col-span-2">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Validate</FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  </div>
)

export const AdvancedSettingsFields = ({ form }: { form: any }) => (
  <div className="space-y-6">
    <div>
      <p className="text-sm text-muted-foreground mt-1">Provide optional Airflow configuration</p>
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <FormField
        control={form.control}
        name="advancedSettings.mwaa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>MWAA Ennironment</FormLabel>
            <FormControl>
              <Input placeholder="MWAA Envitronment" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <FormField
        control={form.control}
        name="advancedSettings.airflow"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Airflow Bucket Id</FormLabel>
            <FormControl>
              <Input placeholder="airflow id" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="advancedSettings.airflow_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Airflow Bucket Name</FormLabel>
            <FormControl>
              <Input placeholder="Airflow name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
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

