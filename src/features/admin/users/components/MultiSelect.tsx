import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { RequiredFormLabel } from "./FormFields"
import type { SelectOption } from "./userFormSchema"

interface MultiSelectProps {
  form: any
  name: string
  label: string
  placeholder: string
  options: SelectOption[]
}

export const MultiSelect = ({ form, name, label, placeholder, options }: MultiSelectProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className="flex flex-col">
        {label && <RequiredFormLabel>{label}</RequiredFormLabel>}
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-start h-auto min-h-[2.5rem] font-normal",
                  !field.value?.length && "text-muted-foreground"
                )}
              >
                <div className="flex gap-1 flex-wrap">
                  {field.value?.length > 0 ? (
                    field.value.map((value: string) => {
                      const option = options.find((o) => o.value === value)
                      return option ? (
                        <Badge key={option.value} variant="secondary" className="rounded-sm px-1 font-normal">
                          {option.label}
                          <span
                            role="button"
                            tabIndex={0}
                            className="ml-1 ring-offset-background rounded-sm opacity-50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                const newValue = field.value.filter((v: string) => v !== option.value)
                                form.setValue(name, newValue)
                              }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              const newValue = field.value.filter((v: string) => v !== option.value)
                              form.setValue(name, newValue)
                            }}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {option.label}</span>
                          </span>
                        </Badge>
                      ) : null
                    })
                  ) : (
                    <span>{placeholder}</span>
                  )}
                </div>
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder={`Search ${name}...`} />
              <ScrollArea className="h-48">
                <CommandList>
                  <CommandEmpty>No {name} found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        value={option.label}
                        key={option.value}
                        onSelect={() => {
                          const currentValue = field.value || []
                          const newValue = currentValue.includes(option.value)
                            ? currentValue.filter((value: string) => value !== option.value)
                            : [...currentValue, option.value]
                          form.setValue(name, newValue)
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            field.value?.includes(option.value)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <X className="h-4 w-4" />
                        </div>
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </ScrollArea>
            </Command>
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )}
  />
)
