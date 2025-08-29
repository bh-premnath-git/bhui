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
import { useLlmOptions } from "./hooks/useLlmOptions";

export function AddLlm() {
  const { handleNavigation } = useNavigation();
  const { handleCreateLlm } = useLlms();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch providers for both model types
  const { providers: chatProviders } = useLlmOptions({
    modelType: 'chat'
  });
  const { providers: embeddingProviders } = useLlmOptions({
    modelType: 'embeddings'
  });

  const onSubmit = async (data: LLMFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Get the appropriate providers based on model type
      const providers = data.model_type === 'chat' ? chatProviders : embeddingProviders;

      // Find the provider ID based on the selected provider name
      const selectedProvider = providers.find(
        (provider) => provider.name === data.provider
      );

      console.log("Selected provider:", selectedProvider);

      
      // Encrypt the API key
      const { encryptedString, initVector } = encrypt_string(data.api_key);

      // Convert form data to API payload, keeping provider as string name
      const llmData = transformLlmFormToApiData({
        ...data,
        api_key: encryptedString,
      }) as LLMMutationCreate;

      console.log("Final payload:", {
        ...llmData,
        llm_id: selectedProvider.id,
        init_vector: initVector,
      });

      // Send payload to backend with provider_id added
      await handleCreateLlm({
        ...llmData,
        llm_id: selectedProvider.id, // Add provider ID to the final payload
        init_vector: initVector,
      });
      
      handleNavigation(ROUTES.ADMIN.LLM.INDEX, {}, true);
    } catch (error) {
      console.error("Failed to create LLM:", error);
      setError(
        error instanceof Error 
          ? error.message 
          : "Failed to create LLM configuration. Please try again."
      );
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