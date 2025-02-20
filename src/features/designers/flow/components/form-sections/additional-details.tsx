"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import type { UseFormReturn } from "react-hook-form"
import type { FlowFormValues } from "../schema"

interface AdditionalDetailsProps {
  form: UseFormReturn<FlowFormValues>
}

export function AdditionalDetails({ form }: AdditionalDetailsProps) {
  const [inputValue, setInputValue] = React.useState("")

  return (
    <FormField
      control={form.control}
      name="additionalDetails.tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-purple-600">Add Notes</FormLabel>
          <p className="text-sm text-muted-foreground mb-4">Add tags to help organize and identify your flows</p>
          <div className="flex gap-2 mb-2">
            <FormControl>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter tag and press Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (inputValue.trim() && !field.value.includes(inputValue.trim())) {
                      field.onChange([...field.value, inputValue.trim()])
                      setInputValue("")
                    }
                  }
                }}
              />
            </FormControl>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                if (inputValue.trim() && !field.value.includes(inputValue.trim())) {
                  field.onChange([...field.value, inputValue.trim()])
                  setInputValue("")
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {field.value.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => field.onChange(field.value.filter((t) => t !== tag))}
              >
                {tag}
                <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
        </FormItem>
      )}
    />
  )
}