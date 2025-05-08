import * as z from "zod"

export const formSchema = z.object({
    project: z.string({
        required_error: "Project is required",
    }),
    name: z.string().min(1, "Name is required"),
    notes: z.string().optional(),
})

export type FormValues = z.infer<typeof formSchema>