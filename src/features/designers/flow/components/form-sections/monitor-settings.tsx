import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import type { UseFormReturn } from "react-hook-form"
import type { FlowFormValues } from "../schema"

interface MonitorSettingsProps {
  form: UseFormReturn<FlowFormValues>
}

export function MonitorSettings({ form }: MonitorSettingsProps) {
  return (
    <div className="grid gap-6">
      <FormField
        control={form.control}
        name="monitorSettings.recipientEmails"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">Recipient Email IDs</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {field.value.emails?.map((email: string) => (
                <Badge key={email} variant="secondary" className="cursor-pointer gap-1">
                  {email}
                  <X
                    className="h-3 w-3"
                    onClick={() => {
                      const updatedEmails = field.value.emails?.filter((e: string) => e !== email) || []
                      field.onChange({ emails: updatedEmails })
                    }}
                  />
                </Badge>
              ))}
            </div>
            <FormControl>
              <Input
                placeholder="Enter email and press Enter or comma to add"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault()
                    const newEmail = e.currentTarget.value.trim()
                    if (newEmail && newEmail.includes("@") && !field.value.emails?.includes(newEmail)) {
                      field.onChange({ emails: [...(field.value.emails || []), newEmail] })
                      e.currentTarget.value = ""
                    }
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <div className="mb-2 font-medium">Alert Settings</div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["onJobStart", "onJobFailure", "onJobSuccess", "delayed"] as const).map((setting) => (
            <FormField
              key={setting}
              control={form.control}
              name={`monitorSettings.alertSettings.${setting}`}
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0 capitalize">{setting.replace(/([A-Z])/g, " $1").trim()}</FormLabel>
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
