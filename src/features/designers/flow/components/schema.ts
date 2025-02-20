import * as z from "zod"

export const basicInformationSchema = z.object({
  project: z.string().min(1, "Project is required"),
  environment: z.string().min(1, "Environment is required"),
  flowName: z.string().min(1, "Flow name is required"),
})

export const additionalDetailsSchema = z.object({
  tags: z.array(z.string()),
})

export const monitorSettingsSchema = z.object({
  recipientEmails: z.array(z.string().email("Please enter a valid email address")),
  alertSettings: z.object({
    onJobStart: z.boolean().default(false),
    onJobFailure: z.boolean().default(true),
    onJobSuccess: z.boolean().default(false),
    delayed: z.boolean().default(false),
  }),
})

export const flowFormSchema = z.object({
  basicInformation: basicInformationSchema,
  additionalDetails: additionalDetailsSchema,
  monitorSettings: monitorSettingsSchema,
})

export type FlowFormValues = z.infer<typeof flowFormSchema>

