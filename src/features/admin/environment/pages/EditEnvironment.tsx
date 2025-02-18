
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { EnvironmentForm } from '../components/EnvironmentForm';
import { EnvironmentMutationData } from '../types/environment.types';
import { useEnvironments } from '../hooks/useEnvironments';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function EditEnvironment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { handleUpdateEnvironment, environments } = useEnvironments();
  
  const environment = environments?.find(e => e.id === id);

  const onSubmit = async (data: EnvironmentMutationData) => {
    try {
      if (id) {
        await handleUpdateEnvironment(id, data);
        navigate(ROUTES.ADMIN.ENVIRONMENT.INDEX);
      }
    } catch (error) {
      console.error('Failed to update environment:', error);
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
          initialData={environment}
          onSubmit={onSubmit}
          onCancel={() => navigate(ROUTES.ADMIN.ENVIRONMENT.INDEX)}
        />
      </div>
    </div>
  );
}

export default withPageErrorBoundary(EditEnvironment, 'EditEnvironment');
