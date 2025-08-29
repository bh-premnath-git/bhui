import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvironmentForm } from './components/EnvironmentForm';
import { EnvironmentFormValues, transforFormToAPiData } from './components/environmentFormSchema';
import { useEnvironments } from './hooks/useEnvironments';
import { ROUTES } from '@/config/routes';
import { EnvironmentPageLayout } from './components/EnvironmentPageLayout';
import { encrypt_string } from '@/lib/encryption';
import { toast } from 'sonner';

export function AddEnvironment() {
  const navigate = useNavigate();
  const { handleCreateEnvironment, handleAWSValidation, environments } = useEnvironments();
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

      const { encryptedString, initVector } = encrypt_string(data.credentials.secretKey);
      const { encryptedString: encryptedString1 } = encrypt_string(data.credentials.accessKey, initVector);

      setEncryptedCredentials({
        accessKey: encryptedString1,
        secretKey: encryptedString,
        initVector
      });

      const result = await handleAWSValidation(data.environmentName, {
          aws_access_key_id: encryptedString1,
          aws_secret_access_key: encryptedString,
          init_vector: initVector,
          location: data.platform.region
      });
      setEncryptedCredentials(prop => ({
        ...prop, 
        pvtKey: result.pvt_key
      }))

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
      
      setError(null);
      
      const environmentData = transforFormToAPiData({
        ...data, 
        credentials:{
          publicId: data.credentials.publicId,
          accessKey: encryptedCredentials.accessKey,
          secretKey: encryptedCredentials.secretKey,
          init_vector: encryptedCredentials.initVector,
          pvtKey: encryptedCredentials.pvtKey
        }
      })

      await handleCreateEnvironment(environmentData);
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
        <EnvironmentForm 
          mode="create" 
          onSubmit={onSubmit}
          onValidate={handleValidate}
          isSubmitting={isSubmitting}
          isValidating={isValidating}
          isTokenValidated={isTokenValidated}
          error={error}
          existingEnvironments={environments}
        />
    </EnvironmentPageLayout>
  );
}