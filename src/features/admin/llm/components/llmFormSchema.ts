import * as z from "zod";
import { LLMMutationCreate, LLMMutationData } from "@/types/admin/llm";

// --- SCHEMA ---

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
        input_type: z.string().trim().min(1, "Input type is required"),
        max_tokens: z.coerce.number().min(1, "Enter a valid token limit."),
      })
      .optional(),

    chat_config: z
      .object({
        input_type: z.string().trim().min(1, "Input type is required"),
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
      if (!data.chat_config) {
        ctx.addIssue({
          path: ["chat_config"],
          message: "Chat config is required for chat model type.",
          code: z.ZodIssueCode.custom,
        });
        return;
      }

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
      if (!data.embedding_config) {
        ctx.addIssue({
          path: ["embedding_config"],
          message: "Embedding config is required for embeddings model type.",
          code: z.ZodIssueCode.custom,
        });
        return;
      }

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

export type LLMFormData = z.infer<typeof llmFormSchema>;

export const transformLlmFormToApiData = (
  formData: LLMFormData
): LLMMutationCreate => {
  const base: Record<string, any> = {
    llm_id: formData.llm_id ?? 0,
    llm_secret_url: formData.llm_secret_url ?? "",
    api_key: formData.api_key,
    init_vector: formData.init_vector,
  };

  // Always include both configs
  base.embedding_config = formData.embedding_config
    ? {
        input_type: formData.embedding_config.input_type,
        max_tokens: Number(formData.embedding_config.max_tokens),
      }
    : {
        input_type: "text",
        max_tokens: 5000,
      };

  base.chat_config = formData.chat_config
    ? {
        input_type: formData.chat_config.input_type,
        max_tokens: Number(formData.chat_config.max_tokens),
        temperature: Number(formData.chat_config.temperature),
        timeout: Number(formData.chat_config.timeout),
        max_retries: Number(formData.chat_config.max_retries),
      }
    : {
        input_type: "text",
        max_tokens: 5000,
        temperature: 0.1,
        timeout: 60,
        max_retries: 2,
      };

  return base as LLMMutationCreate;
};

// --- TRANSFORM FROM API FORMAT ---

export const transformApiToLlmFormData = (
  apiData: Partial<LLMMutationData>
): Partial<LLMFormData> => {
  const baseData: Partial<LLMFormData> = {
    llm_id: apiData.llm_id,
    model_name: apiData.model_name ?? "",
    provider: apiData.provider ?? "",
    model_type: apiData.model_type ?? "chat",
    api_key: apiData.api_key ?? "",
    init_vector: apiData.init_vector ?? "",
    llm_secret_url: apiData.llm_secret_url ?? "",
  };

  if (apiData.model_type === "embeddings" && apiData.embedding_config) {
    baseData.embedding_config = {
      input_type: apiData.embedding_config.input_type ?? "text",
      max_tokens: apiData.embedding_config.max_tokens ?? 5000,
    };
  }

  if (apiData.model_type === "chat" && apiData.chat_config) {
    baseData.chat_config = {
      input_type: apiData.chat_config.input_type ?? "text",
      max_tokens: apiData.chat_config.max_tokens ?? 5000,
      temperature: apiData.chat_config.temperature ?? 0.1,
      timeout: apiData.chat_config.timeout ?? 60,
      max_retries: apiData.chat_config.max_retries ?? 2,
    };
  }

  return baseData;
};
