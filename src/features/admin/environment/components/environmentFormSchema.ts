import { EnvironmentMutationData, EnvironmentWithAirflow, Environment } from "@/types/admin/environment"
import * as z from "zod"

export const environmentFormSchema = z.object({
  environmentName: z.string().trim().min(1, "Environment name is required."),
  environment: z.string().min(1, "Please select an environment."),
  platform: z.object({
    type: z.string().min(1, "Please select a platform."),
    region: z.string(),
    zone: z.string().optional(),
  }),
  credentials: z.object({
    publicId: z.string().trim().optional(),
    accessKey: z.string().trim().optional(),
    secretKey: z.string().trim().optional(),
    pvtKey: z.string().optional(),
    init_vector: z.string().optional(),
  }),
  advancedSettings: z.object({
    airflowName: z.string().optional(),
    airflowBucketName: z.string().optional(),
    airflowBucketUrl: z.string().optional(),
    airflowEnvType: z.string().optional(),
  }),
  tags: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
  status: z.enum(["active", "inactive"]).default("active"),
}).superRefine((data, ctx) => {
  // If AWS is selected (platform type "101"), validate required fields
  if (data.platform.type === "101") {
    if (!data.platform.region) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a region.",
        path: ["platform", "region"]
      });
    }
    if (!data.credentials.publicId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project ID is required.",
        path: ["credentials", "publicId"]
      });
    }
    if (!data.credentials.accessKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Access Key is required.",
        path: ["credentials", "accessKey"]
      });
    }
    if (!data.credentials.secretKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Secret Key is required.",
        path: ["credentials", "secretKey"]
      });
    }
    if (!data.advancedSettings.airflowName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "MWAA Environment is required.",
        path: ["advancedSettings", "airflowName"]
      });
    }
    if (!data.advancedSettings.airflowBucketName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Airflow Bucket Name is required.",
        path: ["advancedSettings", "airflowBucketName"]
      });
    }
    if (!data.advancedSettings.airflowBucketUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Airflow URL is required.",
        path: ["advancedSettings", "airflowBucketUrl"]
      });
    }
  }
});

export type EnvironmentFormValues = z.infer<typeof environmentFormSchema>

export const environments = [
  { label: "Development", value: "development" },
  { label: "Staging", value: "staging" },
  { label: "Production", value: "production" },
] as const

export const platforms = [
  { label: "AWS", value: "AWS", image: "/assets/environments/aws.svg" },
  { label: "GCP", value: "GCP", image: "/assets/environments/google.svg" },
] as const

export const regions = [
  { label: "us-east-1", value: "us-east-1" },
  { label: "us-west-1", value: "us-west-1" },
  { label: "eu-central-1", value: "eu-central-1" },
] as const

export const transforFormToAPiData = (formData: EnvironmentFormValues ): FormData => {
  const apiData: EnvironmentMutationData = {
    bh_env_name: formData.environmentName,
    bh_env_type: formData.environment,
    cloud_provider: formData.platform.type,
    cloud_region: formData.platform.region,
    access_key: formData.credentials.accessKey,
    secret_access_key: formData.credentials.secretKey,
    project_id: formData.credentials.publicId,
    pvt_key: formData.credentials.pvtKey,
    init_vector: formData.credentials.init_vector,
    airflow_env_type: "AWSMWAA",
    airflow_env_url: formData.advancedSettings.airflowBucketUrl,
    airflow_bucket_name: formData.advancedSettings.airflowBucketName,
    airflow_env_name: formData.advancedSettings.airflowName,
    status: formData.status,
    tags: {
      tagList: "[]",
    },
  }

   const data = new FormData();
   Object.entries(apiData).forEach(([key, value]) => {
     if (value !== undefined) {
       // For nested objects like tags, stringify them
       const valueToAppend = typeof value === "object" ? JSON.stringify(value) : value;
       data.append(key, valueToAppend);
     }
   });
 
   return data;
 };


export const transformApiDataToForm = (apiData: EnvironmentWithAirflow | Environment | any): EnvironmentFormValues => {
  const airflow = (apiData as EnvironmentWithAirflow).bh_airflow?.[0]
  const formData: Partial<EnvironmentFormValues> = {
    environmentName: apiData.bh_env_name,
    environment: apiData.bh_env_type,
    platform: {
      type: apiData.cloud_provider?.toUpperCase() || "",
      region:
        (apiData as EnvironmentWithAirflow).aws_cloud_details?.cloud_region ||
        (apiData as any).cloud_region ||
        "",
    },
    credentials: {
      publicId: (apiData as any).project_id || "",
      accessKey: (apiData as any).access_key || "",
      secretKey: (apiData as any).secret_access_key || "",
      pvtKey: (apiData as any).pvt_key || "",
    },
    advancedSettings:{
      airflowName: airflow?.airflow_env_name || (apiData as any).airflow_env_name || "",
      airflowBucketName:
        airflow?.airflow_bucket_name || (apiData as any).airflow_bucket_name || "",
      airflowBucketUrl: airflow?.airflow_env_url || (apiData as any).airflow_url || "",
      airflowEnvType: airflow?.airflow_env_type || "",
    },
    status: apiData.status || 'active',
  }
  if (apiData.tags?.tagList) {
    try{
      const tagList = typeof apiData.tags.tagList === "string" 
      ? JSON.parse(apiData.tags.tagList) 
      : apiData.tags.tagList;

      if (Array.isArray(tagList)) {
        formData.tags = tagList.map(tag => ({
          key: tag?.key || '',
          value: tag?.value || '',
        }));
      }
    } catch (e) {
      console.error("Failed to parsing tags", e)
      formData.tags = [];
    }
  } else {
    formData.tags = [];
  }
  return formData
}


