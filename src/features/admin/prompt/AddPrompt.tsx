import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Prompt } from "@/types/admin/prompt";
import { PromptPageLayout } from "./components/PromptPagaLayout";
import { PromptForm } from "./components/PromptForm";
import { usePrompts } from "./hooks/usePrompt";
import { modules } from "./components/promptFromSchema";

interface Module {
  value: string | number;
  label: string;
}

export function AddPrompt() {
  const navigate = useNavigate();
  const { handleCreatePrompt } = usePrompts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const onSubmit = async (data: { prompt_name?: string; module_id?: string; prompt?: string }) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const selectedModule = modules.find(mod => mod.value.toString() === data.module_id?.toString());
      const promptData: Prompt = {
        id: undefined,
        prompt_name: data.prompt_name || "",
        module_id: parseInt(data.module_id || "0"),
        module_name: selectedModule?.label || "",
        prompt: data.prompt || "",
      };
      await handleCreatePrompt(promptData);
      navigate(ROUTES.ADMIN.PROMPT.INDEX);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prompt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PromptPageLayout description="Create and modifiy the BH-AI prompt">
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <PromptForm
            onSubmit={onSubmit}
            mode="create"
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </PromptPageLayout>
  );
}