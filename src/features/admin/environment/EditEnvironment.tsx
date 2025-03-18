import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "@/store";
import { useAppSelector } from "@/hooks/useRedux";
import { useEnvironments } from "./hooks/useEnvironments";
import { ROUTES } from '@/config/routes';
import { EnvironmentForm } from "./components/EnvironmentForm";
import type { EnvironmentMutationData, EnvironmentTags } from "@/types/admin/environment";
import type { EnvironmentFormValues } from "./components/environmentFormSchema";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EnvironmentPageLayout } from "./components/EnvironmentPageLayout";
import { encrypt_string } from "@/lib/encryption";
import { toast } from "sonner";

const transformEnvironmentToFormData = (environment: any): EnvironmentFormValues => {
  const transformedTags = Object.entries(environment.tags || {}).map(([key, value]) => ({
    key,
    value: value as string
  }));

  return {
    environmentName: environment.bh_env_name || '',
    environment: environment.bh_env_provider_name || '',
    platform: {
      type: environment.cloud_provider_name || '',
      region: environment.cloud_region_cd?.toString() || '',
      zone: environment.location || '',
    },
    credentials: {
      publicId: environment.project_id || '',
      accessKey: environment.access_key || '',
      secretKey: environment.secret_access_key || '',
      pvtKey: environment.pvt_key || '',
    },
    advancedSettings: {
      airflowName: environment.airflow_env_name || '',
      airflowBucketName: environment.airflow_bucket_name || '',
      airflowBucketUrl: environment.airflow_url || '',
    },
    tags: transformedTags.length ? transformedTags : []
  };
};

const transformFormToApiData = (data: EnvironmentFormValues, existingEnvironment: any): EnvironmentMutationData => {
  // Transform tags from form format to API format
  const tags: EnvironmentTags = {};
  data.tags.forEach(tag => {
    if (tag.key) {
      tags[tag.key] = tag.value || '';
    }
  });

  return {
    ...existingEnvironment,
    bh_env_name: data.environmentName,
    bh_env_provider_name: data.environment,
    cloud_provider_name: data.platform.type,
    cloud_region_cd: parseInt(data.platform.region) || existingEnvironment.cloud_region_cd || 0,
    location: data.platform.zone,
    access_key: data.credentials.accessKey,
    secret_access_key: data.credentials.secretKey,
    pvt_key: data.credentials.pvtKey,
    airflow_url: data.advancedSettings.airflowBucketUrl,
    airflow_bucket_name: data.advancedSettings.airflowBucketName,
    airflow_env_name: data.advancedSettings.airflowName,
    status: existingEnvironment.status || "active",
    tags,
    // Ensure these required fields are present
    created_at: existingEnvironment.created_at || null,
    updated_at: existingEnvironment.updated_at || null,
    created_by: existingEnvironment.created_by || null,
    updated_by: existingEnvironment.updated_by || null,
    is_deleted: existingEnvironment.is_deleted || false,
    deleted_by: existingEnvironment.deleted_by || null,
    bh_env_id: existingEnvironment.bh_env_id || 0,
    bh_env_provider: existingEnvironment.bh_env_provider || 0,
    cloud_provider_cd: existingEnvironment.cloud_provider_cd || 0,
    project_id: existingEnvironment.project_id || null,
    bh_project_id: existingEnvironment.bh_project_id || null
  };
};

export function EditEnvironment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedEnvironment } = useAppSelector((state: RootState) => state.environments);
  
  const {
    handleUpdateEnvironment,
    handleAWSValidation,
    environment: fetchedEnvironment,
    isEnvironmentLoading,
    isEnvironmentError,
  } = useEnvironments({
    environmentId: id, // Always use the ID from params to fetch
    shouldFetch: !!id && !selectedEnvironment, // Only fetch if ID exists and there's no selected environment
  });

  // Use selectedEnvironment if available, otherwise use fetched environment
  const environment = selectedEnvironment || fetchedEnvironment;
  
  // Transform environment data to form values format
  const [formInitialData, setFormInitialData] = useState<EnvironmentFormValues | undefined>(undefined);

  useEffect(() => {
    if (environment) {
      const transformedData = transformEnvironmentToFormData(environment);
      setFormInitialData(transformedData);
    }
  }, [environment]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isTokenValidated, setIsTokenValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encryptedCredentials, setEncryptedCredentials] = useState<{
    accessKey: string;
    secretKey: string;
    initVector: string;
    pvtKey?: string;
  } | null>(null);

  const handleValidate = async (data: EnvironmentFormValues) => {
    try {
      setIsValidating(true);
      setError(null);

      const { encryptedString, initVector } = encrypt_string(data.credentials.secretKey || "");
      const { encryptedString: encryptedString1 } = encrypt_string(data.credentials.accessKey || "", initVector);

      setEncryptedCredentials({
        accessKey: encryptedString1,
        secretKey: encryptedString,
        initVector,
      });

      const result = await handleAWSValidation(data.environmentName, {
        aws_access_key_id: encryptedString1,
        aws_secret_access_key: encryptedString,
        init_vector: initVector,
        location: data.platform.region || "",
      });

      setEncryptedCredentials((prev) => ({
        ...prev!,
        pvtKey: result.pvt_key,
      }));

      setIsTokenValidated(true);
      toast.success("Validation successful");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Validation failed");
      setIsTokenValidated(false);
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (formData: EnvironmentFormValues) => {
    if (!isTokenValidated || !encryptedCredentials) {
      toast.error("Please validate credentials first");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (id && environment) {
        const updatedFormData = {
          ...formData,
          credentials: {
            ...formData.credentials,
            accessKey: encryptedCredentials.accessKey,
            secretKey: encryptedCredentials.secretKey,
            pvtKey: encryptedCredentials.pvtKey,
          },
        };

        // Convert form data to API format
        const apiData = transformFormToApiData(updatedFormData, environment);
        
        // Call the update function with the ID and transformed data
        await handleUpdateEnvironment(id, apiData);
        
        toast.success("Environment updated successfully");
        navigate(ROUTES.ADMIN.ENVIRONMENT.INDEX);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update environment";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEnvironmentLoading) {
    return (
      <div className="p-6">
        <LoadingState className="w-40 h-40" />
      </div>
    );
  }

  if (isEnvironmentError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Error Loading Environment"
          description="There was an error loading the environment. Please try again later."
        />
      </div>
    );
  }

  if (!environment) {
    return (
      <div className="p-6">
        <ErrorState title="Environment Not Found" description="The requested environment could not be found." />
      </div>
    );
  }

  return (
    <EnvironmentPageLayout description="Modify environment details and configuration">
      <div className="p-6">
        {formInitialData && (
          <EnvironmentForm
            initialData={formInitialData}
            onSubmit={onSubmit}
            onValidate={handleValidate}
            mode="edit"
            isSubmitting={isSubmitting}
            isValidating={isValidating}
            isTokenValidated={isTokenValidated}
            error={error}
          />
        )}
      </div>
    </EnvironmentPageLayout>
  );
}