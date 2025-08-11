import * as z from "zod";

export const llmFormSchema = z
  .object({
    llm_id: z.number().optional(),
    model_name: z.string().trim().min(1, "Please select a model name"),
    provider: z.string().trim().min(1, "Please select a provider "),
    model_type: z.enum(["chat", "embeddings"], {
      required_error: "Please select a model type.",
    }),
    api_key: z.string().trim().nonempty("API Key is required"),
    init_vector: z.string().trim().optional(),
    llm_secret_url: z.string().optional(),
    embedding_config: z
      .object({
        input_type: z.enum(["text", "file"]),
        max_tokens: z.coerce.number().min(1, "Enter a valid token limit."),
      })
      .optional(),

    chat_config: z
      .object({
        input_type: z.enum(["text", "file"], {
          required_error: "Please select a input type.",
        }),
        max_tokens: z.coerce
          .number()
          .min(1, "Number must be greater than or equal to 1"),
        temperature: z.coerce
          .number()
          .min(0)
          .max(2, "temperature should be between 0 and 2"),
        timeout: z.coerce
          .number()
          .min(1, "Number must be greater than or equal to 1"),
        max_retries: z.coerce
          .number()
          .min(0, "Number must be greater than or equal to 0"),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.model_type === "chat") {
      // Validate chat config fields only when model_type is "chat"
      if (!data.chat_config) {
        ctx.addIssue({
          path: ["chat_config"],
          message: "Chat config is required for chat model type.",
          code: z.ZodIssueCode.custom,
        });
        return;
      }

      // Validate individual chat config fields
      if (!data.chat_config.input_type) {
        ctx.addIssue({
          path: ["chat_config", "input_type"],
          message: "Chat input type is required.",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.chat_config.max_tokens || data.chat_config.max_tokens < 1) {
        ctx.addIssue({
          path: ["chat_config", "max_tokens"],
          message: "Number must be greater than or equal to 1",
          code: z.ZodIssueCode.custom,
        });
      }

      if (
        data.chat_config.temperature === undefined ||
        data.chat_config.temperature < 0 ||
        data.chat_config.temperature > 2
      ) {
        ctx.addIssue({
          path: ["chat_config", "temperature"],
          message: "Temperature must be between 0 and 2",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.chat_config.timeout || data.chat_config.timeout < 1) {
        ctx.addIssue({
          path: ["chat_config", "timeout"],
          message: "Number must be greater than or equal to 1",
          code: z.ZodIssueCode.custom,
        });
      }

      if (
        data.chat_config.max_retries === undefined ||
        data.chat_config.max_retries < 0
      ) {
        ctx.addIssue({
          path: ["chat_config", "max_retries"],
          message: "Max retries must be 0 or greater",
          code: z.ZodIssueCode.custom,
        });
      }
    } else if (data.model_type === "embeddings") {
      // Changed from "embedding" to "embeddings"
      // Validate embedding config fields only when model_type is "embeddings"
      if (!data.embedding_config) {
        ctx.addIssue({
          path: ["embedding_config"],
          message: "Embedding config is required for embeddings model type.",
          code: z.ZodIssueCode.custom,
        });
        return;
      }

      // Validate individual embedding config fields
      if (!data.embedding_config.input_type) {
        ctx.addIssue({
          path: ["embedding_config", "input_type"],
          message: "Embedding input type is required.",
          code: z.ZodIssueCode.custom,
        });
      }

      if (
        !data.embedding_config.max_tokens ||
        data.embedding_config.max_tokens < 1
      ) {
        ctx.addIssue({
          path: ["embedding_config", "max_tokens"],
          message: "Enter a valid token limit.",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

// Infer TypeScript type from schema
export type LLMFormData = z.infer<typeof llmFormSchema>;

import { LLMMutationData } from "@/types/admin/llm";

export const transformLlmFormToApiData = (
  formData: LLMFormData
): LLMMutationData => {
  const base: Record<string, any> = {
    llm_id: formData.llm_id ?? 0,
    model_name: formData.model_name,
    model_type: formData.model_type,
    api_key: formData.api_key,
    init_vector: formData.init_vector,
    llm_secret_url: formData.llm_secret_url,
  };

  if (formData.model_type === "embeddings" && formData.embedding_config) {
    // Changed from "embedding" to "embeddings"
    base.embedding_config = {
      input_type: formData.embedding_config.input_type,
      max_tokens: Number(formData.embedding_config.max_tokens),
    };
  }

  if (formData.model_type === "chat" && formData.chat_config) {
    base.chat_config = {
      input_type: formData.chat_config.input_type,
      max_tokens: Number(formData.chat_config.max_tokens),
      temperature: Number(formData.chat_config.temperature),
      timeout: Number(formData.chat_config.timeout),
      max_retries: Number(formData.chat_config.max_retries),
    };
  }

  // Remove all undefined keys
  return Object.fromEntries(
    Object.entries(base).filter(([_, v]) => v !== undefined)
  ) as LLMMutationData;
};

// Convert API data to form format - FIXED VERSION
export const transformApiToLlmFormData = (
  apiData: Partial<LLMMutationData>
): Partial<LLMFormData> => {
  const baseData: Partial<LLMFormData> = {
    llm_id: apiData.llm_id,
    model_name: apiData.model_name || "",
    model_type: apiData.model_type || "chat",
    api_key: apiData.api_key || "",
    init_vector: apiData.init_vector || "",
    llm_secret_url: apiData.llm_secret_url || "",
  };

  // Only include the config that matches the model type
  if (apiData.model_type === "embeddings" && apiData.embedding_config) {
    // Changed from "embedding" to "embeddings"
    baseData.embedding_config = {
      input_type: (apiData.embedding_config.input_type === "text" || apiData.embedding_config.input_type === "file")
        ? apiData.embedding_config.input_type
        : "text",
      max_tokens: apiData.embedding_config.max_tokens ?? 10000,
    };
  } else if (apiData.model_type === "chat" && apiData.chat_config) {
    baseData.chat_config = {
      input_type: (apiData.embedding_config.input_type === "text" || apiData.embedding_config.input_type === "file")
        ? apiData.embedding_config.input_type
        : "text",
      max_tokens: apiData.chat_config.max_tokens ?? 0,
      temperature: apiData.chat_config.temperature ?? 0.7,
      timeout: apiData.chat_config.timeout ?? 30,
      max_retries: apiData.chat_config.max_retries ?? 3,
    };
  }

  return baseData;
};
