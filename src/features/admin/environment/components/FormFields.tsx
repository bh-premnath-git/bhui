import type React from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EnvironmentFormValues, environments, platforms, regions } from "./environmentFormSchema"
import { AddTagDialog } from "@/components/shared/AddTagDialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Control, useFormContext } from "react-hook-form"
import { ValidationButton, ValidationState } from "@/components/shared/ValidationButton"
import { useState, useEffect } from "react"
import { useAirflowEnvironment, useMwaaEnvironments } from "../hooks/useEnvironments"
import { useDebounce } from "@/hooks/useDebounce"

const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel>
    {children}
    <span className="text-red-500 ml-1">*</span>
  </FormLabel>
)

interface EnvironmentDetailsFieldsProps {
  control: Control<EnvironmentFormValues>;
  existingEnvironments?: Array<{ bh_env_name: string }>;
}

export const EnvironmentDetailsFields = ({ control, existingEnvironments = [] }: EnvironmentDetailsFieldsProps) => {
  const form = useFormContext<EnvironmentFormValues>();
  const [nameStatus, setNameStatus] = useState<"available" | "taken" | null>(null);

  // Debounce the environment name input to avoid excessive checks
  const envName = form.watch("environmentName");
  const debouncedEnvName = useDebounce(envName, 300);

  useEffect(() => {
    if (!debouncedEnvName?.trim()) {
      setNameStatus(null);
      return;
    }
    const exists = existingEnvironments.some(
      (env) => env.bh_env_name?.toLowerCase().trim() === debouncedEnvName.toLowerCase().trim()
    );
    setNameStatus(exists ? "taken" : "available");
  }, [debouncedEnvName, existingEnvironments]);

  return (
    <div className="space-y-3">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="environmentName"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>Environment Name</RequiredFormLabel>
              <FormControl>
                <Input placeholder="e.g. My Dev Env" {...field} />
              </FormControl>
              {nameStatus === "taken" && (
                <div className="text-red-500 text-sm mt-1">This environment name is already in use.</div>
              )}
              {nameStatus === "available" && (
                <div className="text-green-600 text-sm mt-1">This environment name is available.</div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="environment"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>Environment</RequiredFormLabel>
              <Select
                value={field.value?.toString() || ""}
                onValueChange={(val) => {
                  field.onChange(val);
                  field.onBlur();
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Environment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="z-[9999]">
                  {environments.map((env) => (
                    <SelectItem key={env.value} value={env.value}>
                      {env.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
// ...existing code...

export const PlatformFields = ({ control }: { control: Control<EnvironmentFormValues> }) => (
  <div className="space-y-1">
    <FormField
      control={control}
      name="platform.type"
      render={({ field }) => (
        <FormItem>
          <div className="flex gap-4">
            {platforms.map((platform) => (
              <button
                key={platform.value}
                type="button"
                onClick={() => {
                  if (platform.value !== "102") { 
                    field.onChange(platform.value);
                  }
                }}
                className={`border rounded-lg p-3 flex flex-col items-center justify-center ${field.value === platform.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
                  } transition-colors w-28 h-20 ${platform.value === "102" ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={platform.value === "102"}
              >
                <img
                  src={platform.image || "/placeholder.svg"}
                  alt={platform.label}
                  className="h-6 w-6 object-contain mb-1"
                />
                <span className="text-xs font-medium">{platform.label}</span>
              </button>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);


interface ValidateFieldsProps {
  control: Control<EnvironmentFormValues>
  onValidateToken: (data: EnvironmentFormValues) => Promise<void>
  isEditMode?: boolean
  isValidating: boolean
  isTokenValidated: boolean
}
export function CredentialsFields({
  control,
  onValidateToken,
  isEditMode = false,
  isValidating,
  isTokenValidated
}: ValidateFieldsProps) {
  const form = useFormContext<EnvironmentFormValues>();
  const [validationError, setValidationError] = useState<string | null>(null);
  const handleValidation = async () => {
    try {
      setValidationError(null);
      await onValidateToken(form.getValues());
    } catch (error) {
      setValidationError('Token failed. Please try again')
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="credentials.publicId"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>Project Id</RequiredFormLabel>
              <FormControl>
                <Input placeholder="e.g. Aws Project Id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="platform.region"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>Region</RequiredFormLabel>
              <Select
                value={field.value?.toString() || ""}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="z-[9999]">
                  {regions.map((reg) => (
                    <SelectItem key={reg.value} value={reg.value}>
                      {reg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="credentials.accessKey"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>Access Key</RequiredFormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="credentials.secretKey"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>Secret Key</RequiredFormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <div className="flex justify-end mt-1">
                <ValidationButton
                  onValidate={handleValidation}
                  isValidating={isValidating}
                  isValidated={isTokenValidated}
                  error={validationError}
                  onValidationChange={(state: ValidationState) => {
                    if (state === "not-validated") {
                      setValidationError('Token failed. Please try again');
                    }
                  }}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

      </div>
    </div>
  )
}

export const AdvancedSettingsFields = ({ control, isTokenValidated }: { control: Control<EnvironmentFormValues>, isTokenValidated: boolean }) => {
  const { getValues, setValue, watch } = useFormContext<EnvironmentFormValues>();
  const bhEnvName = getValues("environmentName");
  const region = getValues("platform.region");
  const airflowName = watch("advancedSettings.airflowName"); // Use watch to react to changes
  const regionLabel = regions.find((r) => r.value === region)?.label;

  const [mwaaQueryParams, setMwaaQueryParams] = useState<{ bh_env_name: string; location: string } | null>(null);

  useEffect(() => {
    if (isTokenValidated) {
      setMwaaQueryParams({
        bh_env_name: bhEnvName,
        location: regionLabel || "",
      });
    }
  }, [isTokenValidated, bhEnvName, regionLabel]);

  const { data: mwaaEnvironments } = useMwaaEnvironments({
    mwaaQueryParams: mwaaQueryParams ?? undefined,
  });

  // Only create airflowParams when all required values are present
  const airflowParams = bhEnvName && regionLabel && airflowName
    ? { 
        airflow_env_name: airflowName, 
        bh_env_name: bhEnvName, 
        location: regionLabel 
      }
    : null;
  
  // Use a safe approach that works with your existing hook implementation
  const { data: airflowData } = useAirflowEnvironment(
    airflowParams 
      ? { airflowParams } 
      : { airflowParams: null }
  );

  useEffect(() => {
    if (airflowData && 'SourceBucketArn' in airflowData) {
      const bucketArnParts = (airflowData as { SourceBucketArn: string }).SourceBucketArn.split(':');
      const bucketName = bucketArnParts[bucketArnParts.length - 1];
      
      setValue("advancedSettings.airflowBucketUrl", (airflowData as unknown as { WebserverUrl: string }).WebserverUrl || '');
      setValue("advancedSettings.airflowBucketName", bucketName || '');
    }
  }, [airflowData, setValue]);
  
  return (
    <div className="space-y-3">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="advancedSettings.airflowName"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>MWAA Environment</RequiredFormLabel>
              <Select
                value={field.value?.toString() || ""}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select MWAA Environment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="z-[9999]">
                  {mwaaEnvironments?.map((env, key) => (
                    <SelectItem key={key} value={env}>
                      {env}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="advancedSettings.airflowBucketUrl"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>Airflow URL</RequiredFormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="advancedSettings.airflowBucketName"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>Airflow Bucket Name</RequiredFormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

interface Tag {
  key: string
  value: string
}

export const TagsField = ({ control }: { control: Control<EnvironmentFormValues> }) => {
  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {field.value?.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-secondary rounded-md"
                >
                  <span>
                    {tag.key}: {tag.value}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => {
                      const newTags = [...field.value];
                      newTags.splice(index, 1);
                      field.onChange(newTags);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <AddTagDialog
              onAddTag={(key, value) => {
                field.onChange([...(field.value || []), { key, value }]);
              }}
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
