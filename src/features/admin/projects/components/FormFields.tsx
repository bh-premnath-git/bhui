import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Project } from '@/types/admin/project';
import { X, Loader2, Check } from "lucide-react"
import { Control, useFormContext } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type ProjectFormData } from "./projectFormSchema"
import { useGithubProviders } from "@/hooks/useGithubProviders"
import { AddTagDialog } from "@/components/shared/AddTagDialog"
import { RequiredFormLabel } from "@/components/shared/RequiredFormLabel"
import { ValidationButton, ValidationState } from "@/components/shared/ValidationButton"
import { useState } from "react"

export const ProjectNameField = ({ control,
  searchedProject,
  searchLoading,
  projectNotFound,
  onNameChange,
  isEditMode = false
}: {
  control: Control<ProjectFormData>;
  searchedProject?: Project | null;
  searchLoading?: boolean;
  projectNotFound?: boolean;
  onNameChange?: (name: string) => void;
  isEditMode?: boolean
}) => (
  <FormField
    control={control}
    name="bh_project_name"
    render={({ field }) => (
      <FormItem className="max-w-sm">
        <RequiredFormLabel>Project Name</RequiredFormLabel>
        <FormControl>
          <Input
            placeholder="Project Name"
            {...field}
            onChange={(e) => {
              field.onChange(e);
              if (!isEditMode && onNameChange) {
                onNameChange(e.target.value);
              }
            }}
          />
        </FormControl>
        {searchLoading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Checking availability...
          </div>
        )}
        {searchedProject && !projectNotFound && !isEditMode && (
          <div className="flex items-center text-sm text-destructive">
            <X className="h-4 w-4 mr-2" />
            Project name already in use, Try another one.
          </div>
        )}
        {projectNotFound && !isEditMode && (
          <div className="flex items-center text-sm text-green-600">
            <Check className="h-4 w-4 mr-2" />
            Project name is available.
          </div>
        )}
        <FormMessage />
      </FormItem>
    )}
  />
)

interface GithubFieldsProps {
  control: Control<ProjectFormData>
  onValidateToken: (data: ProjectFormData) => Promise<void>
  isEditMode?: boolean
  isValidating: boolean
  isTokenValidated: boolean
}

export function GithubFields({
  control,
  onValidateToken,
  isEditMode = false,
  isValidating,
  isTokenValidated
}: GithubFieldsProps) {
  const { providers, isLoading, error: providersError } = useGithubProviders();
  const form = useFormContext<ProjectFormData>();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Watch all required fields for validation button state
  const watchedFields = form.watch([
    "bh_github_provider",
    "bh_github_username", 
    "bh_github_email",
    "bh_default_branch",
    "bh_github_url",
    "bh_github_token_url"
  ]);

  // Check if all required fields are filled
  const areAllFieldsFilled = watchedFields.every(field => field && field.trim() !== "");

  const handleValidation = async () => {
    try {
      setValidationError(null);
      await onValidateToken(form.getValues());
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Failed to validate token');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <FormField
          control={control}
          name="bh_github_provider"
          render={({ field }) => {
            const provider = providers?.find(p => p.value === field.value || p.label === field.value);
            const value = provider?.value;
            return (
              <FormItem>
                <RequiredFormLabel>GitHub Provider</RequiredFormLabel>
                <Select onValueChange={field.onChange} value={value}>
                  <FormControl>
                    <SelectTrigger>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select Provider" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {providersError ? (
                      <div className="p-2 text-sm text-destructive">Failed to load providers</div>
                    ) : (
                      providers?.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={control}
          name="bh_github_username"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>GitHub Username</RequiredFormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} disabled={isEditMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bh_github_email"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>GitHub Email</RequiredFormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} disabled={isEditMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bh_default_branch"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>Default Branch</RequiredFormLabel>
              <FormControl>
                <Input placeholder="main" {...field} disabled={isEditMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="bh_github_url"
          render={({ field }) => (
            <FormItem>
              <RequiredFormLabel>GitHub URL</RequiredFormLabel>
              <FormControl>
                <Input placeholder="https://github.com/username/repo" {...field} disabled={isEditMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bh_github_token_url"
          render={({ field }) => (
            <FormItem className="relative">
              <RequiredFormLabel>GitHub Token</RequiredFormLabel>
              <FormControl>
                <Input type="password" placeholder={isEditMode ? "••••••••••••••••" : "Enter token"} 
                {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Validation button row - aligned with token field */}
      <div className="grid gap-4 md:grid-cols-2">
        <div></div> {/* Empty space to align with URL field */}
        <div className="flex justify-end">
          <ValidationButton
            onValidate={handleValidation}
            isValidating={isValidating}
            isValidated={isTokenValidated}
            error={validationError}
            disabled={!areAllFieldsFilled}
            onValidationChange={(state: ValidationState) => {
              if (state === 'not-validated') {
                setValidationError('Validation failed. Please check your token and try again.');
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

interface Tag {
  key: string
  value: string
}

export const TagsField = ({ control }: { control: Control<ProjectFormData> }) => {
  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <div className="space-y-4">
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