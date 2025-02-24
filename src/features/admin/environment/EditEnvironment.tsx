import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "@/store";
import { useAppSelector } from "@/hooks/uaeRedux";
import { useEnvironments } from "./hooks/useEnvironments";
import { ROUTES } from '@/config/routes';
import { EnvironmentForm } from "./components/EnvironmentForm";
import type { EnvironmentMutationData, EnvironmentTags } from "@/types/admin/environment";
import type { EnvironmentFormValues } from "./components/environmentFormSchema";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EnvironmentPageLayout } from "./components/EnvironmentPageLayout";

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
      accessKey: environment.access_key || '',
      secretKey: environment.secret_access_key || '',
      token: environment.pvt_key || '',
    },
    advancedSettings: {
      vpc: environment.airflow_url || '',
      subnet: environment.airflow_bucket_name || '',
      securityGroup: environment.airflow_env_name || '',
    },
    tags: transformedTags,
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

  // Merge with existing data to ensure we have all required fields
  return {
    // Keep existing values for fields we don't update
    ...existingEnvironment,
    // Update the fields from the form
    bh_env_name: data.environmentName,
    bh_env_provider_name: data.environment,
    cloud_provider_name: data.platform.type,
    cloud_region_cd: parseInt(data.platform.region) || existingEnvironment.cloud_region_cd || 0,
    location: data.platform.zone,
    access_key: data.credentials.accessKey,
    secret_access_key: data.credentials.secretKey,
    pvt_key: data.credentials.token,
    airflow_url: data.advancedSettings.vpc,
    airflow_bucket_name: data.advancedSettings.subnet,
    airflow_env_name: data.advancedSettings.securityGroup,
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
    environment: fetchedEnvironment,
    isEnvironmentLoading,
    isEnvironmentError
  } = useEnvironments({ 
    environmentId: selectedEnvironment?.bh_env_id ? undefined : id,
  });
  
  // Use selectedEnvironment if available, otherwise use fetched environment
  const environment = selectedEnvironment || fetchedEnvironment;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (formData: EnvironmentFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (id && environment) {
        const apiData = transformFormToApiData(formData, environment);
        await handleUpdateEnvironment(id, apiData);
        navigate(ROUTES.ADMIN.ENVIRONMENT.INDEX);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update environment');
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
        <ErrorState
          title="Environment Not Found"
          description="The requested environment could not be found."
        />
      </div>
    );
  }

  const formInitialData = transformEnvironmentToFormData(environment);

  return (
    <EnvironmentPageLayout description="Modify environment details and configuration">
      <div className="p-6">
        <EnvironmentForm
          initialData={formInitialData}
          onSubmit={onSubmit}
          mode="edit"
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    </EnvironmentPageLayout>
  );
}
