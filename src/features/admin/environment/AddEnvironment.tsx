import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvironmentForm } from './components/EnvironmentForm';
import { EnvironmentFormValues } from './components/environmentFormSchema';
import { useEnvironments } from './hooks/useEnvironments';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
        <h1 className="text-2xl font-semibold">Add New Environment</h1>
        <EnvironmentForm 
          mode="create" 
          onSubmit={onSubmit} 
          isSubmitting={isSubmitting} 
          error={error} 
        />
      </div>
    </div>
  );
}