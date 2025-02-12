/**
 * @file schema.ts
 *
 * Defines a Zod validation schema and TypeScript types for our Environment form.
 */
import { z } from "zod";

/**
 * Zod schema for validating Environment form data.
 *
 * Fields:
 * - `environmentName`, `projectId`, etc. are required strings.
 * - Some fields (`accessKey`, `secretAccessKey`) are optional in general,
 *   but might be required depending on `selectedPlatform`.
 * - `.superRefine()` handles cross-field logic.
 */
export const environmentSchema = z
  .object({
    environmentName: z.string().min(1, "Environment name is required"),
    environment: z.string().min(1, "Environment is required"),
    projectId: z.string().min(1, "Project ID is required"),
    location: z.string().min(1, "Location is required"),

    accessKey: z.string().optional(),
    secretAccessKey: z.string().optional(),
    privateKeyFile: z.instanceof(File).or(z.null()).optional(),

    airflowUrl: z.string().optional(),
    airflowDagBucket: z.string().optional(),
    selectedPlatform: z.string().min(1, "Platform is required"),
    selectedMwaaEnv: z.string().nullable().optional(),

    awsPvtKey: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // ------------------------------------------------------------------
    // AWS: Check if credentials are provided if platform is AWS
    // ------------------------------------------------------------------
    if (data.selectedPlatform === "aws") {
      if (!data.accessKey?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Access Key is required for AWS",
          path: ["accessKey"],
        });
      }
      if (!data.secretAccessKey?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Secret Access Key is required for AWS",
          path: ["secretAccessKey"],
        });
      }
    }

    // ------------------------------------------------------------------
    // GCP: Check if private key file is provided if platform is GCP
    // ------------------------------------------------------------------
    if (data.selectedPlatform === "google-cloud") {
      if (!data.privateKeyFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Private Key File is required for Google Cloud",
          path: ["privateKeyFile"],
        });
      }
    }
  });

/**
 * TypeScript type that matches the shape of the Zod schema.
 */
export type EnvironmentFormValues = z.infer<typeof environmentSchema>;
