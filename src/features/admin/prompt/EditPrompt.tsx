import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "@/store";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { ROUTES } from '@/config/routes';
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { toast } from "sonner";
import { modules, PromptFormValues } from "./components/promptFromSchema";
import { Prompt } from "@/types/admin/prompt";
import { usePrompts } from "./hooks/usePrompt";
import { PromptPageLayout } from "./components/PromptPagaLayout";
import { PromptForm } from "./components/PromptForm";
import { setSelectedPrompt } from "@/store/slices/admin/promptsSlice";

// This function now uses the correct field names
const transformPromptToFormData = (prompt: any): PromptFormValues => {
  return {
    prompt_name: prompt.prompt_name || '',
    module_id: prompt.module_id?.toString() || '',
    prompt: prompt.prompt || '',
  };
};

const transformFormToApiData = (data: PromptFormValues, existingPrompt: any): Prompt => {
  const selectedModule = modules.find(mod => mod.value.toString() === data.module_id?.toString());
  return {
    ...existingPrompt,
    prompt_name: data.prompt_name,
    module_id: data.module_id,
    module_name: selectedModule?.label || "",
    prompt: data.prompt,
    created_at: existingPrompt.created_at || null,
    updated_at: existingPrompt.updated_at || null,
    created_by: existingPrompt.created_by || null,
    updated_by: existingPrompt.updated_by || null,
    is_deleted: existingPrompt.is_deleted || false,
    deleted_by: existingPrompt.deleted_by || null,
  };
};

export function EditPrompt() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  console.log("id", id);
  
  
  const {
    handleUpdatePrompt,
    isLoading: isPromptLoading,
    isError: isPromptError,
    prompt: fetchedPrompt,
  } = usePrompts({
    promptId: id,
    shouldFetch: !!id, // Always fetch the prompt when ID is available
  });

  // Use fetched prompt as the source of truth
  const prompt = fetchedPrompt && fetchedPrompt.length > 0 
  ? fetchedPrompt.find(p => p.id.toString() === id) 
  : null;
  
  // Update Redux store when fetched prompt changes
  useEffect(() => {
    if (fetchedPrompt && fetchedPrompt.length > 0) {
      dispatch(setSelectedPrompt(fetchedPrompt[0]));
    }
  }, [fetchedPrompt, dispatch]);
  
  // Transform prompt data to form values format
  const [formInitialData, setFormInitialData] = useState<PromptFormValues | undefined>(undefined);
 
  useEffect(() => {
    if (prompt) {
      const transformedData = transformPromptToFormData(prompt);
      setFormInitialData(transformedData);
    }
  }, [id, prompt]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const onSubmit = async (formData: PromptFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (id && prompt) {
        // Convert form data to API format
        const apiData = transformFormToApiData(formData, prompt);
        
        // Call the update function with the ID and transformed data
        await handleUpdatePrompt(id, apiData);
        
        // Update the selected prompt in Redux store
        dispatch(setSelectedPrompt({...prompt, ...apiData}));
        
        toast.success("Prompt updated successfully");
        navigate(ROUTES.ADMIN.PROMPT.INDEX);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update prompt";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPromptLoading) {
    return (
      <div className="p-6">
        <LoadingState className="w-40 h-40" />
      </div>
    );
  }

  if (isPromptError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Error Loading Prompt"
          description="There was an error loading the prompt. Please try again later."
        />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="p-6">
        <ErrorState title="Prompt Not Found" description="The requested prompt could not be found." />
      </div>
    );
  }

  return (
    <PromptPageLayout description="Modify environment details and configuration">
      <div className="p-3">
        {formInitialData && (
          <PromptForm
            initialData={formInitialData}
            onSubmit={onSubmit}
            mode="edit"
            isSubmitting={isSubmitting}
            error={error}
          />
        )}
      </div>
    </PromptPageLayout>
  );
}