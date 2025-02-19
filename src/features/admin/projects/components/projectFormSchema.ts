import * as z from "zod"

export const projectFormSchema = z.object({
  projectName: z.string().min(2, "Project name must be at least 2 characters."),
  githubProvider: z.string().min(1, "Please select a provider."),
  githubUsername: z.string().min(1, "GitHub username is required."),
  githubEmail: z.string().email("Invalid email address."),
  defaultBranch: z.string().default("main"),
  githubRepositoryUrl: z.string().url("Please enter a valid GitHub URL."),
  githubToken: z.string().min(1, "GitHub token is required."),
  tags: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

export const githubProviders = [
  { label: "GitHub", value: "github" },
  { label: "GitHub Enterprise", value: "github-enterprise" },
] as const