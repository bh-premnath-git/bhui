import type React from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Control } from "react-hook-form"
import { modules, PromptFormValues } from "./promptFromSchema"
import { RichTextEditor } from '@/components/RichTextEditor'

const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel>
    {children}
    <span className="text-red-500 ml-1">*</span>
  </FormLabel>
)

export const PromptDetailsFields = ({ control }: { control: Control<PromptFormValues> }) => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
      <FormField
        control={control}
        name="prompt_name"
        render={({ field }) => (
          <FormItem>
            <RequiredFormLabel>Prompt Name</RequiredFormLabel>
            <FormControl>
              <Input placeholder="e.g. sql_agent" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="module_id"
        render={({ field }) => (
          <FormItem>
            <RequiredFormLabel>Module</RequiredFormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Module" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.isArray(modules) && modules.map((mod) => (
                  <SelectItem key={mod.value} value={mod.value}>
                    {mod.label}
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

export const PromptInputFields = ({ control }: { control: Control<PromptFormValues> }) => (
  <div className="space-y-6">
    <FormField
      control={control}
      name="prompt"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Prompt</RequiredFormLabel>
          <FormControl>
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              markdownMode={true}
              placeholder="Write your prompt here..."
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
)