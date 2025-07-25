import * as z from "zod"
import { ProjectMutationData } from "@/types/admin/project"

// Form schema with validation rules
export const projectFormSchema = z.object({
  bh_project_name: z.string().trim().min(1, "Project name is required."),
  bh_github_provider: z.string().min(1, "Please select a provider."),
  bh_github_username: z.string().trim().min(1, "GitHub username is required."),
  bh_github_email: z.string().trim().email("Invalid email address"),
  bh_default_branch: z.string().default("main"),
  bh_github_url: z.string().trim().url("Please enter a valid GitHub URL."),
  bh_github_token_url: z.string().trim().min(1, "GitHub token is required."),
  tags: z
    .array(
      z.object({
        key: z.string().trim(),
        value: z.string().trim(),
      })
    )
    .default([]),
  status: z.enum(["active", "inactive"]).default("active")
})

// Type for form data with validation
export type ProjectFormData = z.infer<typeof projectFormSchema>

// Transform form data to API data
export const transformFormToApiData = (formData: ProjectFormData): ProjectMutationData => {
  const apiData: ProjectMutationData = {
    bh_project_name: formData.bh_project_name,
    bh_github_provider: parseInt(formData.bh_github_provider),
    bh_github_username: formData.bh_github_username,
    bh_github_email: formData.bh_github_email,
    bh_default_branch: formData.bh_default_branch,
    bh_github_url: formData.bh_github_url,
    bh_github_token_url: formData.bh_github_token_url,
    status: formData.status
  };

  if (formData.tags && formData.tags.length > 0) {
    apiData.tags = {
      tagList: JSON.stringify(formData.tags)
    };
  }

  return apiData;
}

// Transform API data to form data
export const transformApiToFormData = (apiData: Partial<ProjectMutationData>): Partial<ProjectFormData> => {
  const formData: Partial<ProjectFormData> = {
    bh_project_name: apiData.bh_project_name,
    bh_github_provider: apiData.bh_github_provider?.toString(),
    bh_github_username: apiData.bh_github_username,
    bh_github_email: apiData.bh_github_email,
    bh_default_branch: apiData.bh_default_branch,
    bh_github_url: apiData.bh_github_url,
    bh_github_token_url: apiData.bh_github_token_url,
    status: apiData.status || "active",
    tags: []
  };

  // Handle tags properly
  if (apiData.tags?.tagList) {
    try {
      // Handle case where tagList might be a string or already an array
      const tagList = typeof apiData.tags.tagList === 'string' 
        ? JSON.parse(apiData.tags.tagList)
        : apiData.tags.tagList;

      if (Array.isArray(tagList)) {
        formData.tags = tagList.map(tag => ({
          key: tag?.key || '',
          value: tag?.value || ''
        }));
      }
    } catch (error) {
      console.error('Failed to parse tags:', error);
      formData.tags = [];
    }
  } else {
    formData.tags = [];
  }

  return formData;
}