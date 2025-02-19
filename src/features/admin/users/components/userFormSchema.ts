import * as z from "zod"

export const userFormSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters."),
  last_name: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  enabled: z.boolean().default(true),
  projects: z.array(z.string()).min(1, "Select at least one project."),
  realm_roles: z.array(z.string()).min(1, "Select at least one role."),
})

export type UserFormValues = z.infer<typeof userFormSchema>

export interface SelectOption {
  label: string
  value: string
}

export const projects: SelectOption[] = [
  { label: "Project 1", value: "project1" },
  { label: "Project 2", value: "project2" },
  { label: "Project 3", value: "project3" },
]

export const roles: SelectOption[] = [
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" },
  { label: "Viewer", value: "viewer" },
]
