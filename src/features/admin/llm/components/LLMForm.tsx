import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { llmFormSchema, LLMFormData } from "./llmFormSchema";
import {
  ModelNameField,
  ProviderField,
  ModelTypeField,
  EmbeddingConfigFields,
  ChatConfigFields,
  ApiKeyField,
} from "./FormFields";

interface LLMFormProps {
  initialData?: Partial<LLMFormData>;
  onSubmit: (data: LLMFormData) => Promise<void>;
  mode: "create" | "edit";
  isSubmitting: boolean;
  error: string | null;
}

export function LLMForm({
  initialData,
  onSubmit,
  mode,
  isSubmitting,
  error,
}: LLMFormProps) {
  const form = useForm<LLMFormData>({
    resolver: zodResolver(llmFormSchema),
    mode: "onChange",
    defaultValues: initialData || {
      model_name: "",
      provider: "",
      model_type: "chat",
      api_key: "",
      init_vector: "",
      embedding_config: {
        input_type: "text",
        max_tokens: 5000,
      },
      chat_config: {
        input_type: "text",
        max_tokens: 5000,
        temperature: 0.7,
        timeout: 120,
        max_retries: 3,
      },
    },
  });

  const modelType = form.watch("model_type");

  const handleSubmit = async (data: LLMFormData) => {
    await onSubmit(data);
  };

  const { watch } = form;

  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-none">
      <CardContent>
        <FormProvider {...form}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <ModelTypeField control={form.control} />
              <ProviderField control={form.control} modelType={watch("model_type")} />
              <ModelNameField 
                control={form.control} 
                modelType={watch("model_type")} 
                provider={watch("provider")}
              />

              {modelType === "embeddings" && (
                <EmbeddingConfigFields control={form.control} />
              )}
              {modelType === "chat" && (
                <ChatConfigFields control={form.control} />
              )}
              <ApiKeyField control={form.control} />
              
              <div className="flex justify-center">
                <Button
                  type="submit"
                  size="lg"
                  className={
                    isSubmitting
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-primary hover:bg-primary/90"
                  }
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {mode === "create"
                    ? "Create LLM Config"
                    : "Update LLM Config"}
                </Button>
              </div>
              
              {error && (
                <div className="text-sm text-red-500 text-center mt-2">
                  {error}
                </div>
              )}
            </form>
          </Form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}