import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequiredFormLabel } from "@/components/shared/RequiredFormLabel";
import { type LLMFormData } from "./llmFormSchema";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLlmOptions } from "@/features/admin/llm/hooks/useLlmOptions";

// Model Type
export const ModelTypeField = ({
  control,
}: {
  control: Control<LLMFormData>;
}) => (
  <FormField
    control={control}
    name="model_type"
    render={({ field }) => (
      <FormItem>
        <RequiredFormLabel>Model Type</RequiredFormLabel>
        <FormControl>
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="embeddings">Embeddings</SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
      </FormItem>
    )}
  />
);

// Provider Field
export const ProviderField = ({
  control,
  modelType,
}: {
  control: Control<LLMFormData>;
  modelType?: "chat" | "embeddings";
}) => {
  const { providers, loading, error } = useLlmOptions({ modelType });
  return (
    <FormField
      control={control}
      name="provider"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>LLM Provider</RequiredFormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                {loading.providers ? (
                  <span className="text-muted-foreground">Loading...</span>
                ) : (
                  <SelectValue placeholder="Select LLM Provider" />
                )}
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {error.providers ? (
                <div className="p-2 text-sm text-destructive">
                  Failed to load LLM providers
                </div>
              ) : (
                providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.name}>
                    {provider.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};

// Model Name Field
export const ModelNameField = ({
  control,
  modelType,
  provider,
}: {
  control: Control<LLMFormData>;
  modelType?: "chat" | "embeddings";
  provider?: string;
}) => {
  const { modelNames, loading, error } = useLlmOptions({ modelType, provider });

  return (
    <FormField
      control={control}
      name="model_name"
      rules={{ required: "Please select a model name" }}
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Model Name</RequiredFormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={!modelType || !provider || loading.models}
          >
            <FormControl>
              <SelectTrigger>
                {loading.models ? (
                  <span className="text-muted-foreground">Loading...</span>
                ) : (
                  <SelectValue
                    placeholder={
                      !provider
                        ? "Select Provider first"
                        : modelType === "chat"
                        ? "Select Chat Model"
                        : "Select Embedding Model"
                    }
                  />
                )}
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {error.models ? (
                <div className="p-2 text-sm text-destructive">
                  Failed to load models
                </div>
              ) : (
                modelNames.map((model) => (
                  <SelectItem key={model.id} value={model.name}>
                    {model.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};

// Embedding Config
export const EmbeddingConfigFields = ({
  control,
}: {
  control: Control<LLMFormData>;
}) => (
  <div className="grid gap-4 md:grid-cols-2">
    <FormField
      control={control}
      name="embedding_config.input_type"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Embedding Input Type</RequiredFormLabel>
          <FormControl>
            <Input
              placeholder="Enter input type (e.g. text)"
              {...field}
            />
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="embedding_config.max_tokens"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Max Tokens</RequiredFormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  </div>
);

// Chat Config
export const ChatConfigFields = ({
  control,
}: {
  control: Control<LLMFormData>;
}) => (
  <div className="grid gap-4 md:grid-cols-3">
    <FormField
      control={control}
      name="chat_config.input_type"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Chat Input Type</RequiredFormLabel>
          <FormControl>
            <Input
              placeholder="Enter input type (e.g. text)"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="chat_config.max_tokens"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Max Tokens</RequiredFormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="chat_config.temperature"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Temperature</RequiredFormLabel>
          <FormControl>
            <Input type="number" step="0.1" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="chat_config.timeout"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Timeout (sec)</RequiredFormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="chat_config.max_retries"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Max Retries</RequiredFormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  </div>
);

// API Key Field
export const ApiKeyField = ({ control }: { control: Control<LLMFormData> }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={control}
      name="api_key"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>API Key</RequiredFormLabel>
          <FormControl>
            <div className="relative">
              <Input
                placeholder="Enter API Key"
                type={showPassword ? "text" : "password"}
                {...field}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
