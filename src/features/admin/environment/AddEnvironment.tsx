import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvironmentForm } from './components/EnvironmentForm';
import { EnvironmentFormValues } from './components/environmentFormSchema';
import { useEnvironments } from './hooks/useEnvironments';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { EnvironmentPageLayout } from './components/EnvironmentPageLayout';

export function AddEnvironment() {
  const navigate = useNavigate();
  const { handleCreateEnvironment } = useEnvironments({ shouldFetch: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: EnvironmentFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      //await handleCreateEnvironment(data);
      navigate(ROUTES.ADMIN.ENVIRONMENT.INDEX);
    } catch (error) {
      console.error('Failed to create environment:', error);
      setError(error instanceof Error ? error.message : 'Failed to create environment');
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
          isSubmitting={isSubmitting} 
          error={error} 
        />
      </div>
    </EnvironmentPageLayout>
  );
}