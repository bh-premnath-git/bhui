import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { LLMForm } from './components/LLMForm';
import { LLMFormData, transformApiToLlmFormData, transformLlmFormToApiData } from './components/llmFormSchema';
import { ROUTES } from '@/config/routes';
import { useLlms } from './hooks/useLlms';
import { LlmPageLayout } from './components/LlmPageLayout';
import { encrypt_string } from '@/lib/encryption';

export function EditLlm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedLlm} = useAppSelector((state: RootState) => state.llms);

  const {
    handleUpdateLlm,
    llm: fetchedLLM,
    isLlmLoading,
    isLlmError
  } = useLlms({
    llmId: id,
  });

  const llm = selectedLlm || fetchedLLM;
  console.log("llm", llm)

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

const onSubmit = async (data: LLMFormData) => {
  try {
    setIsSubmitting(true);
    setError(null);

    const { encryptedString, initVector } = encrypt_string(data.api_key);

    // Convert form data to API schema
    const apiData = transformLlmFormToApiData({
      ...data,
      api_key: encryptedString,
    });

    // Keep only schema fields for update
    const updatePayload = {
      embedding_config: apiData.embedding_config,
      chat_config: apiData.chat_config,
      api_key: apiData.api_key,
      init_vector: initVector
    };
    

    if (id) {
      await handleUpdateLlm(id, updatePayload);
      navigate(ROUTES.ADMIN.LLM.INDEX);
    }
  } catch (err) {
    console.error("Failed to update LLM config:", err);
    setError(err instanceof Error ? err.message : "Failed to update LLM config");
  } finally {
    setIsSubmitting(false);
  }
};

  if (!selectedLlm && isLlmLoading) {
    return <div className="p-6">Loading LLM config...</div>;
  }

  if (!selectedLlm && isLlmError) {
    return <div className="p-6">LLM config not found</div>;
  }

  if (!llm) {
    return <div className="p-6">LLM config not found</div>;
  }

  const formInitialData = transformApiToLlmFormData(llm);

  return (
    <LlmPageLayout description="Edit your model configuration settings.">
      <LLMForm
        initialData={formInitialData}
        onSubmit={onSubmit}
        mode="edit"
        isSubmitting={isSubmitting}
        error={error}
      />
    </LlmPageLayout>
  );
}
