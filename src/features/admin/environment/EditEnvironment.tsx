import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EnvironmentForm } from './components/EnvironmentForm';
import { EnvironmentFormValues } from './components/environmentFormSchema';
import { useEnvironments } from './hooks/useEnvironments';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function EditEnvironment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { handleUpdateEnvironment, environments } = useEnvironments();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const environment = environments?.find(e => e.id === id);

  const onSubmit = async (data: EnvironmentFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (id) {
        //await handleUpdateEnvironment(id, data);
        navigate(ROUTES.ADMIN.ENVIRONMENT.INDEX);
      }
    } catch (error) {
      console.error('Failed to update environment:', error);
      setError(error instanceof Error ? error.message : 'Failed to update environment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!environment) {
    return <div className="p-6">Environment not found</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(ROUTES.ADMIN.ENVIRONMENT.INDEX)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Environments
      </Button>
      
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Edit Environment</h1>
        <EnvironmentForm
          mode="edit"
          initialData={environment}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    </div>
  );
}
