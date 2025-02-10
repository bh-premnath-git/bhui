import {
    Command,
    CommandList,
    CommandGroup,
    CommandEmpty,
    CommandItem,
    CommandInput,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react";

type SelectOption = {
    label: string
    value: string
}

export function CommandMultiSelect<T extends SelectOption>({
    options,
    value,
    onChange,
    placeholder = "Search...",
    displayChips = true,
}: {
    options: T[]
    value: T[]
    onChange: (newValue: T[]) => void
    placeholder?: string
    displayChips?: boolean
}) {
    const [search, setSearch] = useState("")
    const filtered = options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
    )

    const toggleItem = (item: T) => {
        const exists = value.some((v) => v.value === item.value)
        if (exists) {
            onChange(value.filter((v) => v.value !== item.value))
        } else {
            onChange([...value, item])
        }
    }

    return (
        <Command className="border rounded-md">
            <CommandInput placeholder={placeholder} onValueChange={setSearch} />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                    {filtered.map((item) => {
                        const checked = value.some((v) => v.value === item.value)
                        return (
                            <CommandItem
                                key={item.value}
                                onSelect={() => toggleItem(item)}
                                className="flex items-center"
                            >
                                <Checkbox
                                    className="mr-2"
                                    checked={checked}
                                    onCheckedChange={() => toggleItem(item)}
                                />
                                {item.label}
                            </CommandItem>
                        )
                    })}
                </CommandGroup>
            </CommandList>
            {displayChips && value.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2">
                    {value.map((opt) => (
                        <div
                            key={opt.value}
                            className="flex items-center space-x-1 rounded-full bg-gray-100 px-2 py-1 text-sm"
                        >
                            <span>{opt.label}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(value.filter((v) => v.value !== opt.value))
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </Command>
    )
}