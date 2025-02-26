import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvironmentForm } from './components/EnvironmentForm';
import { EnvironmentFormValues } from './components/environmentFormSchema';
import { useEnvironments } from './hooks/useEnvironments';
import { ROUTES } from '@/config/routes';
import { EnvironmentPageLayout } from './components/EnvironmentPageLayout';
import { encrypt_string } from '@/services/encryption';
import { toast } from 'sonner';

export function AddEnvironment() {
  const navigate = useNavigate();
  const { handleCreateEnvironment, handleAWSValidation } = useEnvironments();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isTokenValidated, setIsTokenValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encryptedCredentials, setEncryptedCredentials] = useState<{
    accessKey: string;
    secretKey: string;
    initVector: string;
  } | null>(null);

  const handleValidate = async (data: EnvironmentFormValues) => {
    try {
      setIsValidating(true);
      setError(null);

      const { encryptedString, initVector } = encrypt_string(data.credentials.secretKey);
      const { encryptedString: encryptedString1 } = encrypt_string(data.credentials.accessKey, initVector);

      setEncryptedCredentials({
        accessKey: encryptedString1,
        secretKey: encryptedString,
        initVector
      });

      await handleAWSValidation(data.environmentName, {
          aws_access_key_id: encryptedString1,
          aws_secret_access_key: encryptedString,
          init_vector: initVector,
          location: data.platform.region
      });

      setIsTokenValidated(true);
      toast.success('Validation successful');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Validation failed');
      setIsTokenValidated(false);
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: EnvironmentFormValues) => {
    if (!isTokenValidated || !encryptedCredentials) {
      toast.error('Please validate credentials first');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = {
        bh_env_name: data.environmentName,
        bh_env_provider: parseInt(data.environment),
        cloud_provider_cd: data.platform.type === 'aws' ? 101 : 102,
        cloud_region_cd: parseInt(data.platform.region),
        project_id: data.credentials.publicId || '',
        access_key: encryptedCredentials.accessKey,
        secret_access_key: encryptedCredentials.secretKey,
        pvt_key: encryptedCredentials.initVector,
        airflow_url: data.advancedSettings?.airflowBucketUrl || '',
        airflow_bucket_name: data.advancedSettings?.airflowBucketName || '',
        airflow_env_name: data.advancedSettings?.airflowName || '',
        status: 'active',
        tags: JSON.stringify({ tagList: data.tags || [] })
      };

      await handleCreateEnvironment(formData);
      toast.success('Environment created successfully');
      navigate(ROUTES.ADMIN.ENVIRONMENT.INDEX);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create environment');
      toast.error('Failed to create environment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EnvironmentPageLayout description="Add New Environment">
      <div className="p-6">
        <EnvironmentForm 
          mode="create" 
          onSubmit={onSubmit}
          onValidate={handleValidate}
          isSubmitting={isSubmitting}
          isValidating={isValidating}
          isTokenValidated={isTokenValidated}
          error={error}
        />
      </div>
    </EnvironmentPageLayout>
  );
}