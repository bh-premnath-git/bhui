import { EnvironmentMutationData } from "@/types/admin/environment"
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
    publicId: z.string().optional(),
    accessKey: z.string().optional(),
    secretKey: z.string().optional(),
    pvtKey: z.string().optional(),
    init_vector: z.string().optional(),
  }),
  advancedSettings: z.object({
    airflowName: z.string().optional(),
    airflowBucketName: z.string().optional(),
    airflowBucketUrl: z.string().optional(),
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
});

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

export const transforFormToAPiData = (formData: EnvironmentFormValues ): FormData => {
  const apiData: EnvironmentMutationData = {
    bh_env_name: formData.environmentName,
    bh_env_provider: Number(formData.environment),
    cloud_provider_cd: Number(formData.platform.type),
    cloud_region_cd: Number(formData.platform.region),
    access_key: formData.credentials.accessKey,
    secret_access_key: formData.credentials.secretKey,
    project_id: formData.credentials.publicId,
    pvt_key: formData.credentials.pvtKey,
    init_vector: formData.credentials.init_vector,
    airflow_url: formData.advancedSettings.airflowBucketUrl,
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


export const transformApiDataToForm = (apiData: EnvironmentMutationData): EnvironmentFormValues => {
  const formData: Partial<EnvironmentFormValues> = {
    environmentName: apiData.bh_env_name,
    environment: apiData.bh_env_provider.toString(),
    platform: {
      type: apiData.cloud_provider_cd.toString(),
      region: apiData.cloud_region_cd.toString(),
    },
    credentials: {
      publicId: apiData.project_id,
      accessKey: apiData.access_key,
      secretKey: apiData.secret_access_key,
      pvtKey: apiData.pvt_key,
    },
    advancedSettings:{
      airflowName: apiData.airflow_env_name,
      airflowBucketName: apiData.airflow_bucket_name,
      airflowBucketUrl: apiData.airflow_url,
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


