import { Prompt } from "@/types/admin/prompt"
import * as z from "zod"

// 1. Schema Definition
export const promptFormSchema = z.object({
  prompt_name: z.string().min(2, "Prompt name must be at least 2 characters."),
  module_id: z.string().min(1, "Please select a module."),
  prompt: z.string().min(10, "Prompt must be at least 10 characters."),
});

export type PromptFormValues = z.infer<typeof promptFormSchema>

// Available modules
export const modules = [
  { label: "xplorer", value: "1001" },
  { label: "description", value: "1002" },
  { label: "flow", value: "1003" },
  { label: "pipeline", value: "1004" },
  { label: "spark", value: "1005" },
  { label: "other", value: "1006" },
] as const;

// 2. Form to API transformer
export const transformFormToApiData = (formData: PromptFormValues): FormData => {
  const apiData: Prompt = {
    id: undefined,
    prompt_name: formData.prompt_name,
    module_id: Number(formData.module_id),
    module_name: modules.find((module) => module.value === formData.module_id)?.label || "",
    prompt: formData.prompt,
  };

  const data = new FormData();
  Object.entries(apiData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      data.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  });

  return data;
};

// 3. API to Form transformer
export const transformApiToFormData = (apiData: Prompt): PromptFormValues => {
  return {
    prompt_name: apiData.prompt_name,
    module_id: apiData.module_id.toString(),
    prompt: apiData.prompt,
  };
};


