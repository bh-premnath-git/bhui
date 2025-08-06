import { useState } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { ROUTES } from "@/config/routes";
import { encrypt_string } from "@/lib/encryption";
import {
  LLMFormData,
  transformLlmFormToApiData,
} from "./components/llmFormSchema";
import { LlmPageLayout } from "./components/LlmPageLayout";
import { LLMForm } from "./components/LLMForm";
import { LLMMutationCreate } from "@/types/admin/llm";
import { useLlms } from "./hooks/useLlms";

export function AddLlm() {
  const { handleNavigation } = useNavigation();
  const { handleCreateLlm } = useLlms();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LLMFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Encrypt the API key
      const { encryptedString, initVector } = encrypt_string(data.api_key);

      // Convert form data to API payload
      const llmData = transformLlmFormToApiData({
        ...data,
        api_key: encryptedString,
      }) as LLMMutationCreate;

      // Send payload to backend
      await handleCreateLlm({
        ...llmData,
        init_vector: initVector,
      });
      
      handleNavigation(ROUTES.ADMIN.LLM.INDEX, {}, true);
    } catch (error) {
      console.error("Failed to create LLM:", error);
      setError("Failed to create LLM configuration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LlmPageLayout
      description="Configure your Large Language Model settings."
    >
      <LLMForm
        mode="create"
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </LlmPageLayout>
  );
}
