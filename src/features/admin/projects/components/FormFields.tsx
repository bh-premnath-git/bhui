import type React from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { githubProviders } from "./projectFormSchema"
import { AddTagDialog } from "@/components/shared/AddTagDialog"

const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel>
    {children}
    <span className="text-red-500 ml-1">*</span>
  </FormLabel>
)

export const ProjectNameField = ({ form }: { form: any }) => (
  <FormField
    control={form.control}
    name="projectName"
    render={({ field }) => (
      <FormItem className="max-w-sm">
        <RequiredFormLabel>Project Name</RequiredFormLabel>
        <FormControl>
          <Input placeholder="Project Name" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

export const GithubFields = ({ form }: { form: any }) => (
  <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-4">
      <FormField
        control={form.control}
        name="githubProvider"
        render={({ field }) => (
          <FormItem>
            <RequiredFormLabel>Github Provider</RequiredFormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {githubProviders.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
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
        name="githubUsername"
        render={({ field }) => (
          <FormItem>
            <RequiredFormLabel>Github Username</RequiredFormLabel>
            <FormControl>
              <Input placeholder="Enter username" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="githubEmail"
        render={({ field }) => (
          <FormItem>
            <RequiredFormLabel>Github Email</RequiredFormLabel>
            <FormControl>
              <Input type="email" placeholder="user@github.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="defaultBranch"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Default Branch</FormLabel>
            <FormControl>
              <Input placeholder="main" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="githubRepositoryUrl"
        render={({ field }) => (
          <FormItem>
            <RequiredFormLabel>Github Repository URL</RequiredFormLabel>
            <FormControl>
              <Input placeholder="https://github.com/..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="githubToken"
        render={({ field }) => (
          <FormItem className="relative">
            <RequiredFormLabel>Github Token</RequiredFormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={() => form.setValue("githubToken", "")}>
                Validate
              </Button>
            </div>
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
            Add one or more tags to easily identify compute instances created by BigHammer.ai in your AWS account
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