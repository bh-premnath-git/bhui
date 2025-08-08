import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { LLMForm } from './components/LLMForm';
import { LLMFormData, transformApiToLlmFormData, transformLlmFormToApiData } from './components/llmFormSchema';
import { ROUTES } from '@/config/routes';
import { useLlms } from './hooks/useLlms';
import { setSelectedLlm } from '@/store/slices/admin/llmSlice';
import { LlmPageLayout } from './components/LlmPageLayout';
import { encrypt_string } from '@/lib/encryption';
import { LLMMutationUpdate } from '@/types/admin/llm';

export function EditLlm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedLlm} = useAppSelector((state: RootState) => state.llms);

  const {
    handleUpdateLlm,
    llm: fetchedLLM,
    isLlmLoading,
    isLlmError
  } = useLlms({
    llmId: selectedLlm?.llm_id ? undefined : id,
  });

  const llm = selectedLlm || fetchedLLM;

  useEffect(() => {
    if (!selectedLlm && fetchedLLM?.llm_id) {
      dispatch(setSelectedLlm(fetchedLLM));
    }
  }, [fetchedLLM?.llm_id]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LLMFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

     const { encryptedString, initVector } = encrypt_string(data.api_key);

       const apiData = transformLlmFormToApiData({
             ...data,
             api_key: encryptedString,
           });
     
      if (id) {
        await handleUpdateLlm(id, {
          ...apiData,
         init_vector: initVector
          
        });
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
