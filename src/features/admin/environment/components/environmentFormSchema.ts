import * as z from "zod"

export const environmentFormSchema = z.object({
  environmentName: z.string().min(2, "Environment name must be at least 2 characters."),
  environment: z.string().min(1, "Please select an environment."),
  platform: z.object({
    type: z.string().min(1, "Please select a platform."),
    region: z.string().optional(),
    zone: z.string().optional(),
  }),
  credentials: z.object({
    accessKey: z.string().optional(),
    secretKey: z.string().optional(),
    token: z.string().optional(),
  }),
  advancedSettings: z.object({
    vpc: z.string().optional(),
    subnet: z.string().optional(),
    securityGroup: z.string().optional(),
  }),
  tags: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
})

export type EnvironmentFormValues = z.infer<typeof environmentFormSchema>

export const environments = [
  { label: "Development", value: "301" },
  { label: "Staging", value: "304" },
  { label: "Production", value: "305" },
] as const

export const platforms = [
  { label: "AWS", value: "101", image: "/assets/environments/aws.svg" },
  { label: "GCP", value: "102", image: "/assets/environments/google.svg" },
] as const

export const regions = [
  { label: "us-east-1", value: "2" },
  { label: "us-west-1", value: "3" },
  { label: "eu-central-1", value: "18" },
] as const

