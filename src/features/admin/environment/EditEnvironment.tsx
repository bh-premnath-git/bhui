import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import { useEnvironments } from "./hooks/useEnvironments";
import { ROUTES } from '@/config/routes';
import { EnvironmentForm } from "./components/EnvironmentForm";
import { LazyLoading } from "@/components/shared/LazyLoading";
import { ErrorState } from "@/components/shared/ErrorState";
import { EnvironmentPageLayout } from "./components/EnvironmentPageLayout";
import { encrypt_string } from "@/lib/encryption";
import { toast } from "sonner";
import { EnvironmentFormValues, transforFormToAPiData, transformApiDataToForm } from "@/features/admin/environment/components/environmentFormSchema";

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
    environmentId: id,
    shouldFetch: !!id && !selectedEnvironment,
  });

  const environment = selectedEnvironment || fetchedEnvironment;
  console.log("environment", environment);
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

  const formData = environment ? transformApiDataToForm(environment) : undefined;

  const handleValidate = async (data: EnvironmentFormValues) => {
    try {
      setIsValidating(true);
      setError(null);

      const { encryptedString: encryptedSecret, initVector } = encrypt_string(data.credentials.secretKey || "");
      const { encryptedString: encryptedAccess } = encrypt_string(data.credentials.accessKey || "", initVector);

      setEncryptedCredentials({
        accessKey: encryptedAccess,
        secretKey: encryptedSecret,
        initVector,
      });

      const result = await handleAWSValidation(data.environmentName, {
        aws_access_key_id: encryptedAccess,
        aws_secret_access_key: encryptedSecret,
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

      const updatedFormData: EnvironmentFormValues = {
        ...formData,
        credentials: {
          ...formData.credentials,
          accessKey: encryptedCredentials.accessKey,
          secretKey: encryptedCredentials.secretKey,
          pvtKey: encryptedCredentials.pvtKey,
          init_vector: encryptedCredentials.initVector,
        },
      };

      const apiData = transforFormToAPiData(updatedFormData);
      await handleUpdateEnvironment(id!, apiData);

      toast.success("Environment updated successfully");
      navigate(ROUTES.ADMIN.ENVIRONMENT.INDEX);
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
        <LazyLoading fullScreen={false} className="w-40 h-40" />
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
      <div className="p-3">
        {formData && (
          <EnvironmentForm
            initialData={formData}
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